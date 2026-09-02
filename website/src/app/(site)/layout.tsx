import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'SEO Copilot — Practical SEO audits in your browser', template: '%s | SEO Copilot' },
  description: 'Scan the page you are viewing, understand what matters, and improve on-page SEO with clear recommendations.',
  icons: { icon: '/icon128.png' },
};

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteChrome>{children}</SiteChrome></body></html>;
}
