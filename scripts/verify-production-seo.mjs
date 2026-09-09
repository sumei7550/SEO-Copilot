#!/usr/bin/env node

const DEFAULT_SITE = 'https://seo-copilot-website.vercel.app';
const site = (process.argv[2] || process.env.SEO_SITE_URL || DEFAULT_SITE).replace(/\/+$/, '');

const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'pt-BR'];
const pages = [
  {
    path: 'seo-checker',
    title: 'Single Page SEO Checker for Chrome',
    links: ['seo-audit', 'on-page-seo-checker'],
  },
  {
    path: 'seo-audit',
    title: 'Page-Level SEO Audit Without a Site Crawler',
    links: ['seo-checker', 'on-page-seo-checker'],
  },
  {
    path: 'title-tag-checker',
    title: 'Title Tag Checker for the Page You Are Viewing',
    links: ['meta-description-checker', 'on-page-seo-checker'],
  },
  {
    path: 'meta-description-checker',
    title: 'Meta Description Checker for the Current Page',
    links: ['title-tag-checker', 'on-page-seo-checker'],
  },
  {
    path: 'on-page-seo-checker',
    title: 'On-Page SEO Checker for Metadata, Headings and Images',
    links: ['title-tag-checker', 'meta-description-checker', 'seo-audit'],
  },
];

function expectedHreflangs(path) {
  return new Map([
    ['en', `${site}/${path}/`],
    ...locales.filter((locale) => locale !== 'en').map((locale) => [locale, `${site}/${locale}/${path}/`]),
    ['x-default', `${site}/${path}/`],
  ]);
}

const failures = [];
const checks = [];

function pass(label, detail = '') {
  checks.push({ ok: true, label, detail });
}

function fail(label, detail) {
  failures.push({ label, detail });
  checks.push({ ok: false, label, detail });
}

function tags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map((match) => match[0]);
}

function attrs(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1].toLowerCase(), match[2]]),
  );
}

function matchingTags(html, tagName, predicate) {
  return tags(html, tagName).map(attrs).filter(predicate);
}

function assert(condition, label, detail) {
  if (condition) pass(label);
  else fail(label, detail);
}

async function get(path) {
  const url = `${site}${path}`;
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const body = await response.text();
    assert(response.ok, `HTTP ${path}`, `${response.status} ${response.statusText}`);
    return { url, response, body };
  } catch (error) {
    fail(`HTTP ${path}`, error instanceof Error ? error.message : String(error));
    return { url, response: null, body: '' };
  }
}

async function main() {
  console.log(`Checking production SEO for ${site}`);

  const robots = await get('/robots.txt');
  const robotsText = robots.body.trim();
  assert(
    new RegExp(`Sitemap:\\s*${site.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}/sitemap\\.xml`, 'i').test(robotsText),
    'robots.txt sitemap',
    'Expected robots.txt to reference the production sitemap URL.',
  );
  assert(!/^Disallow:\s*\/$/im.test(robotsText), 'robots.txt allows crawling', 'The root path must not be blocked.');

  const sitemap = await get('/sitemap.xml');
  const sitemapUrls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
  assert(sitemapUrls.length > 0, 'sitemap has URLs', 'No <loc> elements found.');
  assert(sitemapUrls.every((url) => url.startsWith(`${site}/`)), 'sitemap uses production URLs', 'Found a URL outside the configured production origin.');
  for (const page of pages) {
    assert(sitemapUrls.includes(`${site}/${page.path}/`), `sitemap includes /${page.path}/`, 'The tool page is missing from sitemap.xml.');
  }

  for (const page of pages) {
    const result = await get(`/${page.path}/`);
    const html = result.body;
    const titleTags = tags(html, 'title');
    const titleText = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const h1Tags = tags(html, 'h1');
    const descriptions = matchingTags(html, 'meta', (attributes) => attributes.name?.toLowerCase() === 'description');
    const canonicals = matchingTags(html, 'link', (attributes) => attributes.rel?.toLowerCase() === 'canonical');
    const alternateLinks = matchingTags(html, 'link', (attributes) => attributes.rel?.toLowerCase() === 'alternate' && attributes.hreflang);
    const hrefs = matchingTags(html, 'a', (attributes) => attributes.href).map((attributes) => attributes.href);
    const hreflangs = expectedHreflangs(page.path);

    assert(titleTags.length === 1, `/${page.path}/ has one title`, `Found ${titleTags.length}.`);
    assert(titleText.includes(page.title), `/${page.path}/ title matches intent`, titleText || 'Missing title.');
    assert(h1Tags.length === 1, `/${page.path}/ has one H1`, `Found ${h1Tags.length}.`);
    assert(descriptions.length === 1 && descriptions[0].content?.trim(), `/${page.path}/ has one meta description`, `Found ${descriptions.length}.`);
    assert(canonicals.length === 1 && canonicals[0].href === `${site}/${page.path}/`, `/${page.path}/ canonical`, canonicals[0]?.href || 'Missing canonical.');
    assert(alternateLinks.length >= hreflangs.size, `/${page.path}/ hreflang set`, `Found ${alternateLinks.length}; expected at least ${hreflangs.size}.`);

    for (const [hreflang, expectedUrl] of hreflangs) {
      const actual = alternateLinks.find((attributes) => attributes.hreflang === hreflang)?.href;
      assert(actual === expectedUrl, `/${page.path}/ hreflang ${hreflang}`, actual || 'Missing hreflang.');
    }
    for (const target of page.links) {
      assert(hrefs.includes(`/${target}/`), `/${page.path}/ links to /${target}/`, 'Expected contextual internal link is missing.');
    }
  }

  for (const check of checks) {
    console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.label}${check.detail ? ` — ${check.detail}` : ''}`);
  }
  console.log(`\n${checks.length - failures.length} passed, ${failures.length} failed.`);
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
