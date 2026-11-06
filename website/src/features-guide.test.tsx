// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Features, { metadata } from './app/(site)/features/page';

const page = new DOMParser().parseFromString(renderToStaticMarkup(<Features />), 'text/html');
const main = page.querySelector('main')!;

describe('English Features overview', () => {
  it('preserves metadata and H1 and gives each feature a check, result and value', () => {
    expect(metadata.title).toBe('Features');
    expect(metadata.description).toBe('Explore the practical SEO audit and AI-assisted improvement features in SEO Copilot.');
    expect(main.querySelector('h1')?.textContent).toBe('A clearer way to review a page.');
    const cards = [...main.querySelectorAll('.features-overview article')];
    expect(cards).toHaveLength(6);
    for (const card of cards) expect([...card.querySelectorAll('dt')].map(x => x.textContent)).toEqual(['Checks', 'Shows', 'Why it helps']);
  });

  it('covers the workflow, limits, tool entries and one store CTA', () => {
    expect(main.querySelectorAll('.features-workflow li')).toHaveLength(6);
    expect(main.textContent).toContain('No account is needed for the basic audit');
    expect(main.textContent).toContain('primarily in English');
    expect(main.textContent).toContain('batch URL scan');
    for (const path of ['/seo-checker/', '/on-page-seo-checker/', '/title-tag-checker/', '/meta-description-checker/', '/seo-audit/']) {
      expect([...main.querySelectorAll<HTMLAnchorElement>('a[href]')].some(a => a.getAttribute('href')?.replace(/\/$/, '') === path.replace(/\/$/, ''))).toBe(true);
    }
    expect(main.querySelectorAll('a[href*="chromewebstore.google.com"]')).toHaveLength(1);
    expect(main.querySelectorAll('.features-screenshots img')).toHaveLength(3);
    for (const name of ['features-scan-v1.3.2.png', 'features-issue-v1.3.2.png', 'features-ai-v1.3.2.png']) {
      expect([...main.querySelectorAll('.features-screenshots a')].some(a => a.getAttribute('href')?.endsWith(name))).toBe(true);
    }
    expect(main.textContent).toContain('AI request that was unavailable');
  });
});
