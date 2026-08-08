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
    images: [{ src: 'hero.webp', alt: 'SEO audit report', naturalWidth: 1200, naturalHeight: 800, transferSize: 120_000 }],
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
      images: [{ src: 'hero.jpg', alt: null, naturalWidth: 3000, naturalHeight: 2000, transferSize: 900_000 }],
      invalidSchemaCount: 1,
      wordCount: 50,
      textRatio: 0.02
    }));
    expect(issues.map((issue) => issue.id)).toEqual(expect.arrayContaining(['HEADING_003', 'IMAGE_001', 'IMAGE_002', 'IMAGE_003', 'URL_001', 'URL_002', 'TECH_003', 'CONTENT_001', 'CONTENT_002']));
  });
});
