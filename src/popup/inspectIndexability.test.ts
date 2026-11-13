// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://example.com/blog/"}
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inspectIndexability } from './inspectIndexability';

function reply(url: string, status: number, body: string, headers: Record<string, string> = {}): Response {
  return {
    url, status, ok: status >= 200 && status < 300,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
    text: async () => body
  } as Response;
}

afterEach(() => { document.head.innerHTML = ''; vi.unstubAllGlobals(); });

describe('inspectIndexability', () => {
  it('collects DOM, raw HTML, robots, sitemap and HTTP signals from the current origin', async () => {
    document.head.innerHTML = '<meta name="robots" content="index, follow"><link rel="alternate" hreflang="fr" href="/fr/blog/">';
    const pageUrl = window.location.href;
    const fetch = vi.fn(async (input: string) => {
      if (input === pageUrl) return reply(pageUrl, 200, '<html><head><link rel="canonical" href="/blog/"></head></html>', { 'content-type': 'text/html', 'x-robots-tag': 'max-image-preview:large' });
      if (input === 'https://example.com/robots.txt') return reply(input, 200, 'User-agent: *\nAllow: /\nSitemap: https://example.com/map.xml', { 'content-type': 'text/plain' });
      if (input === 'https://example.com/sitemap.xml') return reply(input, 404, 'Not found');
      throw new Error(`Unexpected request: ${input}`);
    });
    vi.stubGlobal('fetch', fetch);

    const signals = await inspectIndexability(pageUrl);
    expect(signals).toEqual({
      pageUrl,
      rawCanonical: pageUrl,
      robotsMeta: 'index, follow',
      xRobotsTag: 'max-image-preview:large',
      robotsUrl: 'https://example.com/robots.txt',
      sitemapUrls: ['https://example.com/map.xml'],
      hreflangs: [{ language: 'fr', url: 'https://example.com/fr/blog/' }]
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('keeps failed requests unchecked while identifying confirmed missing signals', async () => {
    const pageUrl = window.location.href;
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      if (input === pageUrl) return reply(pageUrl, 200, '<html><head></head></html>', { 'content-type': 'text/html' });
      if (input === 'https://example.com/robots.txt') return reply(input, 404, 'Not found');
      if (input === 'https://example.com/sitemap.xml') throw new Error('Blocked');
      throw new Error(`Unexpected request: ${input}`);
    }));

    const signals = await inspectIndexability(pageUrl);
    expect(signals.rawCanonical).toBeNull();
    expect(signals.robotsMeta).toBeNull();
    expect(signals.xRobotsTag).toBeNull();
    expect(signals.robotsUrl).toBeNull();
    expect(signals.hreflangs).toBeNull();
    expect(signals.sitemapUrls).toBeUndefined();
  });

  it('shows every robots and Googlebot directive in document order', async () => {
    document.head.innerHTML = '<meta name="robots" content="index,follow"><meta name="robots" content="index, follow"><meta name="googlebot" content="index, follow, max-snippet:-1"><meta name="bingbot" content="noindex">';
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Blocked'); }));

    const signals = await inspectIndexability(window.location.href);
    expect(signals.robotsMeta).toBe('index,follow, index, follow, index, follow, max-snippet:-1');
  });
});
