import type { QuickMetadata, MetadataError } from './quickMetadata';

export type MetadataState =
  | { status: 'idle'; url: string; generation: number }
  | { status: 'reading'; url: string; generation: number; requestId: number }
  | { status: 'ready'; url: string; generation: number; data: QuickMetadata }
  | { status: 'error'; url: string; generation: number; kind: MetadataError };

export class PerTabMetadataState {
  private states = new Map<number, MetadataState>();
  private nextRequestId = 0;

  peek(tabId: number, url: string): MetadataState {
    const state = this.states.get(tabId);
    return state?.url === url ? state : { status: 'idle', url, generation: state?.generation ?? 0 };
  }

  invalidate(tabId: number, url: string): void {
    const current = this.states.get(tabId);
    this.states.set(tabId, { status: 'idle', url, generation: (current?.generation ?? 0) + 1 });
  }

  begin(tabId: number, url: string): { generation: number; requestId: number } | undefined {
    const current = this.peek(tabId, url);
    if (current.status !== 'idle') return undefined;
    const request = { generation: current.generation, requestId: ++this.nextRequestId };
    this.states.set(tabId, { status: 'reading', url, ...request });
    return request;
  }

  isCurrent(tabId: number, url: string, generation: number, requestId: number): boolean {
    const state = this.states.get(tabId);
    return state?.status === 'reading' && state.url === url && state.generation === generation && state.requestId === requestId;
  }

  complete(tabId: number, url: string, generation: number, requestId: number, data: QuickMetadata): boolean {
    if (!this.isCurrent(tabId, url, generation, requestId) || data.url !== url) return false;
    this.states.set(tabId, { status: 'ready', url, generation, data });
    return true;
  }

  fail(tabId: number, url: string, generation: number, requestId: number, kind: MetadataError): boolean {
    if (!this.isCurrent(tabId, url, generation, requestId)) return false;
    this.states.set(tabId, { status: 'error', url, generation, kind });
    return true;
  }

  completeFromAudit(tabId: number, url: string, generation: number, data: QuickMetadata): boolean {
    const state = this.peek(tabId, url);
    if (state.generation !== generation || data.url !== url) return false;
    this.states.set(tabId, { status: 'ready', url, generation, data });
    return true;
  }

  remove(tabId: number): void {
    this.states.delete(tabId);
  }
}
