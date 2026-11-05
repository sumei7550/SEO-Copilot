// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import OnPageSeoChecker, { metadata } from './app/(site)/on-page-seo-checker/page';

const page = new DOMParser().parseFromString(renderToStaticMarkup(<OnPageSeoChecker />), 'text/html');
const examples = [...page.querySelectorAll('.tool-guide-code code')]
  .map(code => new DOMParser().parseFromString(code.textContent ?? '', 'text/html'));

describe('English on-page SEO guide', () => {
  it('keeps existing metadata and one H1', () => {
    expect(metadata.title).toBe('On-Page SEO Checker for Metadata, Headings and Images');
    expect(metadata.description).toBe('Use SEO Copilot’s Chrome extension to check on-page SEO for the page you’re viewing. Review titles, meta descriptions, headings, images, canonical links, schema, and URLs.');
    expect(page.querySelectorAll('main h1')).toHaveLength(1);
    expect(page.querySelector('main h1')?.textContent).toBe('Check on-page SEO for the page you’re viewing.');
  });

  it('covers each supported signal with a finding, verification, action, and judgment', () => {
    const cards = [...page.querySelectorAll('.on-page-checklist article')];
    expect(cards.map(card => card.querySelector('h3')?.textContent)).toEqual([
      'Title', 'Meta description', 'H1, H2, and H3', 'Images and alt text',
      'URL signals', 'Canonical link', 'JSON-LD', 'Visible content',
    ]);
    for (const card of cards) {
      expect([...card.querySelectorAll('dt')].map(label => label.textContent)).toEqual([
        'Checks', 'Possible finding', 'Verify yourself', 'Common action', 'Use judgment',
      ]);
      expect([...card.querySelectorAll('dd')].every(detail => Boolean(detail.textContent?.trim()))).toBe(true);
    }
  });

  it('shows a parseable before/after page excerpt and one install CTA', () => {
    const [before, after] = examples;
    expect(examples).toHaveLength(2);
    expect(before.querySelector('head > title')?.textContent).toBe('Shop');
    expect(after.querySelector('head > title')?.textContent).toContain('City Commuter Backpacks');
    expect(before.querySelectorAll('main h1')).toHaveLength(2);
    expect(after.querySelectorAll('main h1')).toHaveLength(1);
    expect(after.querySelectorAll('main h2')).toHaveLength(1);
    expect(before.querySelector('main img')?.hasAttribute('alt')).toBe(false);
    expect(after.querySelector('main img')?.getAttribute('alt')).toContain('Backpack sizes');
    expect(before.querySelector('head > link[rel="canonical"]')).toBeNull();
    expect(after.querySelector('head > link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.com/commuter-backpacks/');
    expect(before.querySelector('head > meta[name="description"]')?.getAttribute('content')).toBe(after.querySelector('head > meta[name="description"]')?.getAttribute('content'));
    expect(page.querySelectorAll('main a[href*="chromewebstore.google.com"]')).toHaveLength(1);
    for (const href of ['/title-tag-checker/', '/meta-description-checker/', '/seo-audit/']) {
      expect([...page.querySelectorAll<HTMLAnchorElement>('main a[href]')]
        .some(link => link.getAttribute('href')?.replace(/\/$/, '') === href.replace(/\/$/, ''))).toBe(true);
    }
  });
});
