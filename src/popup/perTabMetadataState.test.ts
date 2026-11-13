import { describe, expect, it } from 'vitest';
import { PerTabMetadataState } from './perTabMetadataState';

const A = 'https://a.example/';
const B = 'https://b.example/';
const data = (url: string, title: string) => ({ url, title, metaDescription: `${title} description` });

describe('per-tab Metadata state', () => {
  it('starts reading before an audit and keeps tab data separate', () => {
    const store = new PerTabMetadataState();
    const a = store.begin(1, A)!;
    const b = store.begin(2, B)!;
    expect(store.complete(1, A, a.generation, a.requestId, data(A, 'A'))).toBe(true);
    expect(store.complete(2, B, b.generation, b.requestId, data(B, 'B'))).toBe(true);
    expect(store.peek(1, A)).toMatchObject({ status: 'ready', data: { title: 'A' } });
    expect(store.peek(2, B)).toMatchObject({ status: 'ready', data: { title: 'B' } });
  });

  it('invalidates old results on URL change and same-URL refresh', () => {
    const store = new PerTabMetadataState();
    const old = store.begin(1, A)!;
    store.invalidate(1, A);
    expect(store.complete(1, A, old.generation, old.requestId, data(A, 'old'))).toBe(false);
    const fresh = store.begin(1, A)!;
    expect(store.complete(1, A, fresh.generation, fresh.requestId, data(A, 'fresh'))).toBe(true);
    store.invalidate(1, B);
    expect(store.peek(1, B)).toMatchObject({ status: 'idle' });
    expect(store.peek(1, A)).toMatchObject({ status: 'idle' });
  });

  it('rejects a response whose actual document URL differs from the tab', () => {
    const store = new PerTabMetadataState();
    const request = store.begin(1, A)!;
    expect(store.complete(1, A, request.generation, request.requestId, data(B, 'wrong'))).toBe(false);
  });

  it('lets an audit refresh Metadata only for the same navigation generation', () => {
    const store = new PerTabMetadataState();
    const request = store.begin(1, A)!;
    expect(store.completeFromAudit(1, A, request.generation, data(A, 'audit'))).toBe(true);
    expect(store.complete(1, A, request.generation, request.requestId, data(A, 'stale auto read'))).toBe(false);
    store.invalidate(1, A);
    expect(store.completeFromAudit(1, A, request.generation, data(A, 'stale audit'))).toBe(false);
    expect(store.peek(1, A)).toMatchObject({ status: 'idle' });
  });

  it('records distinct access and read errors, then clears a closed tab', () => {
    const store = new PerTabMetadataState();
    const request = store.begin(1, A)!;
    expect(store.fail(1, A, request.generation, request.requestId, 'access-needed')).toBe(true);
    expect(store.peek(1, A)).toMatchObject({ status: 'error', kind: 'access-needed' });
    store.remove(1);
    expect(store.peek(1, A).status).toBe('idle');
  });
});
