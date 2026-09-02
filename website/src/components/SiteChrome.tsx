'use client';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LOCALES, jsonLdUrl, type Locale } from '@/lib/site';
export function SiteChrome({ children }: { children: React.ReactNode }) { const pathname = usePathname(); const locale = (LOCALES.find(l => pathname.startsWith(`/${l}`)) ?? 'en') as Locale; const currentPath = pathname.replace(/^\/(zh-CN|zh-TW|ja|ko|de|fr|es|pt-BR)(?=\/|$)/, '').replace(/^\//, '').replace(/\/$/, ''); const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SEO Copilot', applicationCategory: 'BrowserApplication', operatingSystem: 'Chrome', url: jsonLdUrl(locale, currentPath), description: 'A page-level SEO audit assistant for Chrome with optional AI title and meta description suggestions.' }; return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Header locale={locale} currentPath={currentPath} />{children}<Footer locale={locale} /></>; }
