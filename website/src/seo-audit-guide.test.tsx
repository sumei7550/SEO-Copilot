// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { seoRules } from '../../src/rules/seoRules';
import SeoAudit, { metadata } from './app/(site)/seo-audit/page';

const page = new DOMParser().parseFromString(renderToStaticMarkup(<SeoAudit />), 'text/html');
const main = page.querySelector('main')!;

describe('English SEO audit guide', () => {
  it('keeps existing metadata and H1', () => {
    expect(metadata.title).toBe('Page-Level SEO Audit Without a Site Crawler');
    expect(metadata.description).toBe('Audit the webpage you are viewing, prioritize its SEO issues, make a manual update, and re-scan to verify the result.');
    expect(main.querySelectorAll('h1')).toHaveLength(1);
    expect(main.querySelector('h1')?.textContent).toBe('Audit the page in front of you—without a site crawler.');
  });

  it('uses actual issue severities for its case and explains manual verification', () => {
    const cases = [...main.querySelectorAll('.seo-audit-case article')];
    for (const [index, id, severity] of [[0, 'TITLE_001', 'critical'], [1, 'HEADING_002', 'warning'], [2, 'TECH_003', 'warning']] as const) {
      expect(seoRules.find(rule => rule.id === id)?.severity).toBe(severity);
      expect(cases[index].textContent).toContain('Verify:');
    }
    expect(main.textContent).toContain('does not automatically compare scan history');
    expect(main.textContent).toContain('not promised to be automatically sorted by severity');
  });

  it('includes seven audit stages, related guides and one installation CTA', () => {
    expect(main.querySelectorAll('.seo-audit-steps > li')).toHaveLength(7);
    for (const path of ['/seo-checker/', '/on-page-seo-checker/', '/title-tag-checker/', '/meta-description-checker/']) {
      expect([...main.querySelectorAll<HTMLAnchorElement>('a[href]')].some(link => link.getAttribute('href')?.replace(/\/$/, '') === path.replace(/\/$/, ''))).toBe(true);
    }
    expect(main.querySelectorAll('a[href*="chromewebstore.google.com"]')).toHaveLength(1);
  });
});
