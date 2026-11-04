import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('SEO Title Checker for the Current Page', 'Check the title tag on the page you’re viewing. Find missing, short, long, or multiple titles, and request AI ideas for supported issues before updating it yourself.', 'title-tag-checker');
export default function TitleTagChecker() {
  return <LandingPage path="title-tag-checker" eyebrow="Title tag checker" title="Check the SEO title on the page you’re viewing." intro="Use SEO Copilot’s Chrome extension as a title tag checker for the page you’re viewing. Find missing, short, long, or multiple title tags, and review what to do next." bullets={['Open the page in Chrome and scan it with SEO Copilot.','Review any title tag issues. Request AI title ideas for supported issues when you want them.','Update the title in your CMS or code, then re-scan the page.']} detail={{heading: 'What the title check helps you decide', body: 'Use this focused check when a title is missing, too short, too long, or when the document has multiple title tags. For supported issues, AI Fix can suggest title candidates on request; it does not publish them for you.', next: 'Choose a candidate only after checking that it accurately describes the page.'}} relatedLabel="Continue checking the snippet" related={[["/meta-description-checker/", "Check the page meta description"], ["/on-page-seo-checker/", "Review all supported on-page signals"]]}>
    <section aria-labelledby="title-findings">
      <h2 id="title-findings">Understand the title findings</h2>
      <h3>Missing or multiple title elements</h3>
      <p>A missing title leaves the page without its intended document name. If the report finds more than one <code>&lt;title&gt;</code> element, inspect the page’s rendered head and the templates that write to it. For example, a site template and an individual page may both add a title; choose one source of truth before editing the wording.</p>
      <h3>Short or long titles</h3>
      <p>A short title such as “Services” may omit the page’s actual topic. A long title may repeat similar phrases until its purpose is hard to see. These are review examples, not universal character targets: length alone cannot tell you whether a title is accurate or useful.</p>
    </section>
    <section aria-labelledby="title-review">
      <h2 id="title-review">Review a title candidate by hand</h2>
      <h3>Match the page’s primary topic</h3>
      <p>Compare a candidate with the visible heading and the page’s main task. For a supported title issue, you may actively request AI ideas, then reject any candidate that exaggerates a feature, repeats keywords, or describes a different page.</p>
      <h3>Check the published title and re-scan</h3>
      <p>Update the title in your CMS or code, reload the page, and scan it again. If the snippet also needs a description, continue with the <Link href="/meta-description-checker/">meta description check</Link>; use the <Link href="/on-page-seo-checker/">on-page SEO check</Link> for the surrounding page signals.</p>
    </section>
  </LandingPage>;
}
