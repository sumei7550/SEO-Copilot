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

describe('scanPage', () => {
  it('collects structured page data without retaining raw visible text', () => {
    const page = scanPage(documentFixture(), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.url).toBe('https://example.com/audit');
    expect(page.headings.map((heading) => heading.level)).toEqual([1, 2, 3]);
    expect(page.images[0]).toMatchObject({ alt: 'SEO report', auditable: true, naturalWidth: 1200, renderedWidth: 1200, renderedHeight: 800 });
    expect(page.schemas).toEqual([{ type: 'Article' }]);
    expect(page.wordCount).toBeGreaterThan(300);
    expect(page).not.toHaveProperty('visibleText');
  });

  it('isolates invalid JSON-LD instead of throwing', () => {
    const page = scanPage(documentFixture({ schemaScripts: ['{"@type":"Product"}', '{bad json'] }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.schemas).toEqual([{ type: 'Product' }]);
    expect(page.invalidSchemaCount).toBe(1);
  });

  it('counts CJK characters for multilingual content analysis', () => {
    const page = scanPage(documentFixture({ bodyText: '这是一个用于搜索引擎优化分析的中文页面内容。'.repeat(20) }), locationFixture, { getEntriesByType: () => [] } as unknown as Performance);
    expect(page.wordCount).toBeGreaterThan(300);
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
