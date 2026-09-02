import type { Metadata } from 'next';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('SEO Audit', 'Run a practical website SEO audit on the page you are viewing.', 'seo-audit');
export default function SeoAudit() { return <LandingPage path="seo-audit" eyebrow="SEO audit" title="A practical SEO audit for the page in front of you." intro="Review the key on-page signals without setting up a crawler or learning a complex dashboard." bullets={['Check titles, descriptions, headings, links, images, structured data, and URLs.','Prioritize issues with a clear score and explanations.','Make the change in your CMS, then re-scan to verify it.']} />; }
