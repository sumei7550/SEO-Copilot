// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { previewResult } from '../popup/previewResult';
import type { SeoResult } from '../types/seo';
import { headingsAsTsv } from './ContentAnalysis';
import { Report } from './Report';
import { analyzePage } from '../analyzer/pageAnalyzer';
import { evaluateRules } from '../rules/seoRules';
import { calculateScore } from '../scoring/score';

vi.mock('../analytics', () => ({ trackExtension: vi.fn() }));

let container: HTMLDivElement;
let root: Root;

async function render(result: SeoResult) {
  await act(async () => { root.render(<Report result={result} onRescan={() => undefined} />); });
}

async function click(label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.trim() === label);
  expect(button, label).toBeDefined();
  await act(async () => { button!.click(); });
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
});

describe('P1-A report', () => {
  it('opens the Images category when requested from a popup image', async () => {
    const result = structuredClone(previewResult);
    await act(async () => { root.render(<Report result={result} initialCategory="images" onRescan={() => undefined} />); });
    expect(container.querySelector('.audit-category-card:last-child')?.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.audit-list-heading h3')?.textContent).toBe('Images');
  });
  it('shows one zero-point Images Info issue affecting five images at score 100', async () => {
    const page = { ...previewResult.page, canonical: previewResult.page.url, schemas: [{ type: 'Article' }], metaDescription: 'A useful description of this example page and its content that fits within the expected description length range.', images: Array.from({ length: 5 }, (_, index) => ({ src: `${index}.svg`, alt: '', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 0 })) };
    const metrics = analyzePage(page);
    const issues = evaluateRules(page, metrics);
    const result = { ...previewResult, page, metrics, issues, ...calculateScore(issues) };
    await render(result);
    expect(result.score).toBe(100);
    expect(issues).toHaveLength(1);
    expect(container.querySelector('.audit-category-card:last-child')?.textContent).toBe('Images1');
    expect(Array.from(container.querySelectorAll('.severity-summary b'), (item) => item.textContent)).toEqual(['0', '0', '1']);
    expect(container.querySelector('.issue-card h3')?.textContent).toBe('Review empty alt text');
    expect(container.querySelector('.issue-card')?.textContent).toContain('Affected images5');
    expect(container.querySelector('.issue-card .impact')?.textContent).toContain('0');
    expect(container.querySelector('.ai-fix-button')).toBeNull();
  });
  it('formats complete, repeated headings as one TSV row each', () => {
    const longText = 'A long heading that must remain complete across the copied output';
    expect(headingsAsTsv([
      { level: 2, text: 'Repeated' },
      { level: 2, text: 'Repeated' },
      { level: 3, text: `First\tpart\n${longText}` },
    ])).toBe(`H2\tRepeated\nH2\tRepeated\nH3\tFirst part ${longText}`);
  });

  it('counts actual issues across the four groups and filters without changing totals', async () => {
    const result = structuredClone(previewResult);
    const originalIssues = structuredClone(result.issues);
    await render(result);
    const cards = Array.from(container.querySelectorAll('.audit-category-card'));
    expect(cards.map((item) => item.textContent)).toEqual(['Content SEO1', 'Page Structure0', 'Technical SEO2', 'Images0']);
    expect(container.querySelectorAll('.issue-card')).toHaveLength(3);
    await click('Technical SEO2');
    expect(container.querySelectorAll('.issue-card')).toHaveLength(2);
    expect(container.querySelector('.issue-count')?.textContent).toBe('3');
    expect(Array.from(container.querySelectorAll('.severity-summary b')).map((item) => item.textContent)).toEqual(['0', '2', '1']);
    expect(result.issues).toEqual(originalIssues);
    expect(result.score).toBe(88);
    await click('Show all issues');
    expect(container.querySelectorAll('.issue-card')).toHaveLength(3);
  });

  it('keeps only Audit and restores the complete list from an empty category', async () => {
    await render(structuredClone(previewResult));
    expect(container.textContent).not.toContain('Content Analysis');
    expect(container.querySelector('.report-tabs')).toBeNull();
    await click('Images0');
    expect(container.textContent).toContain('No issues in this category');
    await click('Show all issues');
    expect(container.querySelectorAll('.issue-card')).toHaveLength(3);
  });
});
