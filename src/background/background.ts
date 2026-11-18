import type { AuditIntent, AuditIntentClaim } from '../popup/auditIntent';
import type { ImageStatusRecord, SeoResult } from '../types/seo';

// Keep the classic service worker self-contained. A runtime import makes Chrome
// reject background.js unless the manifest declares a module worker.
const AUDIT_PAGE_CHANGED = 'The page changed before the audit could start. Use Scan current page to try again.';
const AUDIT_INTENT_EXPIRED = 'The audit request expired. Use Scan current page to try again.';
const AUDIT_ISSUE_UNAVAILABLE = 'This issue is no longer available in the current scan. Rescan the page and try again.';

type PendingAudit = { intent?: AuditIntent; error?: string; expiresAt: number };
const pendingAudits = new Map<number, PendingAudit>();
const INTENT_TTL_MS = 15_000;
const SNAPSHOT_TTL_MS = 10 * 60_000;
const MAX_SNAPSHOT_JSON_BYTES = 1_000_000;
const MAX_SESSION_BYTES = 8_000_000;
const SNAPSHOT_PREFIX = 'seoSnapshot:';
const GENERATION_PREFIX = 'seoGeneration:';
const IMAGE_RUN_PREFIX = 'seoImageRun:';
const IMAGE_CACHE_KEY = 'seoImageStatusCache';
const IMAGE_COOLDOWNS_KEY = 'seoImageCooldowns';
const IMAGE_STATUS_TTL_MS = 5 * 60_000;
const MAX_IMAGE_STATUS_CACHE_ENTRIES = 5000;
type SnapshotOwner = { generation: number; url: string; phase: 'loading' | 'complete' };
type StoredSnapshot = { tabId: number; url: string; generation: number; savedAt: number; result: SeoResult };
type StoredImageStatus = { pageOrigin: string; imageUrl: string; status: ImageStatusRecord };
type SnapshotMessage = {
  type?: string; tabId?: number; url?: string; generation?: number; result?: SeoResult; scannedAt?: number;
  imageStatuses?: SeoResult['imageStatuses']; pageOrigin?: string; urls?: string[]; runId?: number;
  cacheEntries?: Array<{ url: string; status: ImageStatusRecord }>; cooldowns?: Record<string, number>;
};
let snapshotQueue: Promise<unknown> = Promise.resolve();

function serialSnapshot<T>(work: () => Promise<T>): Promise<T> {
  const next = snapshotQueue.catch(() => undefined).then(work);
  snapshotQueue = next;
  return next;
}

function normalizedImageUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    url.hash = '';
    return url.href;
  } catch { return undefined; }
}

function validImageStatus(value: ImageStatusRecord | undefined, now: number): ImageStatusRecord | undefined {
  if (!value || !Number.isInteger(value.code) || value.code! < 100 || value.code! > 599 || value.code === 429
    || !Number.isFinite(value.checkedAt) || value.checkedAt! > now || value.checkedAt! + IMAGE_STATUS_TTL_MS <= now) return undefined;
  const code = value.code!;
  return {
    kind: code >= 200 && code < 400 ? 'ok' : 'broken',
    code,
    ...(Number.isFinite(value.fileSize) && value.fileSize! > 0 ? { fileSize: value.fileSize } : {}),
    checkedAt: value.checkedAt,
    expiresAt: value.checkedAt! + IMAGE_STATUS_TTL_MS,
    source: value.source === 'cache' ? 'cache' : value.source === 'previous' ? 'previous' : 'live',
    ...(Number.isInteger(value.runId) ? { runId: value.runId } : {}),
  };
}

function sanitizedImageStatuses(value: SeoResult['imageStatuses'], now: number): NonNullable<SeoResult['imageStatuses']> {
  const statuses: NonNullable<SeoResult['imageStatuses']> = {};
  for (const [key, status] of Object.entries(value ?? {})) {
    const valid = validImageStatus(status, now);
    if (valid) statuses[key] = { ...valid, source: 'cache' };
  }
  return statuses;
}

