import { jsonLdUrl, type Locale } from '@/lib/site';

export function PageJsonLd({ locale = 'en', path = '' }: { locale?: Locale; path?: string }) {
  const data = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SEO Copilot', applicationCategory: 'BrowserApplication', operatingSystem: 'Chrome', url: jsonLdUrl(locale, path), description: 'A page-level SEO audit assistant for Chrome with optional AI title and meta description suggestions.' };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
