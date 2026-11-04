import { absoluteUrl, SITE_URL, type Locale } from '@/lib/site';

export function PageJsonLd({ locale = 'en', path = '' }: { locale?: Locale; path?: string }) {
  const pageUrl = absoluteUrl(locale, path);
  const websiteId = `${SITE_URL}/#website`;
  const softwareId = `${SITE_URL}/#software`;
  const page = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { '@id': websiteId },
    ...(!path ? { mainEntity: { '@id': softwareId } } : {}),
    ...(path === 'features' ? { about: { '@id': softwareId } } : {}),
  };
  const data = {
    '@context': 'https://schema.org',
    '@graph': path ? [page] : [
      { '@type': 'WebSite', '@id': websiteId, name: 'SEO Copilot', url: `${SITE_URL}/` },
      page,
      {
        '@type': 'SoftwareApplication', '@id': softwareId,
        name: 'SEO Copilot', applicationCategory: 'BrowserApplication',
        operatingSystem: 'Chrome', url: `${SITE_URL}/`,
        description: 'A page-level SEO audit assistant for Chrome with optional AI title and meta description suggestions.',
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
