import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// @ts-expect-error jsdom has no bundled declarations in this test-only dependency.
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { scanPage } from './scanner';
import { analyzePage } from './pageAnalyzer';
import { evaluateRules } from '../rules/seoRules';
import { calculateScore } from '../scoring/score';

function inspectFixture(name: string) {
  const file = fileURLToPath(new URL(`../../docs/testing/phase2/fixtures/${name}.html`, import.meta.url));
  const dom = new JSDOM(readFileSync(file, 'utf8'), { url: `https://fixture.test/${name}` });
  if (name === 'images-mixed') {
    const pixel = dom.window.document.querySelector<HTMLImageElement>('img[src$="pixel.gif"]')!;
    Object.defineProperties(pixel, { naturalWidth: { value: 1 }, naturalHeight: { value: 1 } });
  }
  const page = scanPage(
    dom.window.document,
    dom.window.location as Location,
    { getEntriesByType: () => [] } as unknown as Performance
  );
  const metrics = analyzePage(page);
  const issues = evaluateRules(page, metrics);
  return { page, metrics, issues, score: calculateScore(issues) };
}

describe('Phase 2 HTML fixture observations', () => {
  it('reports missing description and no H1 as separate Audit rules', () => {
    const { page, issues } = inspectFixture('metadata-no-headings');
    expect(page.metaDescription).toBe('');
    expect(page.headings).toHaveLength(0);
    expect(issues.map((issue) => issue.id)).toEqual(expect.arrayContaining(['META_001', 'HEADING_001']));
  });

  it('reports a non-H1 first heading when an H1 appears later', () => {
    const { page, issues } = inspectFixture('heading-order');
    expect(page.headings.map((heading) => heading.level)).toEqual([2, 1]);
    expect(issues.map((issue) => issue.id)).toContain('HEADING_004');
    expect(issues.map((issue) => issue.id)).not.toContain('HEADING_001');
  });

  it('counts DOM image occurrences, retains duplicate URLs and separates missing from empty alt', () => {
    const { page, metrics, issues } = inspectFixture('images-mixed');
    expect(page.images).toHaveLength(4);
    expect(page.excludedImageCount).toBe(2);
    expect(page.images[0].src).toBe(page.images[1].src);
    expect(metrics.imagesWithoutAlt).toBe(2);
    expect(metrics.altCoverage).toBe(50);
    expect(issues.map((issue) => issue.id).filter((id) => id.startsWith('IMAGE_'))).toEqual(['IMAGE_001', 'IMAGE_004']);
  });

  it('does not turn the robots noindex signal into a Side Panel Issue', () => {
    const { page, issues } = inspectFixture('index-noindex');
    expect(page.canonical).toBe('https://fixture.test/index-noindex');
    expect(page.headings[0].level).toBe(1);
    expect(issues.some((issue) => issue.id === 'TECH_001')).toBe(false);
    expect(issues.some((issue) => /noindex/i.test(issue.id))).toBe(false);
  });

  it('collects mixed schema formats and reports only the invalid JSON-LD block as an Issue', () => {
    const { page, metrics, issues } = inspectFixture('structured-mixed');
    expect(page.jsonLdBlockCount).toBe(2);
    expect(page.invalidSchemaCount).toBe(1);
    expect(page.schemas.map((schema) => [schema.format, schema.type])).toEqual([
      ['JSON-LD', 'WebPage'], ['JSON-LD', 'WebSite'],
      ['Microdata', 'Product'], ['RDFa', 'Organization']
    ]);
    expect(metrics.schemaTypes).toEqual(['WebPage', 'WebSite', 'Product', 'Organization']);
    expect(issues.map((issue) => issue.id)).toContain('TECH_003');
  });

  it('uses browser visible text for word count instead of hidden application payload', () => {
    const file = fileURLToPath(new URL('../../docs/testing/phase2/fixtures/word-count-hidden.html', import.meta.url));
    const dom = new JSDOM(readFileSync(file, 'utf8'), { url: 'https://fixture.test/word-count-hidden' });
    Object.defineProperty(dom.window.document.body, 'innerText', { value: 'Visible words only.' });
    const page = scanPage(dom.window.document, dom.window.location as Location);
    expect(page.wordCount).toBe(3);
  });
});
