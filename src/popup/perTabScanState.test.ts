import { describe, expect, it } from 'vitest';
import type { SeoResult } from '../types/seo';
import { PerTabScanState } from './perTabScanState';

const result = (score: number) => ({ score, scannedAt: score }) as SeoResult;
const A = 'https://a.test/';
const B = 'https://b.test/';

describe('per-tab scan state', () => {
  it('restores each report after switching tabs and preserves same-URL refresh', () => {
    const store = new PerTabScanState();
    const a = store.start(1, A, 'first')!;
    const b = store.start(2, B, 'first')!;
    expect(store.complete(1, A, a, result(70))).toBe(true);
    expect(store.complete(2, B, b, result(80))).toBe(true);
    expect(store.get(1, A)).toMatchObject({ status: 'report', result: { score: 70 } });
    expect(store.get(2, B)).toMatchObject({ status: 'report', result: { score: 80 } });
    expect(store.get(1, A).status).toBe('report');
  });

  it('keeps scanning on tab switch and completes the owning tab only', () => {
    const store = new PerTabScanState();
    const a = store.start(1, A, 'first')!;
    const b = store.start(2, B, 'first')!;
    expect(store.get(1, A).status).toBe('scanning');
    expect(store.complete(2, B, b, result(80))).toBe(true);
    expect(store.get(1, A).status).toBe('scanning');
    expect(store.complete(1, A, a, result(70))).toBe(true);
    expect(store.get(1, A)).toMatchObject({ status: 'report', result: { score: 70 } });
  });

  it('rejects stale results after URL change and newer scans', () => {
    const store = new PerTabScanState();
    const first = store.start(1, A, 'first')!;
    expect(store.get(1, `${A}other`).status).toBe('idle');
    expect(store.complete(1, A, first, result(10))).toBe(false);
    const second = store.start(1, A, 'first')!;
    expect(store.complete(1, A, first, result(10))).toBe(false);
    expect(store.complete(1, A, second, result(20))).toBe(true);
  });

  it('supports rescan and only removes the closed tab', () => {
    const store = new PerTabScanState();
    const a = store.start(1, A, 'first')!;
    const b = store.start(2, B, 'first')!;
    store.complete(1, A, a, result(50));
    store.complete(2, B, b, result(60));
    const again = store.start(1, A, 'rescan')!;
    expect(store.start(1, A, 'rescan')).toBeUndefined();
    expect(store.complete(1, A, again, result(90))).toBe(true);
    expect(store.get(1, A)).toMatchObject({ status: 'report', result: { score: 90 } });
    const failing = store.start(1, A, 'rescan')!;
    expect(store.fail(1, A, failing, 'Failed')).toBe(true);
    expect(store.get(1, A)).toMatchObject({ status: 'error', scanType: 'rescan' });
    store.remove(1);
    expect(store.get(1, A).status).toBe('idle');
    expect(store.get(2, B).status).toBe('report');
  });
});
