import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('Single Page SEO Checker for Chrome', 'Check one open webpage, see a 0–100 SEO score, and find prioritized page-level issues without running a full-site crawl.', 'seo-checker');
export default function SeoChecker() {
  return <LandingPage path="seo-checker" eyebrow="Single page SEO checker" title="Check the SEO health of one page in seconds." intro="Open the page you want to review and use SEO Copilot for a quick score, prioritized issues, and practical next steps." bullets={['Scan only the active page you choose.','See the result in a simple 0–100 score.','Start with the highest-priority page-level finding.']} detail={{heading: 'A quick check for the page in front of you', body: 'Use this checker when you need a fast answer about one webpage—not a crawl of an entire site. Scan the active tab, review the score and issue list, then decide what deserves attention first.', next: 'Open the page you want to review, install SEO Copilot, and start with the score.'}} relatedLabel="Choose a deeper check" related={[["/seo-audit/", "Follow a page-level SEO audit workflow"], ["/on-page-seo-checker/", "Review every supported on-page signal"]]}>
    <section aria-labelledby="quick-read">
      <h2 id="quick-read">Get a quick read on one open page</h2>
      <h3>Score, top findings, and next action</h3>
      <p>Use the active tab when you need to decide whether a page deserves a closer look. Scan once, read the 0–100 score and the highest-priority reported issues, then pick one finding to investigate. For example, a missing title gives you a clearer next action than the score alone.</p>
      <p>This is a quick triage step for a page you are reviewing now. It does not compare every URL on a site or promise that a higher score will improve rankings.</p>
    </section>
    <section aria-labelledby="deeper-audit">
      <h2 id="deeper-audit">When to continue with a full audit</h2>
      <p>If you only needed a first impression, the score and issue list may be enough to decide what to inspect next. When several findings need verification, follow the <Link href="/seo-audit/">page-level SEO audit workflow</Link>: check each issue against the page, make a manual change, and re-scan. Both paths use the same SEO Copilot scan; the difference is how far you take the review.</p>
      <p>To see which metadata, headings, images, canonical, structured data, URL, and content signals the scan covers, read the <Link href="/on-page-seo-checker/">on-page SEO checker guide</Link>.</p>
    </section>
  </LandingPage>;
}
