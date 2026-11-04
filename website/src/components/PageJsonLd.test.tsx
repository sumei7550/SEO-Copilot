import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LOCALES, PATHS, SITE_URL, absoluteUrl, type Locale } from '@/lib/site';
import { PageJsonLd } from './PageJsonLd';

function schema(locale: Locale, path: string) {
  const html = renderToStaticMarkup(<PageJsonLd locale={locale} path={path} />);
  const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/);
  expect(match).not.toBeNull();
  return JSON.parse(match![1]) as { '@graph': Array<Record<string, unknown>> };
}

describe('page JSON-LD', () => {
  it('uses one distinct page entity with the canonical URL and language on every route', () => {
    for (const locale of ['en', ...LOCALES] as Locale[]) {
      for (const path of PATHS) {
        const graph = schema(locale, path)['@graph'];
        const pageUrl = absoluteUrl(locale, path);
        const page = graph.find(node => node['@type'] === 'WebPage');
        expect(page).toMatchObject({
          '@id': `${pageUrl}#webpage`, url: pageUrl, inLanguage: locale,
          isPartOf: { '@id': `${SITE_URL}/#website` },
        });
        expect(new Set(graph.map(node => node['@id'])).size).toBe(graph.length);
        expect(graph.filter(node => node['@type'] === 'SoftwareApplication')).toHaveLength(path ? 0 : 1);
        expect(graph.filter(node => node['@type'] === 'WebSite')).toHaveLength(path ? 0 : 1);
      }
    }
  });

  it('links the homepage to one truthful software entity without ratings or offers', () => {
    const graph = schema('en', '')['@graph'];
    const page = graph.find(node => node['@type'] === 'WebPage');
    const software = graph.find(node => node['@type'] === 'SoftwareApplication');
    expect(page?.mainEntity).toEqual({ '@id': `${SITE_URL}/#software` });
    expect(software).toMatchObject({ name: 'SEO Copilot', operatingSystem: 'Chrome', url: `${SITE_URL}/` });
    for (const field of ['aggregateRating', 'review', 'offers']) expect(software).not.toHaveProperty(field);
    expect(schema('fr', 'features')['@graph'][0].about).toEqual({ '@id': `${SITE_URL}/#software` });
  });
});
