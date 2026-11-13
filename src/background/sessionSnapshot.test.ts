import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { previewResult } from '../popup/previewResult';

type Listener = (message: Record<string, unknown>, sender: { url: string }, respond: (value: unknown) => void) => boolean | void;
let onMessage: Listener;
let onUpdated: (tabId: number, change: { status?: string; url?: string }) => void;
let onRemoved: (tabId: number) => void;
let tabs: Map<number, { id: number; url: string; status: string; windowId: number }>;
let values: Map<string, unknown>;
let failSnapshotWrite = false;
const url = 'https://example.com/';
const popup = 'chrome-extension://test/index.html';
const panel = 'chrome-extension://test/sidepanel.html';

const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length;
async function send(type: string, tabId = 3, extra: Record<string, unknown> = {}, sender = popup) {
  return await new Promise<any>((resolve) => {
    const async = onMessage({ type, tabId, url, ...extra }, { url: sender }, resolve);
    if (!async) resolve(undefined);
  });
}

beforeEach(async () => {
  vi.resetModules();
  failSnapshotWrite = false;
  tabs = new Map([
    [3, { id: 3, url, status: 'complete', windowId: 2 }],
    [4, { id: 4, url, status: 'complete', windowId: 2 }]
  ]);
  values = new Map();
  const session = {
    get: vi.fn(async (key: string | null) => key === null ? Object.fromEntries(values) : { [key]: values.get(key) }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      if (failSnapshotWrite && Object.keys(items).some((key) => key.startsWith('seoSnapshot:'))) throw new Error('Quota');
      for (const [key, value] of Object.entries(items)) values.set(key, value);
    }),
    remove: vi.fn(async (keys: string | string[]) => { for (const key of Array.isArray(keys) ? keys : [keys]) values.delete(key); }),
    getBytesInUse: vi.fn(async (keys: string | null) => keys === null
      ? [...values].reduce((total, [key, value]) => total + bytes(key) + bytes(value), 0)
      : bytes(keys) + bytes(values.get(keys)))
  };
  vi.stubGlobal('chrome', {
    runtime: {
      onInstalled: { addListener: vi.fn() },
      onMessage: { addListener: vi.fn((listener: Listener) => { onMessage = listener; }) },
      getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      sendMessage: vi.fn().mockResolvedValue(undefined)
    },
    storage: { local: { set: vi.fn().mockResolvedValue(undefined) }, session },
    tabs: {
      get: vi.fn(async (tabId: number) => { const tab = tabs.get(tabId); if (!tab) throw new Error('No tab'); return tab; }),
      query: vi.fn(async () => [tabs.get(3)]),
      onUpdated: { addListener: vi.fn((listener) => { onUpdated = listener; }) },
      onRemoved: { addListener: vi.fn((listener) => { onRemoved = listener; }) }
    },
    scripting: { executeScript: vi.fn(async ({ target }: { target: { tabId: number } }) => [{ result: tabs.get(target.tabId)?.url }]) }
  });
  await import('./background');
});
afterEach(() => vi.unstubAllGlobals());

