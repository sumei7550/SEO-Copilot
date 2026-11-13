// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateSeoFix } from '../services/generateSeoFix';
import { seoRules } from '../rules/seoRules';
import type { AiFixResponse } from '../types/aiFix';
import type { PageData, PageMetrics, SeoIssue } from '../types/seo';
import { IssueList } from './IssueList';

vi.mock('../services/generateSeoFix', () => ({ generateSeoFix: vi.fn() }));
vi.mock('../analytics', () => ({ trackExtension: vi.fn() }));

const page: PageData = {
  url: 'https://example.com/page', title: '', titleTagCount: 1, metaDescription: '',
  headings: [{ level: 1, text: 'Example page' }], images: [], canonical: 'https://example.com/page',
  schemas: [], invalidSchemaCount: 0, wordCount: 400, textRatio: 0.3,
};
const metrics: PageMetrics = {
  h1Count: 1, h2Count: 0, h3Count: 0, imageCount: 0, auditableImageCount: 0,
  imagesWithoutAlt: 0, altCoverage: 100, schemaTypes: [], wordCount: 400, textRatio: 0.3,
};

function issue(id: string): SeoIssue {
  const rule = seoRules.find(item => item.id === id);
  if (!rule) throw new Error(`Missing rule ${id}`);
  const { check: _check, ...data } = rule;
  return data;
}

const titleResult: AiFixResponse = {
  type: 'title', recommendations: [{ id: 'title-1', content: 'A clear page title', rationale: 'It describes the page.', highlights: [] }],
};
const nextTitleResult: AiFixResponse = {
  type: 'title', recommendations: [{ id: 'title-1', content: 'Another clear title', rationale: 'It describes the page.', highlights: [] }],
};

let container: HTMLDivElement;
let root: Root;

async function renderIssues(issues: SeoIssue[]) {
  await act(async () => {
    root.render(<IssueList issues={issues} page={page} metrics={metrics} onRescan={() => undefined} />);
  });
}

async function openAi() {
  const button = Array.from(container.querySelectorAll('button')).find(item => item.textContent?.includes('Improve with AI'));
  expect(button).toBeDefined();
  await act(async () => { button!.click(); });
}

function card(id: string) {
  const heading = container.querySelector('.issue-card h3');
  expect(heading, `issue card for ${id}`).not.toBeNull();
  return heading!.closest('.issue-card')!;
}

beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
});

describe('IssueList free recommended actions', () => {
  it('shows the mapped action for a non-AI issue without an AI entry', async () => {
    await renderIssues([issue('TITLE_004')]);
    expect(card('TITLE_004').textContent).toContain('Keep a single title element directly in the document head.');
    expect(card('TITLE_004').textContent).toContain('Recommended Action');
    expect(card('TITLE_004').textContent).not.toContain('Improve with AI');
  });

  it('shows distinct title and meta actions before AI is opened', async () => {
    await renderIssues([issue('TITLE_001'), issue('META_001')]);
    const cards = container.querySelectorAll('.issue-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('Add a unique, descriptive title between 30 and 60 characters.');
    expect(cards[0].textContent).not.toContain('Add a useful meta description');
    expect(cards[1].textContent).toContain('Add a useful meta description between 120 and 160 characters.');
    expect(cards[1].textContent).not.toContain('Add a unique, descriptive title');
    expect(cards[0].textContent).toContain('Improve with AI');
    expect(cards[1].textContent).toContain('Improve with AI');
    expect(generateSeoFix).not.toHaveBeenCalled();
  });

  it('keeps the free action visible while AI is pending and after failure', async () => {
    let rejectRequest!: (reason: Error) => void;
    vi.mocked(generateSeoFix).mockReturnValueOnce(new Promise((_resolve, reject) => { rejectRequest = reject; }));
    await renderIssues([issue('TITLE_001')]);
    await openAi();
    expect(card('TITLE_001').textContent).toContain('Add a unique, descriptive title');
    expect(card('TITLE_001').textContent).toContain('Generating AI recommendations');
    await act(async () => { rejectRequest(new Error('AI unavailable')); });
    expect(card('TITLE_001').textContent).toContain('Add a unique, descriptive title');
    expect(card('TITLE_001').textContent).toContain('AI suggestions unavailable');
  });

  it('shows a free meta action even when its AI request fails', async () => {
    vi.mocked(generateSeoFix).mockRejectedValueOnce(new Error('AI unavailable'));
    await renderIssues([issue('META_001')]);
    await openAi();
    expect(card('META_001').textContent).toContain('Add a useful meta description');
    expect(card('META_001').textContent).toContain('AI suggestions unavailable');
  });

  it('keeps the free action when the provider returns no usable result and after closing AI', async () => {
    vi.mocked(generateSeoFix).mockRejectedValueOnce(new Error('empty response'));
    await renderIssues([issue('META_001')]);
    await openAi();
    expect(card('META_001').textContent).toContain('Add a useful meta description');
    expect(card('META_001').textContent).toContain('AI suggestions unavailable');
    await openAi();
    expect(card('META_001').textContent).toContain('Add a useful meta description');
    expect(card('META_001').textContent).not.toContain('AI suggestions unavailable');
  });

  it.each(['TITLE_001', 'TITLE_002', 'TITLE_003', 'META_001', 'META_002', 'META_003'])(
    'shows the rule-specific free action for supported issue %s', async id => {
      const current = issue(id);
      await renderIssues([current]);
      expect(card(id).textContent).toContain('Recommended Action');
      expect(card(id).querySelector('.recommended-action strong')?.textContent).toBeTruthy();
      expect(card(id).querySelector('.recommended-action strong')?.textContent).not.toBe(current.solutionKey);
    },
  );

  it('keeps the free action alongside AI results and after Generate another', async () => {
    vi.mocked(generateSeoFix).mockResolvedValueOnce(titleResult).mockResolvedValueOnce(nextTitleResult);
    await renderIssues([issue('TITLE_001')]);
    await openAi();
    expect(card('TITLE_001').textContent).toContain('Add a unique, descriptive title');
    expect(card('TITLE_001').textContent).toContain('A clear page title');
    expect(card('TITLE_001').textContent).toContain('Copy selected');
    const another = Array.from(container.querySelectorAll('button')).find(item => item.textContent?.includes('Generate another'));
    expect(another).toBeDefined();
    await act(async () => { another!.click(); });
    expect(card('TITLE_001').textContent).toContain('Add a unique, descriptive title');
    expect(card('TITLE_001').textContent).toContain('Another clear title');
    expect(generateSeoFix).toHaveBeenCalledTimes(2);
  });

  it('updates the action when re-scan returns a different issue', async () => {
    await renderIssues([issue('TITLE_001')]);
    await renderIssues([issue('META_001')]);
    expect(container.textContent).toContain('Add a useful meta description');
    expect(container.textContent).not.toContain('Add a unique, descriptive title');
  });

  it('does not show an action or leak another issue action when the mapping is missing', async () => {
    await renderIssues([issue('TITLE_004'), { ...issue('META_001'), solutionKey: 'missingSolutionKey' }]);
    const cards = container.querySelectorAll('.issue-card');
    expect(cards[0].textContent).toContain('Keep a single title element');
    expect(cards[1].textContent).not.toContain('Recommended Action');
    expect(cards[1].textContent).not.toContain('Keep a single title element');
    expect(cards[1].textContent).not.toContain('missingSolutionKey');
  });
});
