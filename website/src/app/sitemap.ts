import type { MetadataRoute } from 'next';
import { LOCALES, PATHS, SITE_URL, localizedPath, type Locale } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return (['en', ...LOCALES] as Locale[]).flatMap((locale) => PATHS.map((path) => ({
    url: `${SITE_URL}${localizedPath(locale, path)}`,
    lastModified: new Date('2026-09-02'),
  })));
}
