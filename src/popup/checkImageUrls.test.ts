// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkImageUrls } from './checkImageUrls';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('image status HTTP checks', () => {
  it.each([405, 501])('falls back from HEAD %s to GET and returns only the GET result', async (headStatus) => {
    const fetchMock = vi.fn(async (_url: string, options: RequestInit) => options.method === 'HEAD'
      ? new Response(null, { status: headStatus })
      : new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    const [result] = await checkImageUrls(['https://cdn.example/image.webp']);
    expect(fetchMock.mock.calls.map(([, options]) => options.method)).toEqual(['HEAD', 'GET']);
    expect(result.code).toBe(404);
  });

  it('does not report HEAD 405 as a final status when fallback GET has no response', async () => {
    const fetchMock = vi.fn(async (_url: string, options: RequestInit) => {
      if (options.method === 'HEAD') return new Response(null, { status: 405 });
      throw new TypeError('Network error');
    });
    vi.stubGlobal('fetch', fetchMock);
    const [result] = await checkImageUrls(['https://cdn.example/image.webp']);
    expect(result.code).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns final 4xx and 5xx responses as cacheable status results', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(null, { status: url.endsWith('missing.png') ? 404 : 503 })));
    const results = await checkImageUrls(['https://cdn.example/missing.png', 'https://cdn.example/error.png']);
    expect(results.map(({ code }) => code)).toEqual([404, 503]);
    expect(results.every(({ receivedAt }) => Number.isFinite(receivedAt))).toBe(true);
  });

  it('never runs more than two status requests at once', async () => {
    let active = 0;
    let peak = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return new Response(null, { status: 200 });
    }));
    await checkImageUrls(Array.from({ length: 6 }, (_, index) => `https://cdn.example/${index}.png`));
    expect(peak).toBe(2);
  });

  it('reads Retry-After from a 429 and stops starting new requests to that Origin', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/0.png')) return new Response(null, { status: 429, headers: { 'Retry-After': '60' } });
      return new Response(null, { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const results = await checkImageUrls(Array.from({ length: 5 }, (_, index) => `https://same.example/${index}.png`));
    expect(fetchMock).toHaveBeenCalledTimes(2); // The two already-started requests may finish.
    expect(results[0]).toMatchObject({ code: 429, retryAfter: '60' });
    expect(results.slice(2).every((item) => item.code === undefined)).toBe(true);
  });

  it('allows two in-flight same-Origin requests to finish when both return 429', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);
    const results = await checkImageUrls(Array.from({ length: 8 }, (_, index) => `https://same.example/${index}.png`));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results.slice(0, 2).map(({ code }) => code)).toEqual([429, 429]);
    expect(results.slice(2).every((item) => item.code === undefined)).toBe(true);
  });

  it('continues checks for other Origins after one Origin returns 429', async () => {
    const fetchMock = vi.fn(async (url: string) => url === 'https://a.example/0.png'
      ? new Response(null, { status: 429 }) : new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const results = await checkImageUrls([
      'https://a.example/0.png', 'https://b.example/0.png', 'https://a.example/1.png', 'https://b.example/1.png',
    ]);
    expect(results.map(({ code }) => code)).toEqual([429, 200, undefined, 200]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toContain('https://b.example/1.png');
    expect(fetchMock.mock.calls.map(([url]) => url)).not.toContain('https://a.example/1.png');
  });
});
