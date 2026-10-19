import type { SeoResult } from '../types/seo';

export type ScanType = 'first' | 'rescan';
export type TabScanState =
  | { status: 'idle'; url: string }
  | { status: 'scanning'; url: string; scanId: number; scanType: ScanType }
  | { status: 'report'; url: string; scanId: number; result: SeoResult }
  | { status: 'error'; url: string; scanId: number; scanType: ScanType; message: string };

export class PerTabScanState {
  private states = new Map<number, TabScanState>();
  private nextScanId = 0;

  get(tabId: number, url: string): TabScanState {
    const state = this.states.get(tabId);
    if (state?.url === url) return state;
    const idle: TabScanState = { status: 'idle', url };
    this.states.set(tabId, idle);
    return idle;
  }

  peek(tabId: number, url: string): TabScanState {
    const state = this.states.get(tabId);
    return state?.url === url ? state : { status: 'idle', url };
  }

  start(tabId: number, url: string, scanType: ScanType): number | undefined {
    const current = this.get(tabId, url);
    if (current.status === 'scanning') return undefined;
    const scanId = ++this.nextScanId;
    this.states.set(tabId, { status: 'scanning', url, scanId, scanType });
    return scanId;
  }

  isCurrent(tabId: number, url: string, scanId: number): boolean {
    const state = this.states.get(tabId);
    return state?.status === 'scanning' && state.url === url && state.scanId === scanId;
  }

  complete(tabId: number, url: string, scanId: number, result: SeoResult): boolean {
    if (!this.isCurrent(tabId, url, scanId)) return false;
    this.states.set(tabId, { status: 'report', url, scanId, result });
    return true;
  }

  fail(tabId: number, url: string, scanId: number, message: string): boolean {
    const state = this.states.get(tabId);
    if (state?.status !== 'scanning' || !this.isCurrent(tabId, url, scanId)) return false;
    this.states.set(tabId, { status: 'error', url, scanId, scanType: state.scanType, message });
    return true;
  }

  remove(tabId: number): TabScanState | undefined {
    const previous = this.states.get(tabId);
    this.states.delete(tabId);
    return previous;
  }
}
