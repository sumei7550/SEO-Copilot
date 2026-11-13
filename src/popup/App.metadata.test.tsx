// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackExtension } from '../analytics';
import type { SeoResult } from '../types/seo';
import type { AuditIntent, AuditIntentClaim } from './auditIntent';
import { App } from './App';

vi.mock('../analytics', () => ({ trackExtension: vi.fn() }));

const A = 'https://a.example/';
const B = 'https://b.example/';
const THUNDERBIT = 'https://thunderbit.com/';
const report = (url: string): SeoResult => ({
  page: { url, title: 'Audited page', metaDescription: 'Description', titleTagCount: 1, headings: [], images: [], canonical: url, schemas: [], invalidSchemaCount: 0, wordCount: 400, textRatio: .3 },
  metrics: { h1Count: 0, h2Count: 0, h3Count: 0, imageCount: 0, auditableImageCount: 0, imagesWithoutAlt: 0, altCoverage: 100, schemaTypes: [], wordCount: 400, textRatio: .3 },
  issues: [], score: 90, grade: 'excellent', categoryScores: { title: 15, meta: 15, heading: 15, images: 15, content: 15, technical: 25 },
  categoryWeights: { title: 15, meta: 15, heading: 15, images: 15, content: 15, technical: 25 }, scannedAt: 1
});
const intent = (url = A): AuditIntent => ({ id: 'one-time-1', tabId: 1, windowId: 2, url });

let container: HTMLDivElement;
let root: Root;
let currentTab: chrome.tabs.Tab;
let claimResponse: AuditIntentClaim;
let announce!: (message: { type?: string }) => void;
let activated!: (info: chrome.tabs.OnActivatedInfo) => void;
let updated!: (tabId: number, change: chrome.tabs.OnUpdatedInfo) => void;
let sendScan: ReturnType<typeof vi.fn>;

async function flush() { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); }); }
async function mount() { await act(async () => root.render(<App />)); await flush(); }

beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  currentTab = { id: 1, windowId: 2, url: A, status: 'complete' } as chrome.tabs.Tab;
  claimResponse = { ok: false };
  sendScan = vi.fn().mockResolvedValue({ ok: true, result: report(A) });
  vi.stubGlobal('chrome', {
    tabs: {
      query: vi.fn().mockImplementation(async () => [currentTab]),
      get: vi.fn().mockImplementation(async () => currentTab),
      sendMessage: sendScan,
      onActivated: { addListener: vi.fn((listener) => { activated = listener; }), removeListener: vi.fn() },
      onUpdated: { addListener: vi.fn((listener) => { updated = listener; }), removeListener: vi.fn() },
      onRemoved: { addListener: vi.fn(), removeListener: vi.fn() }
    },
    scripting: { executeScript: vi.fn() },
    permissions: { contains: vi.fn().mockResolvedValue(false), request: vi.fn().mockResolvedValue(true) },
    runtime: {
      sendMessage: vi.fn().mockImplementation(async (message: { type: string }) => message.type === 'CLAIM_AUDIT_INTENT' ? claimResponse : undefined),
      onMessage: { addListener: vi.fn((listener) => { announce = listener; }), removeListener: vi.fn() }
    },
    storage: { local: { get: vi.fn().mockResolvedValue({}), set: vi.fn().mockResolvedValue(undefined) } }
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe('Popup to Side Panel Audit handoff', () => {
  it('reuses a valid Popup snapshot without starting a second scan', async () => {
    claimResponse = { ok: true, intent: intent() };
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(async (message: { type: string }) => {
      if (message.type === 'CLAIM_AUDIT_INTENT') return claimResponse;
      if (message.type === 'SNAPSHOT_GET') return { ok: true, generation: 2, result: report(A) };
      return undefined;
    });
    await mount();
    expect(sendScan).not.toHaveBeenCalled();
    expect(container.textContent).toContain('SEO score');
  });

  it('hides a same-URL report as soon as the page enters loading', async () => {
    claimResponse = { ok: true, intent: intent() };
    await mount();
    expect(container.textContent).toContain('SEO score');
    currentTab = { ...currentTab, status: 'loading' };
    await act(async () => updated(1, { status: 'loading' }));
    expect(container.textContent).not.toContain('SEO score');
    currentTab = { ...currentTab, status: 'complete' };
    await act(async () => updated(1, { status: 'complete' }));
    await flush();
    expect(container.textContent).toContain('Scan current page');
  });

  it('consumes one intent and auto scans with activeTab without requesting persistent site access', async () => {
    claimResponse = { ok: true, intent: intent() };
    await mount();
    expect(sendScan).toHaveBeenCalledOnce();
    expect(sendScan).toHaveBeenCalledWith(1, { type: 'SCAN_PAGE' });
    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(container.textContent).toContain('SEO score');
    expect(container.textContent).toContain('SEO report');
    expect(container.textContent).toContain('Re-scan page');
    expect(vi.mocked(trackExtension).mock.calls.filter(([event]) => event === 'ext_scan_started')).toHaveLength(1);
    expect(vi.mocked(trackExtension).mock.calls.filter(([event]) => event === 'ext_scan_completed')).toHaveLength(1);
  });

  it('rescans the same page using the existing tab access without a site permission prompt', async () => {
    claimResponse = { ok: true, intent: intent() };
    await mount();
    const rescan = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Re-scan page'))!;
    await act(async () => rescan.click());
    await flush();
    expect(sendScan).toHaveBeenCalledTimes(2);
    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(vi.mocked(trackExtension).mock.calls.filter(([event]) => event === 'ext_scan_started')).toHaveLength(2);
    expect(vi.mocked(trackExtension).mock.calls.filter(([event]) => event === 'ext_scan_completed')).toHaveLength(2);
  });

  it('keeps Popup activeTab access across / to /pricing to /resources on the same tab and origin', async () => {
    currentTab = { id: 1, windowId: 2, url: THUNDERBIT, status: 'complete' } as chrome.tabs.Tab;
    claimResponse = { ok: true, intent: intent(THUNDERBIT) };
    sendScan.mockImplementation(async () => ({ ok: true, result: report(currentTab.url!) }));
    await mount();
    for (const path of ['/pricing', '/resources']) {
      currentTab = { ...currentTab, url: `${THUNDERBIT.slice(0, -1)}${path}` };
      await act(async () => updated(1, { url: currentTab.url }));
      await flush();
      expect(container.textContent).toContain('Scan current page');
      // Navigation can remove the content script; injection should use activeTab.
      sendScan.mockRejectedValueOnce(new Error('Receiving end does not exist'));
      const scan = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Scan current page'))!;
      await act(async () => scan.click());
      await flush();
      expect(container.textContent).toContain('SEO score');
      expect(chrome.permissions.request).not.toHaveBeenCalled();
      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({ target: { tabId: 1 }, files: ['content.js'] });
    }
    expect(sendScan).toHaveBeenCalledTimes(5);
    expect(chrome.scripting.executeScript).toHaveBeenCalledTimes(2);
    expect(vi.mocked(trackExtension).mock.calls.filter(([event]) => event === 'ext_scan_completed')).toHaveLength(3);
  });

  it('does not reuse the temporary grant after a cross-origin navigation', async () => {
    currentTab = { id: 1, windowId: 2, url: THUNDERBIT, status: 'complete' } as chrome.tabs.Tab;
    claimResponse = { ok: true, intent: intent(THUNDERBIT) };
    sendScan.mockImplementation(async () => ({ ok: true, result: report(currentTab.url!) }));
    await mount();
    currentTab = { ...currentTab, url: B };
    await act(async () => updated(1, { url: B }));
    await flush();
    const scan = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Scan current page'))!;
    await act(async () => scan.click());
    await flush();
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['https://b.example/*'] });
    expect(sendScan).toHaveBeenCalledTimes(2);
  });

  it('keeps the site permission request for a first manual scan', async () => {
    await mount();
    const scan = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Scan current page'))!;
    await act(async () => scan.click());
    await flush();
    expect(chrome.permissions.request).toHaveBeenCalledOnce();
    expect(sendScan).toHaveBeenCalledOnce();
  });

  it('requests site access on retry if tab access has expired during Rescan', async () => {
    claimResponse = { ok: true, intent: intent() };
    await mount();
    sendScan.mockRejectedValueOnce(new Error('Could not establish connection'));
    vi.mocked(chrome.scripting.executeScript).mockRejectedValueOnce(new Error('Cannot access contents of url'));
    const rescan = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Re-scan page'))!;
    await act(async () => rescan.click());
    await flush();
    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Scan failed');
    const retry = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Try again'))!;
    await act(async () => retry.click());
    await flush();
    expect(chrome.permissions.request).toHaveBeenCalledOnce();
    expect(sendScan).toHaveBeenCalledTimes(3);
  });

  it('handles an intent while the panel is already open and ignores a repeated announcement', async () => {
    await mount();
    claimResponse = { ok: true, intent: intent() };
    await act(async () => announce({ type: 'AUDIT_INTENT_AVAILABLE' }));
    await flush();
    await act(async () => announce({ type: 'AUDIT_INTENT_AVAILABLE' }));
    await flush();
    expect(sendScan).toHaveBeenCalledOnce();
    await act(async () => activated({ tabId: 1, windowId: 2 }));
    await flush();
    expect(sendScan).toHaveBeenCalledOnce();
  });

  it('does not scan a changed page and keeps manual Scan available', async () => {
    currentTab = { id: 1, windowId: 2, url: B, status: 'complete' } as chrome.tabs.Tab;
    claimResponse = { ok: true, intent: intent(A) };
    await mount();
    expect(sendScan).not.toHaveBeenCalled();
    expect(container.textContent).toContain('The page changed before the audit could start');
    expect(container.textContent).toContain('Scan current page');
  });

  it('shows a clear fallback when temporary access is gone, then permits manual retry', async () => {
    claimResponse = { ok: true, intent: intent() };
    sendScan.mockRejectedValueOnce(new Error('Could not establish connection'));
    vi.mocked(chrome.scripting.executeScript).mockRejectedValueOnce(new Error('Cannot access contents of url'));
    await mount();
    expect(container.textContent).toContain('Page access is no longer available');
    expect(chrome.permissions.request).not.toHaveBeenCalled();
    const retry = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Try again'))!;
    await act(async () => retry.click());
    await flush();
    expect(chrome.permissions.request).toHaveBeenCalledOnce();
    expect(sendScan).toHaveBeenCalledTimes(2);
  });
});
