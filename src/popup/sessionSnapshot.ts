import type { SeoResult } from '../types/seo';

export type SnapshotReply =
  | { ok: true; generation: number; result?: SeoResult }
  | { ok: false; reason: string; generation?: number };

type SnapshotMessage =
  | { type: 'SNAPSHOT_GET'; tabId: number; url: string }
  | { type: 'SNAPSHOT_START'; tabId: number; url: string }
  | { type: 'SNAPSHOT_IMAGE_STATUSES_PUT'; tabId: number; url: string; generation: number; scannedAt: number; imageStatuses: NonNullable<SeoResult['imageStatuses']> }
  | { type: 'SNAPSHOT_PUT'; tabId: number; url: string; generation: number; result: SeoResult };

async function send(message: SnapshotMessage): Promise<SnapshotReply> {
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