describe('session snapshot coordinator', () => {
  it('retains image checks in the shared snapshot without altering the audit and rejects stale writes', async () => {
    const result = { ...previewResult, page: { ...previewResult.page, url, images: [{ src: 'https://example.com/icon.svg', alt: '', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 300 }] }, scannedAt: 123 };
    await send('SNAPSHOT_START');
    await send('SNAPSHOT_PUT', 3, { generation: 1, result });
    const key = `${result.page.images[0].src}-0`;
    const imageStatuses = { [key]: { kind: 'ok', code: 200, fileSize: 898 } };
    const update = { generation: 1, scannedAt: 123, imageStatuses };
    expect((await send('SNAPSHOT_IMAGE_STATUSES_PUT', 3, update)).ok).toBe(true);
    const restored = await send('SNAPSHOT_GET', 3, {}, panel);
    expect(restored.result).toEqual({ ...result, imageStatuses });
    expect((await send('SNAPSHOT_GET', 4)).reason).toBe('missing');
    expect((await send('SNAPSHOT_IMAGE_STATUSES_PUT', 3, { ...update, scannedAt: 122 })).reason).toBe('stale');
    failSnapshotWrite = true;
    expect((await send('SNAPSHOT_IMAGE_STATUSES_PUT', 3, update)).reason).toBe('storage-failed');
    failSnapshotWrite = false;
    onUpdated(3, { status: 'loading' });
    onUpdated(3, { status: 'complete' });
    expect((await send('SNAPSHOT_GET')).reason).toBe('missing');
    await send('SNAPSHOT_START');
    await send('SNAPSHOT_PUT', 3, { generation: 3, result: { ...result, scannedAt: 124 } });
    expect((await send('SNAPSHOT_IMAGE_STATUSES_PUT', 3, update)).reason).toBe('stale');
    expect((await send('SNAPSHOT_GET')).result.imageStatuses).toBeUndefined();
  });

  it('shares the full result across extension pages and isolates the same URL on another Tab', async () => {
    const started = await send('SNAPSHOT_START');
    expect(started).toEqual({ ok: true, generation: 1 });
    const result = { ...previewResult, page: { ...previewResult.page, url } };
    expect(await send('SNAPSHOT_PUT', 3, { generation: 1, result })).toEqual({ ok: true, generation: 1 });
    expect((await send('SNAPSHOT_GET', 3, {}, panel)).result).toEqual(result);
    expect((await send('SNAPSHOT_GET', 4, {}, panel)).reason).toBe('missing');
  });

  it('invalidates same-URL refresh and rejects late results without overwriting the new report', async () => {
    const old = { ...previewResult, page: { ...previewResult.page, url }, score: 75 };
    await send('SNAPSHOT_START');
    await send('SNAPSHOT_PUT', 3, { generation: 1, result: old });
    tabs.get(3)!.status = 'loading';
    onUpdated(3, { status: 'loading' });
    onUpdated(3, { status: 'loading' });
    tabs.get(3)!.status = 'complete';
    onUpdated(3, { status: 'complete' });
    expect((await send('SNAPSHOT_GET', 3, {}, panel)).reason).toBe('missing');
    const fresh = { ...old, score: 91 };
    const started = await send('SNAPSHOT_START');
    expect(started.generation).toBe(3); // One refresh invalidation plus one deliberate scan.
    await send('SNAPSHOT_PUT', 3, { generation: 3, result: fresh });
    expect((await send('SNAPSHOT_PUT', 3, { generation: 1, result: old })).reason).toBe('stale');
    expect((await send('SNAPSHOT_GET', 3, {}, panel)).result.score).toBe(91);
  });

  it('does not reveal cached data when page access is lost', async () => {
    await send('SNAPSHOT_START');
    await send('SNAPSHOT_PUT', 3, { generation: 1, result: { ...previewResult, page: { ...previewResult.page, url } } });
    vi.mocked(chrome.scripting.executeScript).mockRejectedValue(new Error('Permission denied'));
    expect((await send('SNAPSHOT_GET', 3, {}, panel)).reason).toBe('access-needed');
  });

  it('bounds payloads, handles storage failures and expires stale snapshots', async () => {
    await send('SNAPSHOT_START');
    const base = { ...previewResult, page: { ...previewResult.page, url } };
    expect((await send('SNAPSHOT_PUT', 3, { generation: 1, result: { ...base, page: { ...base.page, title: 'x'.repeat(1_100_000) } } })).reason).toBe('too-large');
    failSnapshotWrite = true;
    expect((await send('SNAPSHOT_PUT', 3, { generation: 1, result: base })).reason).toBe('storage-failed');
    failSnapshotWrite = false;
    await send('SNAPSHOT_PUT', 3, { generation: 1, result: base });
    const stored = values.get('seoSnapshot:3') as { savedAt: number };
    values.set('seoSnapshot:3', { ...stored, savedAt: Date.now() - 11 * 60_000 });
    expect((await send('SNAPSHOT_GET', 3, {}, panel)).reason).toBe('expired');
    expect(values.has('seoSnapshot:3')).toBe(false);
  });

  it('accepts a bounded snapshot with 1000 collected image records', async () => {
    const started = await send('SNAPSHOT_START');
    const base = { ...previewResult, page: { ...previewResult.page, url } };
    const images = Array.from({ length: 1000 }, (_, index) => ({
      src: `https://example.com/assets/image-${index}.jpg`, alt: `Image ${index}`,
      auditable: true, naturalWidth: 800, naturalHeight: 600, transferSize: 0
    }));
    const result = { ...base, page: { ...base.page, images } };
    const written = await send('SNAPSHOT_PUT', 3, { generation: started.generation, result });
    expect(written.ok).toBe(true);
    expect((await send('SNAPSHOT_GET', 3, {}, panel)).result.page.images).toHaveLength(1000);
    expect(bytes(values.get('seoSnapshot:3'))).toBeLessThan(1_000_000);
  });

  it('removes a closed Tab and rejects messages from other extension pages', async () => {
    expect((await send('SNAPSHOT_START', 3, {}, 'chrome-extension://test/welcome.html')).reason).toBe('invalid-source');
    await send('SNAPSHOT_START');
    await send('SNAPSHOT_PUT', 3, { generation: 1, result: { ...previewResult, page: { ...previewResult.page, url } } });
    tabs.delete(3);
    onRemoved(3);
    await send('SNAPSHOT_GET', 4, {}, panel); // Drain the serialized queue.
    expect(values.has('seoSnapshot:3')).toBe(false);
    expect(values.has('seoGeneration:3')).toBe(false);
  });
});
