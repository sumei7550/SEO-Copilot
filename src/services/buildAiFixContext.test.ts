import { describe, expect, it } from 'vitest';
import { buildAiFixContext } from './buildAiFixContext';
import type { PageData, SeoIssue } from '../types/seo';

const page: PageData = {
  url: 'https://www.acme.com/blog/seo-guide', title: 'Short SEO Guide | Acme', titleTagCount: 1,
  metaDescription: 'A practical guide to SEO.', headings: [{ level: 1, text: 'SEO Guide' }, { level: 1, text: 'Resources' }],
  images: [], canonical: '', schemas: [{ type: 'Article' }], invalidSchemaCount: 0, wordCount: 500, textRatio: 0.3, language: 'en'
};

const issue: SeoIssue = {
  id: 'TITLE_002', category: 'title', severity: 'warning', impact: -5,
  messageKey: 'issueTitleShort', impactKey: 'impactTitle', solutionKey: 'fixTitleLength'
};

describe('buildAiFixContext', () => {
  it('collects page fields, inferred metadata, and issue diagnostics', () => {
    const context = buildAiFixContext(page, issue, 'title', 'The title is too short.');

    expect(context.url).toBe(page.url);
    expect(context.title).toEqual({ current: page.title, length: page.title.length, issueType: 'TITLE_002' });
    expect(context.metaDescription).toEqual({ current: page.metaDescription, length: page.metaDescription.length });
    expect(context.h1).toEqual(['SEO Guide', 'Resources']);
    expect(context.language).toBe('en');
    expect(context.pageType).toBe('article');
    expect(context.brand).toEqual({ name: 'Acme', source: 'hostname' });
    expect(context.issue.diagnostic.solutionKey).toBe('fixTitleLength');
  });
});
