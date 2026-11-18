import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditIntent, AuditIntentClaim } from '../popup/auditIntent';

type InstallListener = (details: { reason: string }) => void;
type MessageListener = (message: { type?: string; intent?: AuditIntent; windowId?: number }, sender: { url?: string }, respond: (response: unknown) => void) => boolean | void;
let installed: InstallListener;
let messaged: MessageListener;
let updated: (tabId: number, change: { url?: string; status?: string }) => void;
let currentTab: chrome.tabs.Tab;
let create: ReturnType<typeof vi.fn>;
let set: ReturnType<typeof vi.fn>;
let sessionValues: Record<string, unknown>;

const popupUrl = 'chrome-extension://test/index.html';
const panelUrl = 'chrome-extension://test/sidepanel.html';
const intent: AuditIntent = { id: 'intent-1', tabId: 3, windowId: 2, url: 'https://example.com/' };

function send(message: { type?: string; intent?: AuditIntent; windowId?: number }, url: string): Promise<unknown> {
  return new Promise((resolve) => {
    const async = messaged(message, { url }, resolve);
    if (!async) resolve(undefined);
  });
}

beforeEach(async () => {
  vi.resetModules();
  create = vi.fn().mockResolvedValue({ id: 7 });
  set = vi.fn().mockResolvedValue(undefined);
  sessionValues = {};
  currentTab = { id: 3, windowId: 2, url: intent.url, status: 'complete' } as chrome.tabs.Tab;
  vi.stubGlobal('chrome', {
    runtime: {
      onInstalled: { addListener: vi.fn((listener: InstallListener) => { installed = listener; }) },
      onMessage: { addListener: vi.fn((listener: MessageListener) => { messaged = listener; }) },
      getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      sendMessage: vi.fn().mockResolvedValue(undefined)
    },
    storage: {
      local: { set },
      session: {
        get: vi.fn().mockImplementation(async (keys: string | string[] | null) => {
          if (keys === null) return { ...sessionValues };
          const list = Array.isArray(keys) ? keys : [keys];
          return Object.fromEntries(list.filter((key) => key in sessionValues).map((key) => [key, sessionValues[key]]));
        }),
        set: vi.fn().mockImplementation(async (values: Record<string, unknown>) => { Object.assign(sessionValues, values); }),
        remove: vi.fn().mockImplementation(async (keys: string | string[]) => { for (const key of Array.isArray(keys) ? keys : [keys]) delete sessionValues[key]; })
      }
    },
    tabs: {
      create,
      get: vi.fn().mockImplementation(async () => currentTab),
      query: vi.fn().mockImplementation(async () => [currentTab]),
      onUpdated: { addListener: vi.fn((listener) => { updated = listener; }) },
      onRemoved: { addListener: vi.fn() }
    }
  });
  await import('./background');
});

afterEach(() => vi.unstubAllGlobals());

describe('one-time Popup Audit intent', () => {
  it('validates the target and allows the Side Panel to claim only once', async () => {
    expect(await send({ type: 'QUEUE_AUDIT_INTENT', intent }, popupUrl)).toEqual({ ok: true });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'AUDIT_INTENT_AVAILABLE', windowId: 2 });
    expect(await send({ type: 'CLAIM_AUDIT_INTENT', windowId: 2 }, panelUrl)).toEqual({ ok: true, intent });
    expect(await send({ type: 'CLAIM_AUDIT_INTENT', windowId: 2 }, panelUrl)).toEqual({ ok: false });
  });

  it('requires the exact current snapshot and a real Issue ID for issue navigation', async () => {
    const issueIntent: AuditIntent = { ...intent, issueIds: ['IMAGE_001', 'IMAGE_002'], generation: 8, scannedAt: 123 };
    sessionValues['seoGeneration:3'] = { generation: 8, url: intent.url, phase: 'complete' };
    sessionValues['seoSnapshot:3'] = { tabId: 3, url: intent.url, generation: 8, savedAt: Date.now(), result: { scannedAt: 123, issues: [{ id: 'IMAGE_001' }] } };
    expect(await send({ type: 'QUEUE_AUDIT_INTENT', intent: issueIntent }, popupUrl)).toEqual({ ok: true });
    expect((await send({ type: 'CLAIM_AUDIT_INTENT', windowId: 2 }, panelUrl) as AuditIntentClaim).ok).toBe(true);
    expect(await send({ type: 'CLAIM_AUDIT_INTENT', windowId: 2 }, panelUrl)).toEqual({ ok: false });
  });

  it('rejects missing IDs and stale scan generations without inventing an issue', async () => {
    const issueIntent: AuditIntent = { ...intent, issueIds: ['IMAGE_001'], generation: 8, scannedAt: 123 };
    sessionValues['seoGeneration:3'] = { generation: 9, url: intent.url, phase: 'complete' };
    sessionValues['seoSnapshot:3'] = { tabId: 3, url: intent.url, generation: 9, savedAt: Date.now(), result: { scannedAt: 123, issues: [{ id: 'IMAGE_001' }] } };
    const stale = await send({ type: 'QUEUE_AUDIT_INTENT', intent: issueIntent }, popupUrl) as { ok: boolean; error?: string };
    expect(stale.ok).toBe(false);
    expect(stale.error).toContain('no longer available');
    sessionValues['seoGeneration:3'] = { generation: 8, url: intent.url, phase: 'complete' };
    sessionValues['seoSnapshot:3'] = { tabId: 3, url: intent.url, generation: 8, savedAt: Date.now(), result: { scannedAt: 123, issues: [] } };
    expect((await send({ type: 'QUEUE_AUDIT_INTENT', intent: issueIntent }, popupUrl) as { ok: boolean }).ok).toBe(false);
  });

  it('rejects a changed target before claim', async () => {
    await send({ type: 'QUEUE_AUDIT_INTENT', intent }, popupUrl);
    updated(3, { status: 'loading' });
    const result = await send({ type: 'CLAIM_AUDIT_INTENT', windowId: 2 }, panelUrl) as AuditIntentClaim;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('page changed');
  });

  it('does not accept an intent from another extension page', async () => {
    expect(await send({ type: 'QUEUE_AUDIT_INTENT', intent }, 'chrome-extension://test/welcome.html')).toBeUndefined();
    expect(await send({ type: 'CLAIM_AUDIT_INTENT', windowId: 2 }, panelUrl)).toEqual({ ok: false });
  });

  it('cancels an unclaimed intent when opening the panel fails', async () => {
    await send({ type: 'QUEUE_AUDIT_INTENT', intent }, popupUrl);
    await send({ type: 'CANCEL_AUDIT_INTENT', intent }, popupUrl);
    expect(await send({ type: 'CLAIM_AUDIT_INTENT', windowId: 2 }, panelUrl)).toEqual({ ok: false });
  });
});

describe('Welcome install trigger', () => {
  it('keeps install bookkeeping without automatically opening Welcome', () => {
    installed({ reason: 'install' });
    expect(create).not.toHaveBeenCalled();
    expect(set).toHaveBeenCalledOnce();
  });

  it.each(['update', 'chrome_update', 'shared_module_update'])('does not open Welcome for %s', (reason) => {
    installed({ reason });
    expect(create).not.toHaveBeenCalled();
  });
});
