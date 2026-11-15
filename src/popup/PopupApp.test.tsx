// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopupApp } from './PopupApp';
import { previewResult } from './previewResult';
import { analyzePage } from '../analyzer/pageAnalyzer';
import { evaluateRules, seoRules } from '../rules/seoRules';

const url = 'https://example.com/';
let container: HTMLDivElement;
let root: Root;
let tab: chrome.tabs.Tab;
let executeScript: ReturnType<typeof vi.fn>;
let sendRuntime: ReturnType<typeof vi.fn>;
let openPanel: ReturnType<typeof vi.fn>;

async function flush() { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); }); }

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  tab = { id: 3, windowId: 2, url, status: 'complete' } as chrome.tabs.Tab;
  executeScript = vi.fn().mockResolvedValue([{ frameId: 0, result: { title: 'Page title', metaDescription: 'Page description', url } }]);
  sendRuntime = vi.fn().mockImplementation(async (message: { type: string }) => {
    if (message.type === 'SNAPSHOT_GET') return { ok: false, reason: 'missing' };
    if (message.type === 'SNAPSHOT_START') return { ok: true, generation: 1 };
    if (message.type === 'SNAPSHOT_PUT') return { ok: true, generation: 1 };
    return { ok: true };
  });
  openPanel = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('chrome', {
    tabs: {
      query: vi.fn().mockImplementation(async () => [tab]),
      get: vi.fn().mockImplementation(async () => tab),
      sendMessage: vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, page: { ...previewResult.page, url } } }),
      onUpdated: { addListener: vi.fn(), removeListener: vi.fn() }
    },
    scripting: { executeScript },
    runtime: { sendMessage: sendRuntime, getURL: vi.fn((path: string) => `chrome-extension://test/${path}`) },
    sidePanel: { open: openPanel },
    permissions: { request: vi.fn().mockResolvedValue(true) }
  });
  vi.spyOn(window, 'close').mockImplementation(() => {});
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Quick Metadata Popup', () => {
  it('shows JSON-LD once beside the Structured data heading', async () => {
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: {
      ...previewResult, page: { ...previewResult.page, url, jsonLdBlockCount: 1, schemas: [
        { type: 'WebPage', format: 'JSON-LD', properties: { '@type': 'WebPage' } },
        { type: 'Organization', format: 'JSON-LD', properties: { '@type': 'Organization' } }
      ] }
    } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const structured = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Structured data'))!;
    await act(async () => structured.click());
    expect(container.querySelector('.inspector-right-header h2')?.textContent).toBe('Structured dataJSON-LD');
    expect(container.querySelectorAll('.inspector-header-schema-format')).toHaveLength(1);
    expect(Array.from(container.querySelectorAll('.inspector-schema-entry > summary')).map((item) => item.textContent)).toEqual(['WebPage', 'Organization']);
  });
  it('keeps the heading short and groups all supported markup formats', async () => {
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: {
      ...previewResult, page: { ...previewResult.page, url, jsonLdBlockCount: 1, schemas: [
        { type: 'WebPage', format: 'JSON-LD', properties: { '@type': 'WebPage' } },
        { type: 'Product', format: 'Microdata', properties: { '@type': 'Product' } },
        { type: 'Organization', format: 'RDFa', properties: { '@type': 'Organization' } }
      ] }
    } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const structured = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Structured data'))!;
    await act(async () => structured.click());
    expect(container.querySelector('.inspector-right-header h2')?.textContent).toBe('Structured data');
    expect(Array.from(container.querySelectorAll('.inspector-schema-group > h3')).map((item) => item.textContent)).toEqual(['JSON-LD', 'Microdata', 'RDFa']);
  });
  it('does not show a Structured data issue badge when markup is absent', async () => {
    await act(async () => root.render(<PopupApp />));
    await flush();
    const structured = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.querySelector('span')?.textContent === 'Structured data')!;
    expect(structured.querySelector('.inspector-nav-count')).toBeNull();
  });
  it('keeps the Structured data issue badge for invalid JSON-LD', async () => {
    const { check: _check, ...issue } = seoRules.find((rule) => rule.id === 'TECH_003')!;
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: {
      ...previewResult,
      issues: [issue],
      page: { ...previewResult.page, url, invalidSchemaCount: 2, jsonLdBlockCount: 2 }
    } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const structured = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.querySelector('span')?.textContent === 'Structured data')!;
    expect(structured.querySelector('.inspector-nav-count')?.textContent).toBe('1');
  });
  it('shows coming-soon guidance within the unimplemented tools', async () => {
    await act(async () => root.render(<PopupApp />));
    await flush();
    const tabs = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button'));
    for (const label of ['Social tags', 'Outgoing links']) {
      const tab = tabs.find((item) => item.textContent?.includes(label))!;
      await act(async () => tab.click());
      expect(container.querySelector('.inspector-right-header h2')?.textContent).toBe(label);
      expect(container.querySelector('.inspector-coming-soon-banner strong')?.textContent).toBe('Coming soon');
    }
  });
  it('counts missing Description once when the page has no headings', async () => {
    const issues = ['META_001', 'HEADING_001', 'CONTENT_001'].map((id) => {
      const { check: _check, ...issue } = seoRules.find((rule) => rule.id === id)!;
      return issue;
    });
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, issues, page: { ...previewResult.page, url, headings: [] } } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const content = Array.from(container.querySelectorAll('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Content'))!;
    expect(content.querySelector('.inspector-nav-count')?.textContent).toBe('1');
  });
  it('still counts a missing H1 when other headings exist', async () => {
    const { check: _check, ...issue } = seoRules.find((rule) => rule.id === 'HEADING_001')!;
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, issues: [issue], page: { ...previewResult.page, url, headings: [{ level: 2, text: 'Section' }] } } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const content = Array.from(container.querySelectorAll('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Content'))!;
    expect(content.querySelector('.inspector-nav-count')?.textContent).toBe('1');
  });
  it('counts a short Description and a non-H1 first heading as two Content issues', async () => {
    const issues = ['META_002', 'HEADING_004'].map((id) => {
      const { check: _check, ...issue } = seoRules.find((rule) => rule.id === id)!;
      return issue;
    });
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: {
      ...previewResult,
      issues,
      page: {
        ...previewResult.page,
        url,
        metaDescription: 'A short description.',
        headings: [{ level: 3, text: 'Utility heading' }, { level: 1, text: 'Primary heading' }]
      }
    } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const content = Array.from(container.querySelectorAll('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Content'))!;
    expect(content.querySelector('.inspector-nav-count')?.textContent).toBe('2');
    expect(content.querySelector('.inspector-nav-count')?.getAttribute('aria-label')).toBe('2 content issues');
  });
  it('does not count a heading-level jump in the Popup Content badge', async () => {
    const { check: _check, ...issue } = seoRules.find((rule) => rule.id === 'HEADING_003')!;
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: {
      ...previewResult,
      issues: [issue],
      page: { ...previewResult.page, url, headings: [{ level: 1, text: 'Primary heading' }, { level: 3, text: 'Subsection' }] }
    } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const content = Array.from(container.querySelectorAll('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Content'))!;
    expect(content.querySelector('.inspector-nav-count')).toBeNull();
  });
  it('marks a missing canonical as a critical Indexability badge', async () => {
    const { check: _check, ...issue } = seoRules.find((rule) => rule.id === 'TECH_001')!;
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, issues: [issue], page: { ...previewResult.page, url, canonical: '' } } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const indexability = Array.from(container.querySelectorAll('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Indexability'))!;
    expect(indexability.querySelector('.inspector-nav-count.is-critical')?.textContent).toBe('1');
  });
  it('counts the empty-alt review once in Images navigation', async () => {
    const { check: _check, ...issue } = seoRules.find((rule) => rule.id === 'IMAGE_004')!;
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, issues: [issue], page: { ...previewResult.page, url } } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const images = Array.from(container.querySelectorAll('.inspector-tool-nav button')).find((item) => item.querySelector('span')?.textContent === 'Images');
    expect(images?.querySelector('.inspector-nav-count')?.textContent).toBe('1');
  });
  it('groups missing and empty alt as one Images badge issue', async () => {
    const imageIssues = ['IMAGE_001', 'IMAGE_002', 'IMAGE_004'].map((id) => {
      const { check: _check, ...issue } = seoRules.find((rule) => rule.id === id)!;
      return issue;
    });
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, issues: imageIssues, page: { ...previewResult.page, url } } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const images = Array.from(container.querySelectorAll('.inspector-tool-nav button')).find((item) => item.querySelector('span')?.textContent === 'Images');
    expect(images?.querySelector('.inspector-nav-count')?.textContent).toBe('1');
  });
  it('shows the full lazy-image count and an Images badge for missing alt text', async () => {
    const page = {
      ...previewResult.page,
      url,
      images: Array.from({ length: 121 }, (_, index) => ({
        src: `https://example.com/lazy-${index}.webp`,
        alt: index === 0 ? null : `Image ${index}`,
        auditable: false,
        naturalWidth: 0,
        naturalHeight: 0,
        transferSize: 0
      }))
    };
    const metrics = analyzePage(page);
    const issues = evaluateRules(page, metrics);
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, page, metrics, issues } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const images = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.querySelector('span')?.textContent === 'Images')!;
    expect(images.querySelector('.inspector-nav-count')?.textContent).toBe('1');
    await act(async () => images.click());
    expect(container.querySelector('.inspector-right-header h2')?.textContent).toBe('Images121');
    expect(container.textContent).toContain('Missing alt text');
  });
  it('shows Metadata first and reads the shared scanner once for page tools', async () => {
    await act(async () => root.render(<PopupApp />));
    await flush();
    expect(container.textContent).toContain('Page title');
    expect(container.textContent).toContain('Page description');
    expect(executeScript).toHaveBeenCalledOnce();
    expect(chrome.tabs.sendMessage).toHaveBeenCalledOnce();
    expect(container.textContent).toContain('Word count');
    expect(container.textContent).toContain('Open SEO Audit');
  });

  it('queues the target and opens the Side Panel directly from the button click', async () => {
    await act(async () => root.render(<PopupApp />));
    await flush();
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Open SEO Audit'))!;
    await act(async () => button.click());
    expect(sendRuntime).toHaveBeenCalledWith({ type: 'QUEUE_AUDIT_INTENT', intent: expect.objectContaining({ tabId: 3, windowId: 2, url }) });
    expect(openPanel).toHaveBeenCalledWith({ windowId: 2 });
    expect(chrome.tabs.sendMessage).toHaveBeenCalledOnce();
    expect(chrome.permissions.request).not.toHaveBeenCalled();
  });

  it('opens the Images audit from image repair guidance', async () => {
    const image = { src: 'https://example.com/photo.png', alt: null, auditable: true, naturalWidth: 100, naturalHeight: 100, transferSize: 0 };
    const { check: _check, ...imageIssue } = seoRules.find((rule) => rule.id === 'IMAGE_001')!;
    vi.mocked(chrome.tabs.sendMessage).mockImplementation(vi.fn().mockResolvedValue({ ok: true, result: { ...previewResult, issues: [imageIssue], page: { ...previewResult.page, url, images: [image] } } }));
    await act(async () => root.render(<PopupApp />));
    await flush();
    const images = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Images'))!;
    await act(async () => images.click());
    await act(async () => container.querySelector<HTMLButtonElement>('.inspector-image-help-trigger')!.click());
    expect(sendRuntime).toHaveBeenCalledWith({ type: 'QUEUE_AUDIT_INTENT', intent: expect.objectContaining({ category: 'images', tabId: 3, url }) });
    expect(openPanel).toHaveBeenCalledWith({ windowId: 2 });
  });

  it('opens the Content SEO audit from missing Description guidance', async () => {
    executeScript.mockResolvedValueOnce([{ frameId: 0, result: { title: 'Page title', metaDescription: '', url } }]);
    await act(async () => root.render(<PopupApp />));
    await flush();
    const trigger = container.querySelector<HTMLButtonElement>('.metadata-missing-help-trigger')!;
    expect(trigger).not.toBeNull();
    await act(async () => trigger.click());
    expect(sendRuntime).toHaveBeenCalledWith({ type: 'QUEUE_AUDIT_INTENT', intent: expect.objectContaining({ category: 'content', tabId: 3, url }) });
    expect(openPanel).toHaveBeenCalledWith({ windowId: 2 });
  });

  it('keeps the standard popup viewport for Indexability', async () => {
    await act(async () => root.render(<PopupApp />));
    await flush();
    const indexability = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.textContent?.includes('Indexability'))!;
    await act(async () => indexability.click());
    expect(container.querySelector('.inspector-popup')).not.toBeNull();
    expect(container.querySelector('.inspector-popup.is-indexability')).toBeNull();
  });

  it('does not offer Audit on a restricted page', async () => {
    tab = { id: 3, windowId: 2, url: 'chrome://extensions/', status: 'complete' } as chrome.tabs.Tab;
    await act(async () => root.render(<PopupApp />));
    await flush();
    expect(container.textContent).toContain('This Chrome page cannot be read');
    expect(container.querySelector<HTMLButtonElement>('.popup-audit-button')?.disabled).toBe(true);
    expect(openPanel).not.toHaveBeenCalled();
  });

  it('keeps six tools in the Popup and does not rescan when switching them', async () => {
    await act(async () => root.render(<PopupApp />));
    await flush();
    const labels = Array.from(container.querySelectorAll('.inspector-tool-nav button')).map((button) => button.querySelector('span')?.textContent);
    expect(labels).toEqual(['Content', 'Indexability', 'Structured data', 'Social tags', 'Images', 'Outgoing links']);
    for (const label of labels.slice(1)) {
      const button = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-tool-nav button')).find((item) => item.querySelector('span')?.textContent === label)!;
      await act(async () => button.click());
      const heading = container.querySelector('.inspector-right-header h2');
      expect(heading?.firstChild?.textContent).toBe(label);
      if (label === 'Images') expect(heading?.querySelector('.inspector-header-count')?.textContent).toBe('0');
    }
    expect(chrome.tabs.sendMessage).toHaveBeenCalledOnce();
    expect(openPanel).not.toHaveBeenCalled();
  });

  it('opens and dismisses help without changing the active tool', async () => {
    await act(async () => root.render(<PopupApp />));
    await flush();
    const help = container.querySelector<HTMLButtonElement>('.inspector-help-button')!;
    expect(help.getAttribute('aria-label')).toBe('How to use');
    expect(help.querySelector('.inspector-help-tooltip')?.textContent).toBe('How to use');
    await act(async () => help.click());
    expect(container.textContent).toContain('Choose a tool to inspect this page');
    expect(container.querySelector<HTMLAnchorElement>('.inspector-help-popover a')?.textContent).toBe('View guide');
    await act(async () => help.click());
    expect(container.querySelector('.inspector-help-popover')).toBeNull();
  });
});
