// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { previewResult } from '../popup/previewResult';
import type { SeoResult } from '../types/seo';
import { headingsAsTsv } from './ContentAnalysis';
import { Report } from './Report';
import { analyzePage } from '../analyzer/pageAnalyzer';
import { evaluateRules, seoRules } from '../rules/seoRules';
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

function issueFromRule(id: string) {
  const rule = seoRules.find((item) => item.id === id);
  if (!rule) throw new Error(`Missing rule ${id}`);
  const { check: _check, ...issue } = rule;
  return issue;
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
  it('selects the targeted issue category and expands the exact matching Issue card', async () => {
    const result = structuredClone(previewResult);
    const target = result.issues.find((issue) => issue.id === 'META_002');
    expect(target).toBeDefined();
    await act(async () => { root.render(<Report result={result} targetIssueId="META_002" targetNonce="handoff-1" onRescan={() => undefined} />); });
    expect(container.querySelector('.audit-category-card[aria-pressed="true"]')?.textContent).toContain('Content SEO');
    const card = container.querySelector<HTMLElement>('[data-issue-id="META_002"]');
    expect(card).not.toBeNull();
    expect(card?.classList.contains('is-open')).toBe(true);
    expect(card?.querySelector('.ai-fix-button')?.getAttribute('aria-expanded')).toBe('true');
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
  it('uses matching semantic severity classes in the summary and badges without changing counts or score', async () => {
    const result = structuredClone(previewResult);
    const issues = [issueFromRule('TITLE_001'), issueFromRule('META_002'), issueFromRule('HEADING_003')];
    const score = calculateScore(issues);
    Object.assign(result, { issues, ...score });
    await render(result);

    const summary = container.querySelector('.severity-summary')!;
    expect(Array.from(summary.children, (item) => ['critical', 'warning', 'info'].find((severity) => item.classList.contains(severity)))).toEqual(['critical', 'warning', 'info']);
    expect(Array.from(summary.querySelectorAll('b'), (item) => item.textContent)).toEqual(['1', '1', '1']);
    expect(Array.from(container.querySelectorAll('.severity'), (item) => item.classList[1])).toEqual(['critical', 'warning', 'info']);
    expect(container.querySelectorAll('.issue-card')).toHaveLength(3);
    expect(container.querySelector('.issue-count')?.textContent).toBe('3');
    expect(result.score).toBe(score.score);

    await click('Page Structure1');
    expect(container.querySelector('.severity-summary .info b')?.textContent).toBe('1');
    expect(container.querySelector('.severity')?.classList.contains('info')).toBe(true);
    expect(result.score).toBe(score.score);
  });
  it('keeps zeroed severity colors and the empty state when there are no issues', async () => {
    const result = structuredClone(previewResult);
    result.issues = [];
    await render(result);
    expect(Array.from(container.querySelectorAll('.severity-summary > span'), (item) => ['critical', 'warning', 'info'].find((severity) => item.classList.contains(severity)))).toEqual(['critical', 'warning', 'info']);
    expect(Array.from(container.querySelectorAll('.severity-summary b'), (item) => item.textContent)).toEqual(['0', '0', '0']);
    expect(container.querySelectorAll('.severity')).toHaveLength(0);
    expect(container.querySelectorAll('.issue-card')).toHaveLength(0);
    expect(container.textContent).toContain('No issues');
  });
  it('formats complete, repeated headings as one TSV row each', () => {
    const longText = 'A long heading that must remain complete across the copied output';
    expect(headingsAsTsv([
      { level: 2, text: 'Repeated' },
      { level: 2, text: 'Repeated' },
      { level: 4, text: `First\tpart\n${longText}` },
      { level: 6, text: 'Implementation note' },
    ])).toBe(`H2\tRepeated\nH2\tRepeated\nH4\tFirst part ${longText}\nH6\tImplementation note`);
  });

  it('counts actual issues across the four groups and filters without changing totals', async () => {
    const result = structuredClone(previewResult);
    const originalIssues = structuredClone(result.issues);
    await render(result);
    const cards = Array.from(container.querySelectorAll('.audit-category-card'));
    expect(cards.map((item) => item.textContent)).toEqual(['Content SEO1', 'Page Structure0', 'Technical SEO1', 'Images0']);
    expect(container.querySelectorAll('.issue-card')).toHaveLength(2);
    await click('Technical SEO1');
    expect(container.querySelectorAll('.issue-card')).toHaveLength(1);
    expect(container.querySelector('.issue-count')?.textContent).toBe('2');
    expect(Array.from(container.querySelectorAll('.severity-summary b')).map((item) => item.textContent)).toEqual(['0', '2', '0']);
    expect(result.issues).toEqual(originalIssues);
    expect(result.score).toBe(90);
    await click('Show all issues');
    expect(container.querySelectorAll('.issue-card')).toHaveLength(2);
  });

  it('keeps only Audit and restores the complete list from an empty category', async () => {
    await render(structuredClone(previewResult));
    expect(container.textContent).not.toContain('Content Analysis');
    expect(container.querySelector('.report-tabs')).toBeNull();
    await click('Images0');
    expect(container.textContent).toContain('No issues in this category');
    await click('Show all issues');
    expect(container.querySelectorAll('.issue-card')).toHaveLength(2);
  });
});
