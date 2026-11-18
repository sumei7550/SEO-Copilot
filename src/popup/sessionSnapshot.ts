import type { ImageStatusRecord, SeoResult } from '../types/seo';

export type SnapshotReply =
  | { ok: true; generation: number; result?: SeoResult }
  | { ok: false; reason: string; generation?: number };

type SnapshotMessage =
  | { type: 'SNAPSHOT_GET'; tabId: number; url: string }
  | { type: 'SNAPSHOT_START'; tabId: number; url: string }
  | { type: 'SNAPSHOT_IMAGE_STATUSES_PUT'; tabId: number; url: string; generation: number; scannedAt: number; imageStatuses: NonNullable<SeoResult['imageStatuses']> }
  | { type: 'SNAPSHOT_PUT'; tabId: number; url: string; generation: number; result: SeoResult };

type ImageStatusMessage =
  | { type: 'IMAGE_STATUS_STATE_GET'; pageOrigin: string; urls: string[] }
  | { type: 'IMAGE_REFRESH_RUN_START'; tabId: number; url: string; generation: number; scannedAt: number }
  | { type: 'IMAGE_STATUS_STATE_PUT'; tabId: number; url: string; generation: number; scannedAt: number; runId: number; imageStatuses: NonNullable<SeoResult['imageStatuses']>; cacheEntries: Array<{ url: string; status: ImageStatusRecord }> }
  | { type: 'IMAGE_STATUS_COOLDOWNS_PUT'; cooldowns: Record<string, number> };

async function send(message: SnapshotMessage | ImageStatusMessage): Promise<SnapshotReply> {
  try {
    const response = await chrome.runtime.sendMessage(message) as SnapshotReply | undefined;
    return response && typeof response.ok === 'boolean' ? response : { ok: false, reason: 'unavailable' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function getSnapshot(tabId: number, url: string): Promise<SnapshotReply> {
  return send({ type: 'SNAPSHOT_GET', tabId, url });
}

export function startSnapshotScan(tabId: number, url: string): Promise<SnapshotReply> {
  return send({ type: 'SNAPSHOT_START', tabId, url });
}

export function putSnapshot(tabId: number, url: string, generation: number, result: SeoResult): Promise<SnapshotReply> {
  return send({ type: 'SNAPSHOT_PUT', tabId, url, generation, result });
}

export function putImageStatuses(tabId: number, url: string, generation: number, scannedAt: number, imageStatuses: NonNullable<SeoResult['imageStatuses']>): Promise<SnapshotReply> {
  return send({ type: 'SNAPSHOT_IMAGE_STATUSES_PUT', tabId, url, generation, scannedAt, imageStatuses });
}

export async function getImageStatusState(pageOrigin: string, urls: string[]) {
  const response = await send({ type: 'IMAGE_STATUS_STATE_GET', pageOrigin, urls });
  return response as SnapshotReply & { cache?: Record<string, ImageStatusRecord>; cooldowns?: Record<string, number> };
}

export async function startImageRefreshRun(tabId: number, url: string, generation: number, scannedAt: number) {
  const response = await send({ type: 'IMAGE_REFRESH_RUN_START', tabId, url, generation, scannedAt });
  return response as SnapshotReply & { runId?: number };
}

export async function putImageStatusState(
  tabId: number,
  url: string,
  generation: number,
  scannedAt: number,
  runId: number,
  imageStatuses: NonNullable<SeoResult['imageStatuses']>,
  cacheEntries: Array<{ url: string; status: ImageStatusRecord }>
) {
  const message: ImageStatusMessage = { type: 'IMAGE_STATUS_STATE_PUT', tabId, url, generation, scannedAt, runId, imageStatuses, cacheEntries };
  return send(message);
}

export async function putImageCooldowns(cooldowns: Record<string, number>) {
  const message: ImageStatusMessage = { type: 'IMAGE_STATUS_COOLDOWNS_PUT', cooldowns };
  return send(message);
}
