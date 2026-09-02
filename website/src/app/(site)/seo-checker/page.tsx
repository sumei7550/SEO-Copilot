import type { Metadata } from 'next';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('SEO Checker', 'Check the on-page SEO health of the website page you are viewing.', 'seo-checker');
export default function SeoChecker() { return <LandingPage path="seo-checker" eyebrow="SEO checker" title="Check your page’s SEO health in seconds." intro="SEO Copilot is a lightweight website SEO checker for operators, writers, and independent site owners." bullets={['Scan only the active page you choose.','See the result in a simple 0–100 score.','Get a prioritized list of issues and next steps.']} />; }
