import type { AuditIntent, AuditIntentClaim } from '../popup/auditIntent';
import type { SeoResult } from '../types/seo';

// Keep the classic service worker self-contained. A runtime import makes Chrome
// reject background.js unless the manifest declares a module worker.
const AUDIT_PAGE_CHANGED = 'The page changed before the audit could start. Use Scan current page to try again.';
const AUDIT_INTENT_EXPIRED = 'The audit request expired. Use Scan current page to try again.';

type PendingAudit = { intent?: AuditIntent; error?: string; expiresAt: number };
const pendingAudits = new Map<number, PendingAudit>();
const INTENT_TTL_MS = 15_000;
const SNAPSHOT_TTL_MS = 10 * 60_000;
const MAX_SNAPSHOT_JSON_BYTES = 1_000_000;
const MAX_SESSION_BYTES = 8_000_000;
const SNAPSHOT_PREFIX = 'seoSnapshot:';
const GENERATION_PREFIX = 'seoGeneration:';
type SnapshotOwner = { generation: number; url: string; phase: 'loading' | 'complete' };
type StoredSnapshot = { tabId: number; url: string; generation: number; savedAt: number; result: SeoResult };
type SnapshotMessage = { type?: string; tabId?: number; url?: string; generation?: number; result?: SeoResult; scannedAt?: number; imageStatuses?: SeoResult['imageStatuses'] };
let snapshotQueue: Promise<unknown> = Promise.resolve();

function serialSnapshot<T>(work: () => Promise<T>): Promise<T> {
  const next = snapshotQueue.catch(() => undefined).then(work);
  snapshotQueue = next;
  return next;
}

async function ownerFor(tabId: number): Promise<SnapshotOwner> {
  const value = (await chrome.storage.session.get(GENERATION_PREFIX + tabId))[GENERATION_PREFIX + tabId] as SnapshotOwner | undefined;
  return value ?? { generation: 0, url: '', phase: 'complete' };
}

async function invalidateSnapshot(tabId: number, url: string, phase: SnapshotOwner['phase']): Promise<number> {
  const owner = await ownerFor(tabId);
  const generation = owner.generation + 1;
  await chrome.storage.session.set({ [GENERATION_PREFIX + tabId]: { generation, url, phase } });
  await chrome.storage.session.remove(SNAPSHOT_PREFIX + tabId);
  return generation;
}

async function pruneSnapshots(extraBytes = 0): Promise<void> {
  const all = await chrome.storage.session.get(null);
  const now = Date.now();
  const entries = Object.entries(all)
    .filter(([key]) => key.startsWith(SNAPSHOT_PREFIX)) as Array<[string, StoredSnapshot]>;
  const expired = entries.filter(([, item]) => !item || item.savedAt + SNAPSHOT_TTL_MS <= now);
  if (expired.length) await chrome.storage.session.remove(expired.map(([key]) => key));
  let used = await chrome.storage.session.getBytesInUse(null);
  for (const [key] of entries.filter((entry) => !expired.includes(entry)).sort((a, b) => a[1].savedAt - b[1].savedAt)) {
    if (used + extraBytes <= MAX_SESSION_BYTES) break;
    const bytes = await chrome.storage.session.getBytesInUse(key);
    await chrome.storage.session.remove(key);
    used -= bytes;
  }
}

