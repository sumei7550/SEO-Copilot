'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnalyticsConsentManager } from '@/components/AnalyticsConsentManager';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageJsonLd } from '@/components/PageJsonLd';
import { trackWebsitePageView } from '@/lib/analytics';
import type { AnalyticsConsent } from '@/lib/analytics-consent';
import { LOCALES, type Locale } from '@/lib/site';

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

  return <>
    <PageJsonLd locale={locale} path={currentPath} />
    <Header locale={locale} currentPath={currentPath} />
    {children}
    <Footer locale={locale} />
    <AnalyticsConsentManager locale={locale} onConsentChange={setConsent} />
  </>;
}
