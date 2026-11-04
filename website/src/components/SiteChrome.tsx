'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnalyticsConsentManager } from '@/components/AnalyticsConsentManager';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { trackWebsitePageView } from '@/lib/analytics';
import type { AnalyticsConsent } from '@/lib/analytics-consent';
import { LOCALES, jsonLdUrl, type Locale } from '@/lib/site';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = (LOCALES.find(l => pathname.startsWith(`/${l}`)) ?? 'en') as Locale;
  const currentPath = pathname.replace(/^\/(zh-CN|zh-TW|ja|ko|de|fr|es|pt-BR)(?=\/|$)/, '').replace(/^\//, '').replace(/\/$/, '');
  const [consent, setConsent] = useState<AnalyticsConsent>('unset');
  const lastTrackedPath = useRef('');

  useEffect(() => {
    if (consent !== 'accepted') { lastTrackedPath.current = ''; return; }
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    trackWebsitePageView(pathname, locale);
  }, [pathname, locale, consent]);

  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SEO Copilot', applicationCategory: 'BrowserApplication', operatingSystem: 'Chrome', url: jsonLdUrl(locale, currentPath), description: 'A page-level SEO audit assistant for Chrome with optional AI title and meta description suggestions.' };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <Header locale={locale} currentPath={currentPath} />
    {children}
    <Footer locale={locale} />
    <AnalyticsConsentManager locale={locale} onConsentChange={setConsent} />
  </>;
}