function imageCacheKey(pageOrigin: string, imageUrl: string): string {
  return `${pageOrigin}\n${imageUrl}`;
}

function validOrigin(value: string): string | undefined {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === value ? value : undefined;
  } catch { return undefined; }
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

async function handleImageStatusStateGet(message: SnapshotMessage) {
  const pageOrigin = validOrigin(message.pageOrigin ?? '');
  if (!pageOrigin || !Array.isArray(message.urls) || message.urls.length > 1000) return { ok: false, reason: 'invalid-request' };
  const now = Date.now();
  const cacheObject = (await chrome.storage.session.get(IMAGE_CACHE_KEY))[IMAGE_CACHE_KEY] as Record<string, StoredImageStatus> | undefined;
  const nextCache: Record<string, StoredImageStatus> = {};
  for (const [key, item] of Object.entries(cacheObject ?? {})) {
    const normalized = item && normalizedImageUrl(item.imageUrl);
    const origin = item && validOrigin(item.pageOrigin);
    const status = item && validImageStatus(item.status, now);
    if (normalized && origin && status && key === imageCacheKey(origin, normalized)) {
      nextCache[key] = { pageOrigin: origin, imageUrl: normalized, status: { ...status, source: 'cache' } };
    }
  }
  const oldCacheKeys = Object.keys(cacheObject ?? {}).sort();
  const nextCacheKeys = Object.keys(nextCache).sort();
  if (oldCacheKeys.length !== nextCacheKeys.length || oldCacheKeys.some((key, index) => key !== nextCacheKeys[index])) {
    await chrome.storage.session.set({ [IMAGE_CACHE_KEY]: nextCache });
  }
  const cache: Record<string, ImageStatusRecord> = {};
  const origins = new Set<string>();
  for (const rawUrl of message.urls) {
    if (typeof rawUrl !== 'string') continue;
    const normalized = normalizedImageUrl(rawUrl);
    if (!normalized) continue;
    const parsed = new URL(normalized);
    origins.add(parsed.origin);
    const item = nextCache[imageCacheKey(pageOrigin, normalized)];
    if (item) cache[normalized] = { ...item.status, source: 'cache' };
  }
  const cooldownObject = (await chrome.storage.session.get(IMAGE_COOLDOWNS_KEY))[IMAGE_COOLDOWNS_KEY] as Record<string, number> | undefined;
  const cooldowns: Record<string, number> = {};
  for (const [origin, until] of Object.entries(cooldownObject ?? {})) {
    if (validOrigin(origin) && Number.isFinite(until) && until > now) {
      if (origins.has(origin)) cooldowns[origin] = until;
    }
  }
  const prunedCooldowns = Object.fromEntries(Object.entries(cooldownObject ?? {}).filter(([origin, until]) => validOrigin(origin) && Number.isFinite(until) && until > now));
  if (Object.keys(prunedCooldowns).length !== Object.keys(cooldownObject ?? {}).length) await chrome.storage.session.set({ [IMAGE_COOLDOWNS_KEY]: prunedCooldowns });
  return { ok: true, cache, cooldowns };
}

async function imageSnapshotContext(message: SnapshotMessage) {
  if (!Number.isInteger(message.tabId) || !message.url || !Number.isInteger(message.generation) || !Number.isFinite(message.scannedAt)) return undefined;
  const tabId = message.tabId!;
  const tab = await chrome.tabs.get(tabId).catch(() => undefined);
  const owner = await ownerFor(tabId);
  const key = SNAPSHOT_PREFIX + tabId;
  const stored = (await chrome.storage.session.get(key))[key] as StoredSnapshot | undefined;
  if (!tab || tab.url !== message.url || tab.status !== 'complete' || owner.url !== message.url
    || owner.generation !== message.generation || !stored || stored.url !== message.url
    || stored.generation !== message.generation || stored.result.scannedAt !== message.scannedAt
    || stored.savedAt + SNAPSHOT_TTL_MS <= Date.now()) return undefined;
  return { tabId, key, owner, stored };
}

