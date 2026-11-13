import { describe, expect, it } from 'vitest';
import { scanPage } from './scanner';

interface FixtureOptions {
  schemaScripts?: string[];
  bodyText?: string;
  html?: string;
  headTitleCount?: number;
  bodyTitleCount?: number;
}

function documentFixture(options: FixtureOptions = {}): Document {
  const headings = [
    { tagName: 'H1', textContent: 'SEO audit' },
    { tagName: 'H2', textContent: 'Checks' },
    { tagName: 'H3', textContent: 'Metadata' }
  ];
  const scripts = (options.schemaScripts ?? ['{"@type":"Article"}']).map((textContent) => ({ textContent }));
  const images = [{
    currentSrc: 'https://example.com/hero.webp', src: 'https://example.com/hero.webp', alt: 'SEO report',
    naturalWidth: 1200, naturalHeight: 800, width: 1200, height: 800,
    hasAttribute: (name: string) => name === 'alt'
  }];

  return {
    title: 'A complete SEO title for the scanner fixture',
    images,
    body: { textContent: options.bodyText ?? 'Useful page content '.repeat(120) },
    documentElement: { outerHTML: options.html ?? '<html>Useful page content</html>'.repeat(40) },
    querySelectorAll: (selector: string) => {
      if (selector === 'h1, h2, h3') return headings;
      if (selector === 'script[type="application/ld+json"]') return scripts;
      if (selector === 'head > title') return Array.from({ length: options.headTitleCount ?? 1 }, () => ({ textContent: 'A complete SEO title for the scanner fixture' }));
      if (selector === 'title') return Array.from({ length: options.bodyTitleCount ?? 1 }, () => ({ textContent: 'Example title in body content' }));
      return [];
    },
    querySelector: (selector: string) => {
      if (selector === 'meta[name="description" i]') return { content: 'A useful fixture description that explains the page clearly and stays within a sensible search snippet length.' };
      if (selector === 'link[rel="canonical" i]') return { href: 'https://example.com/audit' };
      return null;
    }
  } as unknown as Document;
}

const locationFixture = { href: 'https://example.com/audit' } as Location;

it('keeps image body size separate from header-inclusive transfer size', () => {
  const performanceValue = { getEntriesByType: () => [{ name: 'https://example.com/hero.webp', transferSize: 300, encodedBodySize: 700, decodedBodySize: 898 }] } as unknown as Performance;
  const image = scanPage(documentFixture(), locationFixture, performanceValue).images[0];
  expect(image.fileSize).toBe(898);
  expect(image.transferSize).toBe(300);
});

it('does not interpret response header bytes as image file size', () => {
  const performanceValue = { getEntriesByType: () => [{ name: 'https://example.com/hero.webp', transferSize: 300, encodedBodySize: 0, decodedBodySize: 0 }] } as unknown as Performance;
  expect(scanPage(documentFixture(), locationFixture, performanceValue).images[0].fileSize).toBeUndefined();
});

describe('scanPage', () => {
  it('keeps network images in DOM order while excluding embedded and tracking-sized images', () => {
    const doc = documentFixture();
    const makeImage = (src: string, width: number, alt: string | null = null) => ({
      currentSrc: src, src, alt: alt ?? '', naturalWidth: width, naturalHeight: width,
      width, height: width, hasAttribute: (name: string) => name === 'alt' && alt !== null
    });
    (doc as unknown as { images: unknown[] }).images = [
      makeImage('data:image/svg+xml;base64,PHN2Zz4=', 32),
      makeImage('https://example.com/photo.png', 64),
      makeImage('https://example.com/pixel.gif', 1),
      makeImage('https://example.com/photo.png', 64),
      makeImage('https://example.com/unloaded.png', 0),
    ];
    const page = scanPage(doc, locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.images.map((image) => image.src)).toEqual(['https://example.com/photo.png', 'https://example.com/photo.png']);
    expect(page.excludedImageCount).toBe(3);
    expect(page.imageLimitReached).toBe(false);
  });

  it('applies the 1000-image limit after excluding embedded images', () => {
    const doc = documentFixture();
    const makeImage = (src: string) => ({ currentSrc: src, src, alt: '', naturalWidth: 20, naturalHeight: 20,
      width: 20, height: 20, hasAttribute: () => false });
    (doc as unknown as { images: unknown[] }).images = [
      ...Array.from({ length: 30 }, () => makeImage('data:image/svg+xml;base64,PHN2Zz4=')),
      ...Array.from({ length: 1001 }, (_, index) => makeImage(`https://example.com/${index}.png`))
    ];
    const page = scanPage(doc, locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.images).toHaveLength(1000);
    expect(page.images[0].src).toBe('https://example.com/0.png');
    expect(page.images[999].src).toBe('https://example.com/999.png');
    expect(page.excludedImageCount).toBe(30);
    expect(page.imageLimitReached).toBe(true);
  });

  it('collects structured page data without retaining raw visible text', () => {
    const page = scanPage(documentFixture(), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.url).toBe('https://example.com/audit');
    expect(page.headings.map((heading) => heading.level)).toEqual([1, 2, 3]);
    expect(page.images[0]).toMatchObject({ alt: 'SEO report', auditable: true, naturalWidth: 1200, renderedWidth: 1200, renderedHeight: 800 });
    expect(page.schemas).toMatchObject([{ type: 'Article', format: 'JSON-LD', properties: { '@type': 'Article' } }]);
    expect(page.jsonLdBlockCount).toBe(1);
    expect(page.wordCount).toBeGreaterThan(300);
    expect(page).not.toHaveProperty('visibleText');
  });

  it('isolates invalid JSON-LD instead of throwing', () => {
    const page = scanPage(documentFixture({ schemaScripts: ['{"@type":"Product"}', '{bad json'] }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.schemas).toMatchObject([{ type: 'Product', format: 'JSON-LD', properties: { '@type': 'Product' } }]);
    expect(page.invalidSchemaCount).toBe(1);
    expect(page.jsonLdBlockCount).toBe(2);
  });

  it('counts JSON-LD script blocks rather than parsed array items or types', () => {
    const page = scanPage(documentFixture({ schemaScripts: ['[{"@type":"Article"},{"@type":"WebPage"}]', '{"name":"no type"}'] }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.jsonLdBlockCount).toBe(2);
    expect(page.schemas).toHaveLength(3);
    expect(page.invalidSchemaCount).toBe(0);
    expect(scanPage(documentFixture({ schemaScripts: [] }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance).jsonLdBlockCount).toBe(0);
  });

  it('counts CJK characters for multilingual content analysis', () => {
    const page = scanPage(documentFixture({ bodyText: '这是一个用于搜索引擎优化分析的中文页面内容。'.repeat(20) }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.wordCount).toBeGreaterThan(300);
  });

  it('uses rendered text instead of CSS-hidden SPA content when available', () => {
    const doc = documentFixture({ bodyText: `Visible page text ${'Hidden payload '.repeat(500)}` });
    Object.assign(doc.body, { innerText: 'Visible page text', querySelectorAll: () => [] });
    const page = scanPage(doc, locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.wordCount).toBe(3);
  });

  it('counts only title elements directly under head', () => {
    const page = scanPage(documentFixture({ headTitleCount: 1, bodyTitleCount: 3 }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.titleTagCount).toBe(1);
  });

  it('counts multiple title elements in head', () => {
    const page = scanPage(documentFixture({ headTitleCount: 2 }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.titleTagCount).toBe(2);
  });
});
