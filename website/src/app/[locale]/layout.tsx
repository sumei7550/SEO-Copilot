import type { Metadata } from 'next';
import '../(site)/globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { LOCALES, OG_IMAGE_PATH, SITE_URL, type Locale } from '@/lib/site';

export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }
export const metadata: Metadata = { metadataBase: new URL(SITE_URL), icons: { icon: '/icon128.png' }, openGraph: { type: 'website', siteName: 'SEO Copilot', images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: 'SEO Copilot page-level SEO checker' }] }, twitter: { card: 'summary_large_image', images: [OG_IMAGE_PATH] } };

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const lang = (LOCALES.includes(locale as typeof LOCALES[number]) ? locale : 'en') as Locale;
  return <html lang={lang}><body><SiteChrome>{children}</SiteChrome></body></html>;
}
