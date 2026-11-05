// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MetaDescriptionChecker, { metadata as metaMetadata } from './app/(site)/meta-description-checker/page';
import TitleTagChecker, { metadata as titleMetadata } from './app/(site)/title-tag-checker/page';

function pageDocument(rendered: string) {
  return new DOMParser().parseFromString(rendered, 'text/html');
}

function codeDocuments(rendered: Document) {
  return [...rendered.querySelectorAll('.tool-guide-code code')]
    .map(code => code.textContent ?? '')
    .filter(example => example.startsWith('<!doctype html>'))
    .map(example => pageDocument(example));
}

function hasPageLink(page: Document, path: string) {
  return [...page.querySelectorAll<HTMLAnchorElement>('a[href]')]
    .some(link => link.getAttribute('href')?.replace(/\/$/, '') === path);
}

describe('English focused tool guides', () => {
  it('keeps meta metadata and provides valid before/after HTML with useful links', () => {
    const page = pageDocument(renderToStaticMarkup(<MetaDescriptionChecker />));
    const [before, after] = codeDocuments(page);

    expect(metaMetadata.title).toBe('Meta Description Checker for the Current Page');
    expect(metaMetadata.description).toBe('Use SEO Copilot’s Chrome extension to check the meta description on the page you’re viewing. Find missing, short, or long descriptions and request AI suggestions when supported.');
    expect(page.querySelector('h1')?.textContent).toBe('Check the meta description on the page you’re viewing.');
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(before.doctype?.name).toBe('html');
    expect(after.doctype?.name).toBe('html');
    expect(before.querySelectorAll('head > title')).toHaveLength(1);
    expect(after.querySelectorAll('head > title')).toHaveLength(1);
    expect(before.querySelector('head > meta[name="description"]')?.getAttribute('content')).toBe('Running shoes');
    expect(after.querySelector('head > meta[name="description"]')?.getAttribute('content')).toContain('grip, fit, and cushioning');
    expect(hasPageLink(page, '/title-tag-checker')).toBe(true);
    expect(hasPageLink(page, '/on-page-seo-checker')).toBe(true);
  });

  it('keeps title metadata, explains the duplicate example, and provides valid replacement HTML', () => {
    const page = pageDocument(renderToStaticMarkup(<TitleTagChecker />));
    const [before, after] = codeDocuments(page);

    expect(titleMetadata.title).toBe('SEO Title Checker for the Current Page');
    expect(titleMetadata.description).toBe('Check the title tag on the page you’re viewing. Find missing, short, long, or multiple titles, and request AI ideas for supported issues before updating it yourself.');
    expect(page.querySelector('h1')?.textContent).toBe('Check the SEO title on the page you’re viewing.');
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(before.doctype?.name).toBe('html');
    expect(after.doctype?.name).toBe('html');
    expect(before.querySelectorAll('head > title')).toHaveLength(1);
    expect(after.querySelectorAll('head > title')).toHaveLength(1);
    expect(before.querySelector('head > title')?.textContent).toBe('Services');
    expect(after.querySelector('head > title')?.textContent).toContain('Residential Roof Repair in Portland');
    expect(page.body.textContent).toContain('AI Fix can suggest wording');
    expect(page.body.textContent).toContain('does not resolve the multiple-title structure problem');
    expect(hasPageLink(page, '/meta-description-checker')).toBe(true);
    expect(hasPageLink(page, '/on-page-seo-checker')).toBe(true);
  });
});
