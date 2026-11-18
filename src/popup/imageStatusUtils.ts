import type { ImageStatusRecord } from '../types/seo';

export const IMAGE_STATUS_TTL_MS = 5 * 60_000;
export const DEFAULT_IMAGE_COOLDOWN_MS = 30_000;

export function normalizeImageStatusUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    url.hash = '';
    return url.href;
  } catch { return undefined; }
}

export function restoreFreshImageStatuses(statuses: Record<string, ImageStatusRecord> | undefined, now = Date.now()): Record<string, ImageStatusRecord> {
  const fresh: Record<string, ImageStatusRecord> = {};
  for (const [key, status] of Object.entries(statuses ?? {})) {
    if (!Number.isInteger(status.code) || status.code === 429 || !Number.isFinite(status.checkedAt)
      || status.checkedAt! > now || status.checkedAt! + IMAGE_STATUS_TTL_MS <= now) continue;
    fresh[key] = { ...status, kind: status.code! >= 200 && status.code! < 400 ? 'ok' : 'broken',
      checkedAt: status.checkedAt, expiresAt: status.checkedAt! + IMAGE_STATUS_TTL_MS, source: 'cache' };
  }
  return fresh;
}

export function imageCooldownUntil(retryAfter: string | undefined, receivedAt: number): number {
  if (retryAfter && /^\s*\d+\s*$/.test(retryAfter)) {
    const seconds = Number(retryAfter.trim());
    const until = receivedAt + seconds * 1000;
    if (Number.isFinite(seconds) && Number.isFinite(until) && until <= 8.64e15) return until;
  }
  if (retryAfter) {
    const date = Date.parse(retryAfter);
    if (Number.isFinite(date) && date <= 8.64e15) return Math.max(receivedAt, date);
  }
  return receivedAt + DEFAULT_IMAGE_COOLDOWN_MS;
}

export function imageStatusKind(status: ImageStatusRecord | undefined, now: number): 'ok' | 'broken' | 'unchecked' {
  if (!status?.code || !Number.isFinite(status.checkedAt)) return 'unchecked';
  if (status.checkedAt! + IMAGE_STATUS_TTL_MS <= now) return 'unchecked';
  return status.code >= 200 && status.code < 400 ? 'ok' : 'broken';
}

export function imageStatusSource(status: ImageStatusRecord | undefined, now: number, refreshing = false): 'live' | 'cache' | 'previous' | undefined {
  if (!status?.code) return undefined;
  if (refreshing) return 'previous';
  if (!Number.isFinite(status.checkedAt) || status.checkedAt! + IMAGE_STATUS_TTL_MS <= now) return 'previous';
  return status.source === 'cache' ? 'cache' : status.source === 'previous' ? 'previous' : 'live';
}