async function handleSnapshot(message: SnapshotMessage, sender: chrome.runtime.MessageSender) {
  const fromPopup = sender.url === chrome.runtime.getURL('index.html');
  const fromPanel = sender.url === chrome.runtime.getURL('sidepanel.html');
  if ((!fromPopup && !fromPanel) || !Number.isInteger(message.tabId) || !message.url) return { ok: false, reason: 'invalid-source' };
  const tabId = message.tabId!;
  const tab = await chrome.tabs.get(tabId).catch(() => undefined);
  if (!tab || tab.url !== message.url || tab.status !== 'complete') return { ok: false, reason: 'page-changed' };
  const current = await ownerFor(tabId);
  if (current.url && current.url !== message.url) return { ok: false, reason: 'page-changed' };
  if (message.type === 'SNAPSHOT_START') {
    return { ok: true, generation: await invalidateSnapshot(tabId, message.url, 'complete') };
  }
  if (message.type === 'SNAPSHOT_GET') {
    // An activeTab grant can be temporary. Recheck access before revealing a
    // cached page result, even when the tab ID and URL still match.
    try {
      const [access] = await chrome.scripting.executeScript({ target: { tabId }, func: () => location.href });
      if (access.result !== message.url) return { ok: false, reason: 'access-needed' };
    } catch { return { ok: false, reason: 'access-needed' }; }
    const key = SNAPSHOT_PREFIX + tabId;
    const stored = (await chrome.storage.session.get(key))[key] as StoredSnapshot | undefined;
    if (!stored) return { ok: false, reason: 'missing', generation: current.generation };
    if (stored.savedAt + SNAPSHOT_TTL_MS <= Date.now()) {
      await chrome.storage.session.remove(key);
      return { ok: false, reason: 'expired', generation: current.generation };
    }
    return stored.url === message.url && stored.generation === current.generation
      ? { ok: true, generation: current.generation, result: stored.result }
      : { ok: false, reason: 'stale', generation: current.generation };
  }
  if (message.type === 'SNAPSHOT_IMAGE_STATUSES_PUT') {
    const key = SNAPSHOT_PREFIX + tabId;
    const stored = (await chrome.storage.session.get(key))[key] as StoredSnapshot | undefined;
    if (!stored || stored.generation !== current.generation || message.generation !== current.generation
      || stored.url !== message.url || stored.result.scannedAt !== message.scannedAt
      || stored.savedAt + SNAPSHOT_TTL_MS <= Date.now()) return { ok: false, reason: 'stale' };
    if (!message.imageStatuses || typeof message.imageStatuses !== 'object') return { ok: false, reason: 'invalid-statuses' };
    const imageStatuses: NonNullable<SeoResult['imageStatuses']> = {};
    stored.result.page.images.forEach((image, index) => {
      const key = `${image.src}-${index}`;
      const status = message.imageStatuses?.[key];
      if (status && ['ok', 'broken', 'unchecked'].includes(status.kind)) {
        imageStatuses[key] = { kind: status.kind,
          ...(Number.isInteger(status.code) && status.code! >= 100 && status.code! <= 599 ? { code: status.code } : {}),
          ...(Number.isFinite(status.fileSize) && status.fileSize! > 0 ? { fileSize: status.fileSize } : {}) };
      }
    });
    const updated = { ...stored, result: { ...stored.result, imageStatuses } };
    const jsonBytes = new TextEncoder().encode(JSON.stringify(updated)).length;
    if (jsonBytes > MAX_SNAPSHOT_JSON_BYTES) return { ok: false, reason: 'too-large' };
    try {
      await pruneSnapshots(jsonBytes * 3);
      await chrome.storage.session.set({ [key]: updated });
      return { ok: true, generation: current.generation };
    } catch { return { ok: false, reason: 'storage-failed' }; }
  }
  if (message.type === 'SNAPSHOT_PUT') {
    if (message.generation !== current.generation || !message.result || message.result.page?.url !== message.url) {
      return { ok: false, reason: 'stale', generation: current.generation };
    }
    const stored: StoredSnapshot = { tabId, url: message.url, generation: current.generation, savedAt: Date.now(), result: message.result };
    const jsonBytes = new TextEncoder().encode(JSON.stringify(stored)).length;
    if (jsonBytes > MAX_SNAPSHOT_JSON_BYTES) return { ok: false, reason: 'too-large' };
    try {
      await pruneSnapshots(jsonBytes * 3);
      await chrome.storage.session.set({ [SNAPSHOT_PREFIX + tabId]: stored });
      return { ok: true, generation: current.generation };
    } catch { return { ok: false, reason: 'storage-failed' }; }
  }
  return { ok: false, reason: 'unsupported' };
}

async function isCurrentPage(intent: AuditIntent): Promise<boolean> {
  try {
    const [tab, active] = await Promise.all([
      chrome.tabs.get(intent.tabId),
      chrome.tabs.query({ active: true, windowId: intent.windowId })
    ]);
    return tab.windowId === intent.windowId && tab.url === intent.url && tab.status === 'complete' && active[0]?.id === intent.tabId;
  } catch {
    return false;
  }
}