async function handleImageStatusMessage(message: SnapshotMessage, sender: chrome.runtime.MessageSender) {
  if (sender.url !== chrome.runtime.getURL('index.html')) return { ok: false, reason: 'invalid-source' };
  if (message.type === 'IMAGE_STATUS_STATE_GET') return handleImageStatusStateGet(message);
  if (message.type === 'IMAGE_STATUS_COOLDOWNS_PUT') {
    const now = Date.now();
    const stored = (await chrome.storage.session.get(IMAGE_COOLDOWNS_KEY))[IMAGE_COOLDOWNS_KEY] as Record<string, number> | undefined;
    const cooldowns = Object.fromEntries(Object.entries(stored ?? {}).filter(([origin, until]) => validOrigin(origin) && Number.isFinite(until) && until > now));
    for (const [rawOrigin, until] of Object.entries(message.cooldowns ?? {})) {
      const origin = validOrigin(rawOrigin);
      if (!origin || !Number.isFinite(until) || until <= now || until > 8.64e15) continue;
      cooldowns[origin] = Math.max(cooldowns[origin] ?? 0, until);
    }
    await chrome.storage.session.set({ [IMAGE_COOLDOWNS_KEY]: cooldowns });
    return { ok: true };
  }
  if (message.type === 'IMAGE_REFRESH_RUN_START') {
    const context = await imageSnapshotContext(message);
    if (!context) return { ok: false, reason: 'stale' };
    const runKey = IMAGE_RUN_PREFIX + context.tabId;
    const current = (await chrome.storage.session.get(runKey))[runKey] as { runId?: number } | undefined;
    const runId = (current?.runId ?? 0) + 1;
    await chrome.storage.session.set({ [runKey]: { runId, url: message.url, generation: message.generation, scannedAt: message.scannedAt } });
    return { ok: true, generation: context.owner.generation, runId };
  }
  if (message.type === 'IMAGE_STATUS_STATE_PUT') {
    const context = await imageSnapshotContext(message);
    const runKey = IMAGE_RUN_PREFIX + (message.tabId ?? -1);
    const activeRun = (await chrome.storage.session.get(runKey))[runKey] as { runId?: number; url?: string; generation?: number; scannedAt?: number } | undefined;
    if (!context || !Number.isInteger(message.runId) || !activeRun || activeRun.runId !== message.runId
      || activeRun.url !== message.url || activeRun.generation !== message.generation || activeRun.scannedAt !== message.scannedAt) return { ok: false, reason: 'stale' };
    const now = Date.now();
    const imageStatuses: NonNullable<SeoResult['imageStatuses']> = {};
    for (const [key, value] of Object.entries(message.imageStatuses ?? {})) {
      const valid = validImageStatus(value, now);
      if (valid) imageStatuses[key] = valid;
    }
    const updated = { ...context.stored, result: { ...context.stored.result, imageStatuses } };
    const jsonBytes = new TextEncoder().encode(JSON.stringify(updated)).length;
    if (jsonBytes > MAX_SNAPSHOT_JSON_BYTES) return { ok: false, reason: 'too-large' };
    const cacheObject = (await chrome.storage.session.get(IMAGE_CACHE_KEY))[IMAGE_CACHE_KEY] as Record<string, StoredImageStatus> | undefined;
    const cache = { ...(cacheObject ?? {}) };
    const pageOrigin = new URL(message.url!).origin;
    const knownUrls = new Set(context.stored.result.page.images.map((image) => normalizedImageUrl(image.src)).filter((value): value is string => Boolean(value)));
    for (const entry of message.cacheEntries ?? []) {
      const imageUrl = normalizedImageUrl(entry.url);
      const status = validImageStatus(entry.status, now);
      if (!imageUrl || !status || !knownUrls.has(imageUrl) || status.source !== 'live' || status.runId !== message.runId) continue;
      const key = imageCacheKey(pageOrigin, imageUrl);
      const previous = cache[key]?.status;
      if (previous?.checkedAt && status.checkedAt! < previous.checkedAt) continue;
      cache[key] = { pageOrigin, imageUrl, status };
    }
    const boundedCache = Object.fromEntries(Object.entries(cache)
      .sort(([, a], [, b]) => (a.status.checkedAt ?? 0) - (b.status.checkedAt ?? 0))
      .slice(-MAX_IMAGE_STATUS_CACHE_ENTRIES));
    try {
      await pruneSnapshots(jsonBytes * 3);
      await chrome.storage.session.set({ [context.key]: updated, [IMAGE_CACHE_KEY]: boundedCache });
      return { ok: true, generation: context.owner.generation, runId: message.runId };
    } catch { return { ok: false, reason: 'storage-failed' }; }
  }
  return { ok: false, reason: 'unsupported' };
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
    if (stored.url !== message.url || stored.generation !== current.generation) return { ok: false, reason: 'stale', generation: current.generation };
    const imageStatuses = sanitizedImageStatuses(stored.result.imageStatuses, Date.now());
    const result = { ...stored.result, ...(Object.keys(imageStatuses).length ? { imageStatuses } : { imageStatuses: undefined }) };
    if (Object.keys(imageStatuses).length !== Object.keys(stored.result.imageStatuses ?? {}).length) {
      await chrome.storage.session.set({ [key]: { ...stored, result } });
    }
    return { ok: true, generation: current.generation, result };
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
      const valid = validImageStatus(status, Date.now());
      if (valid) imageStatuses[key] = valid;
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

async function validateAuditIntent(intent: AuditIntent): Promise<string | undefined> {
  if (!await isCurrentPage(intent)) return AUDIT_PAGE_CHANGED;
  if (intent.issueIds === undefined) return undefined;
  if (!Array.isArray(intent.issueIds) || !intent.issueIds.length || !Number.isInteger(intent.generation) || !Number.isFinite(intent.scannedAt)
    || intent.issueIds.some((id) => typeof id !== 'string' || !id)) return AUDIT_ISSUE_UNAVAILABLE;
  try {
    const owner = await ownerFor(intent.tabId);
    const key = SNAPSHOT_PREFIX + intent.tabId;
    const stored = (await chrome.storage.session.get(key))[key] as StoredSnapshot | undefined;
    if (!stored || owner.phase !== 'complete' || owner.url !== intent.url || owner.generation !== intent.generation
      || stored.url !== intent.url || stored.generation !== intent.generation || stored.result.scannedAt !== intent.scannedAt
      || stored.savedAt + SNAPSHOT_TTL_MS <= Date.now()) return AUDIT_ISSUE_UNAVAILABLE;
    const available = new Set(stored.result.issues.map((issue) => issue.id));
    // Candidate IDs are ordered by the Popup's rule-specific priority. At least
    // one must still exist; the Side Panel selects the first surviving ID.
    return intent.issueIds.some((id) => available.has(id)) ? undefined : AUDIT_ISSUE_UNAVAILABLE;
  } catch {
    return AUDIT_ISSUE_UNAVAILABLE;
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
  if (message.type?.startsWith('IMAGE_STATUS_') || message.type === 'IMAGE_REFRESH_RUN_START') {
    void serialSnapshot(() => handleImageStatusMessage(message, sender)).then(respond, () => respond({ ok: false, reason: 'storage-failed' }));
    return true;
  }
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
      const structurallyValid = Number.isInteger(intent.tabId) && Number.isInteger(intent.windowId) && typeof intent.url === 'string'
        && typeof intent.id === 'string';
      const error = structurallyValid ? await validateAuditIntent(intent) : AUDIT_PAGE_CHANGED;
      const valid = !error;
      pendingAudits.set(intent.windowId, { ...(valid ? { intent } : { error }), expiresAt: Date.now() + INTENT_TTL_MS });
      respond({ ok: valid, ...(error ? { error } : {}) });
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
        else if (pending.intent) {
          const error = await validateAuditIntent(pending.intent);
          result = error ? { ok: false, error } : { ok: true, intent: pending.intent };
        } else result = { ok: false, error: AUDIT_PAGE_CHANGED };
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
