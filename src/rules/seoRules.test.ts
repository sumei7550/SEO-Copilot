import { describe, expect, it } from 'vitest';
import { analyzePage } from '../analyzer/pageAnalyzer';
import type { PageData } from '../types/seo';
import { evaluateRules, seoRules } from './seoRules';

function validPage(overrides: Partial<PageData> = {}): PageData {
  const base: PageData = {
    url: 'https://example.com/products/seo-copilot',
    title: 'A descriptive SEO title with the right length',
    titleTagCount: 1,
    metaDescription: 'A useful meta description that clearly explains the page content, its value, and what visitors can expect before opening the result in search.',
    headings: [{ level: 1, text: 'SEO Copilot' }, { level: 2, text: 'Features' }, { level: 3, text: 'Audits' }],
    images: [{ src: 'hero.webp', alt: 'SEO audit report', auditable: true, naturalWidth: 1200, naturalHeight: 800, renderedWidth: 1200, renderedHeight: 800, transferSize: 120_000 }],
    canonical: 'https://example.com/products/seo-copilot',
    schemas: [{ type: 'Product' }],
    invalidSchemaCount: 0,
    wordCount: 500,
    textRatio: 0.25
  };
  return { ...base, ...overrides };
}

function issuesFor(page: PageData) {
  return evaluateRules(page, analyzePage(page));
}

describe('evaluateRules', () => {
  it('defines the 20 rules required by the engine specification', () => {
    expect(seoRules).toHaveLength(20);
    expect(new Set(seoRules.map((rule) => rule.id)).size).toBe(20);
  });

  it('returns no issues for a page that meets all MVP rules', () => {
    expect(issuesFor(validPage())).toEqual([]);
  });

  it('reports missing critical metadata and technical recommendations', () => {
    const issues = issuesFor(validPage({ title: '', metaDescription: '', headings: [], canonical: '', schemas: [] }));
    expect(issues.map((issue) => issue.id)).toEqual(expect.arrayContaining(['TITLE_001', 'META_001', 'HEADING_001', 'TECH_001', 'TECH_002']));
    expect(issues.every((issue) => issue.impactKey && issue.solutionKey && issue.impact <= 0)).toBe(true);
  });

  it('detects structural, image, URL, schema, and content issues', () => {
    const issues = issuesFor(validPage({
      url: `https://example.com/${'x'.repeat(110)}?a=1&b=2&c=3&d=4`,
      headings: [{ level: 1, text: 'Title' }, { level: 3, text: 'Skipped' }],
      images: [{ src: 'hero.jpg', alt: null, auditable: true, naturalWidth: 3000, naturalHeight: 2000, renderedWidth: 1200, renderedHeight: 800, transferSize: 900_000 }],
      invalidSchemaCount: 1,
      wordCount: 50,
      textRatio: 0.02
    }));
    expect(issues.map((issue) => issue.id)).toEqual(expect.arrayContaining(['HEADING_003', 'IMAGE_001', 'IMAGE_002', 'IMAGE_003', 'URL_001', 'URL_002', 'TECH_003', 'CONTENT_001', 'CONTENT_002']));
    expect(issues.find((issue) => issue.id === 'CONTENT_002')?.impact).toBe(0);
  });

  it('reports multiple title elements in head, not body examples', () => {
    expect(issuesFor(validPage({ titleTagCount: 1 })).map((issue) => issue.id)).not.toContain('TITLE_004');
    expect(issuesFor(validPage({ titleTagCount: 2 })).map((issue) => issue.id)).toContain('TITLE_004');
  });

  it('IMAGE_001 checks missing alt only on auditable images', () => {
    const issues = issuesFor(validPage({ images: [
      { src: 'decorative.svg', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 100, transferSize: 0 },
      { src: 'icon.svg', alt: '', auditable: true, naturalWidth: 24, naturalHeight: 24, transferSize: 0 },
      { src: 'product.jpg', alt: null, auditable: true, naturalWidth: 800, naturalHeight: 600, transferSize: 0 },
      { src: 'hidden.png', alt: null, auditable: false, naturalWidth: 800, naturalHeight: 600, transferSize: 0 }
    ] }));

    expect(issues.map((issue) => issue.id)).toContain('IMAGE_001');
    expect(issuesFor(validPage({ images: [
      { src: 'decorative.svg', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 100, transferSize: 0 },
      { src: 'hidden.png', alt: null, auditable: false, naturalWidth: 800, naturalHeight: 600, transferSize: 0 }
    ] })).map((issue) => issue.id)).not.toContain('IMAGE_001');
  });

  it.each([
    ['Apple product page', 'https://www.apple.com/shop/buy-iphone', 6, 2, false],
    ['Shopify page', 'https://example.myshopify.com/products/widget', 4, 3, true],
    ['decorative images', 'https://example.com/decorative', 0, 0, false],
    ['hidden images', 'https://example.com/hidden', 0, 0, false]
  ])('IMAGE_002 uses auditable images for %s', (_name, url, auditableCount, missingAltCount, expectedIssue) => {
    const images = Array.from({ length: auditableCount }, (_, index) => ({
      src: `content-${index}.jpg`, alt: index < missingAltCount ? null : `Image ${index}`,
      auditable: true, naturalWidth: 800, naturalHeight: 600, transferSize: 0
    }));
    const excludedImages = _name === 'decorative images' || _name === 'hidden images'
      ? [{ src: `${_name}.png`, alt: null, auditable: false, naturalWidth: 800, naturalHeight: 600, transferSize: 0 }]
      : [];
    const issues = issuesFor(validPage({ url, images: [...images, ...excludedImages] }));
    expect(issues.map((issue) => issue.id).includes('IMAGE_002')).toBe(expectedIssue);
  });

  it('IMAGE_003 prioritizes real transfer size and avoids Retina/CDN false positives', () => {
    const appleCdn = { src: 'https://cdn.apple.com/hero.webp', alt: 'iPhone', auditable: true, naturalWidth: 2880, naturalHeight: 1800, renderedWidth: 1440, renderedHeight: 900, transferSize: 180_000 };
    const ordinary = { src: 'hero.jpg', alt: 'Hero', auditable: true, naturalWidth: 1600, naturalHeight: 900, renderedWidth: 800, renderedHeight: 450, transferSize: 620_000 };
    const sourceOversized = { src: 'gallery.avif', alt: 'Gallery', auditable: true, naturalWidth: 5000, naturalHeight: 4000, renderedWidth: 500, renderedHeight: 400, transferSize: 90_000 };

    expect(issuesFor(validPage({ images: [appleCdn] })).map((issue) => issue.id)).not.toContain('IMAGE_003');
    expect(issuesFor(validPage({ images: [ordinary] })).map((issue) => issue.id)).toContain('IMAGE_003');
    expect(issuesFor(validPage({ images: [sourceOversized] })).map((issue) => issue.id)).toContain('IMAGE_003');
  });

  it('IMAGE_003 excludes unloaded, hidden, and non-auditable images', () => {
    const images = [
      { src: 'lazy.jpg', alt: null, auditable: false, naturalWidth: 0, naturalHeight: 0, renderedWidth: 0, renderedHeight: 0, transferSize: 900_000 },
      { src: 'hidden.jpg', alt: null, auditable: false, naturalWidth: 6000, naturalHeight: 4000, renderedWidth: 600, renderedHeight: 400, transferSize: 900_000 }
    ];
    expect(issuesFor(validPage({ images })).map((issue) => issue.id)).not.toContain('IMAGE_003');
  });
});