function announceIntent(windowId: number): void {
  void chrome.runtime.sendMessage({ type: 'AUDIT_INTENT_AVAILABLE', windowId }).catch(() => {
    // The panel may not have mounted yet; it also claims on mount.
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  void chrome.storage.local.set({ lastInstalled: Date.now() });
  void details;
});

chrome.runtime.onMessage.addListener((message: { type?: string; intent?: AuditIntent; windowId?: number } & SnapshotMessage, sender, respond) => {
  if (message.type?.startsWith('SNAPSHOT_')) {
    void serialSnapshot(() => handleSnapshot(message, sender)).then(respond, () => respond({ ok: false, reason: 'storage-failed' }));
    return true;
  }
  if (message.type === 'CANCEL_AUDIT_INTENT') {
    if (sender.url === chrome.runtime.getURL('index.html') && message.intent) {
      const pending = pendingAudits.get(message.intent.windowId);
      if (pending?.intent?.id === message.intent.id) pendingAudits.delete(message.intent.windowId);
    }
    return;
  }
  if (message.type === 'QUEUE_AUDIT_INTENT') {
    if (sender.url !== chrome.runtime.getURL('index.html') || !message.intent) return;
    const intent = message.intent;
    void (async () => {
      const valid = Number.isInteger(intent.tabId) && Number.isInteger(intent.windowId) && typeof intent.url === 'string'
        && typeof intent.id === 'string' && await isCurrentPage(intent);
      pendingAudits.set(intent.windowId, { ...(valid ? { intent } : { error: AUDIT_PAGE_CHANGED }), expiresAt: Date.now() + INTENT_TTL_MS });
      respond({ ok: valid });
      announceIntent(intent.windowId);
    })();
    return true;
  }
  if (message.type === 'CLAIM_AUDIT_INTENT') {
    if (sender.url !== chrome.runtime.getURL('sidepanel.html') || !Number.isInteger(message.windowId)) return;
    const windowId = message.windowId!;
    const pending = pendingAudits.get(windowId);
    pendingAudits.delete(windowId);
    void (async () => {
      let result: AuditIntentClaim = { ok: false };
      if (pending) {
        if (pending.expiresAt < Date.now()) result = { ok: false, error: AUDIT_INTENT_EXPIRED };
        else if (pending.error) result = { ok: false, error: pending.error };
        else if (pending.intent && await isCurrentPage(pending.intent)) result = { ok: true, intent: pending.intent };
        else result = { ok: false, error: AUDIT_PAGE_CHANGED };
      }
      respond(result);
    })();
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (chrome.storage?.session && (change.status === 'loading' || change.url !== undefined)) {
    void serialSnapshot(async () => {
      const owner = await ownerFor(tabId);
      const tab = await chrome.tabs.get(tabId).catch(() => undefined);
      const url = change.url ?? tab?.url ?? owner.url;
      if (owner.phase !== 'loading' || owner.url !== url) await invalidateSnapshot(tabId, url, 'loading');
    });
  } else if (chrome.storage?.session && change.status === 'complete') {
    void serialSnapshot(async () => {
      const owner = await ownerFor(tabId);
      await chrome.storage.session.set({ [GENERATION_PREFIX + tabId]: { ...owner, phase: 'complete' } });
    });
  }
  if (change.url === undefined && change.status !== 'loading') return;
  for (const [windowId, pending] of pendingAudits) {
    if (pending.intent?.tabId !== tabId) continue;
    pendingAudits.set(windowId, { error: AUDIT_PAGE_CHANGED, expiresAt: pending.expiresAt });
    announceIntent(windowId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (chrome.storage?.session) void serialSnapshot(() => chrome.storage.session.remove([SNAPSHOT_PREFIX + tabId, GENERATION_PREFIX + tabId]));
  for (const [windowId, pending] of pendingAudits) {
    if (pending.intent?.tabId !== tabId) continue;
    pendingAudits.set(windowId, { error: AUDIT_PAGE_CHANGED, expiresAt: pending.expiresAt });
    announceIntent(windowId);
  }
});

export {};
