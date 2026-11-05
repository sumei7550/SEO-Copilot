// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { seoRules } from '../../src/rules/seoRules';
import { canUseAiFix } from '../../src/utils/aiFix';
import SeoChecker, { metadata } from './app/(site)/seo-checker/page';

const page = new DOMParser().parseFromString(renderToStaticMarkup(<SeoChecker />), 'text/html');
const main = page.querySelector('main')!;

describe('English SEO checker report guide', () => {
  it('preserves metadata and H1 while replacing the repeated landing summary', () => {
    expect(metadata.title).toBe('Single Page SEO Checker for Chrome');
    expect(metadata.description).toBe('Check one open webpage, see a 0–100 SEO score, and find prioritized page-level issues without running a full-site crawl.');
    expect(main.querySelectorAll('h1')).toHaveLength(1);
    expect(main.querySelector('h1')?.textContent).toBe('Check the SEO health of one page in seconds.');
    expect(main.querySelector('.landing-summary')).toBeNull();
    expect(main.querySelector('.landing-detail')).toBeNull();
  });

  it('uses the current rule severities for the illustrative findings', () => {
    const findings = [...main.querySelectorAll('.seo-checker-findings article')];
    const examples = [
      ['TITLE_001', 'Missing title', 'High'],
      ['IMAGE_001', 'Missing image alt', 'Warning'],
      ['URL_001', 'Long URL', 'Warning'],
    ] as const;
    expect(findings).toHaveLength(examples.length);
    for (const [index, [id, heading, severity]] of examples.entries()) {
      const rule = seoRules.find(item => item.id === id);
      expect(rule?.severity).toBe(severity === 'High' ? 'critical' : 'warning');
      expect(findings[index].querySelector('h3')?.textContent).toBe(heading);
      expect(findings[index].querySelector('.seo-checker-severity')?.textContent).toBe(severity);
    }
    expect(canUseAiFix(seoRules.find(item => item.id === 'TITLE_001')!)).toBe(true);
    expect(canUseAiFix(seoRules.find(item => item.id === 'IMAGE_001')!)).toBe(false);
    expect(canUseAiFix(seoRules.find(item => item.id === 'URL_001')!)).toBe(false);
  });

  it('gives a six-step decision path, valid related links, and one install CTA', () => {
    expect(main.querySelectorAll('.seo-checker-steps li')).toHaveLength(6);
    for (const href of ['/on-page-seo-checker/', '/seo-audit/', '/title-tag-checker/']) {
      expect([...main.querySelectorAll<HTMLAnchorElement>('a[href]')]
        .some(link => link.getAttribute('href')?.replace(/\/$/, '') === href.replace(/\/$/, ''))).toBe(true);
    }
    expect(main.querySelectorAll('a[href*="chromewebstore.google.com"]')).toHaveLength(1);
    expect(main.textContent).toContain('does not accept a URL for an online scan');
    expect(main.textContent).toContain('not a Google ranking prediction');
    expect(main.textContent).toContain('not an automatic priority assigned by the extension');
  });
});
