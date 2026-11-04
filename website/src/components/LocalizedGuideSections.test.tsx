import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LocalizedGuideSections } from './LocalizedGuideSections';
import { GUIDE_PATHS, localizedGuides } from '@/lib/localized-guides';
import { LOCALES, PATHS, seoToolLinks, seoToolsLabel } from '@/lib/site';

const expectedHeadings = {
  features: [3, 6, 7],
  'seo-checker': [2, 1, 4],
  'title-tag-checker': [2, 4, 4],
  'meta-description-checker': [2, 4, 4],
  'on-page-seo-checker': [2, 4, 5],
} as const;

describe('localized SEO guide parity', () => {
  it.each(LOCALES)('%s has localized navigation and complete guide sections', locale => {
    expect(seoToolsLabel[locale]).not.toBe(seoToolsLabel.en);
    for (const { path, label } of seoToolLinks(locale)) {
      expect(label).not.toBe(seoToolLinks('en').find(item => item.path === path)?.label);
    }
    for (const path of GUIDE_PATHS) {
      const sections = localizedGuides[locale][path];
      expect(sections.every(section => section.heading.trim() && section.points.every(([, paragraphs]) => paragraphs.every(Boolean)))).toBe(true);
      const html = renderToStaticMarkup(<LocalizedGuideSections locale={locale} path={path} />);
      const counts = ['h2', 'h3', 'p'].map(tag => (html.match(new RegExp(`<${tag}[ >]`, 'g')) ?? []).length);
      expect(counts).toEqual(expectedHeadings[path]);
      for (const href of html.matchAll(/href="([^"]+)"/g)) {
        expect(href[1]).toMatch(new RegExp(`^/${locale}/`));
        expect(PATHS).toContain(href[1].split('/')[2]);
      }
    }
  });
});
