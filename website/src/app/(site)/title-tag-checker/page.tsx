import type { Metadata } from 'next';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('Title Tag Checker', 'Check and improve your page title tag with SEO Copilot.', 'title-tag-checker');
export default function TitleTagChecker() { return <LandingPage path="title-tag-checker" eyebrow="Title tag checker" title="Make your page title clearer before you publish." intro="Find missing, short, or overly long title tags, then generate grounded alternatives when you want help writing them." bullets={['Keep the page topic and main entity clear.','Avoid keyword stuffing and vague promises.','Copy a candidate, update your page, and re-scan.']} />; }
