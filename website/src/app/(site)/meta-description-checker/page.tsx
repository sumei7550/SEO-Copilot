import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('Meta Description Checker for the Current Page', 'Use SEO Copilot’s Chrome extension to check the meta description on the page you’re viewing. Find missing, short, or long descriptions and request AI suggestions when supported.', 'meta-description-checker');
export default function MetaDescriptionChecker() {
  return <LandingPage path="meta-description-checker" eyebrow="Meta description checker" title="Check the meta description on the page you’re viewing." intro="Open a page in Chrome and scan it with SEO Copilot. See whether its meta description is missing, too short, or too long, and review what to do next." bullets={['Open the page you want to check in Chrome, then start a scan with SEO Copilot.','Review the description issue and its guidance. Request AI wording suggestions for supported issues when you want them.','Update the description in your CMS or code, then re-scan the page.']} detail={{heading: 'What the description check helps you decide', body: 'Use this focused check when the meta description is missing or falls outside the supported length guidance. AI Fix can generate concise candidates from the page context when you request it.', next: 'Select a truthful candidate, update the description in your CMS or code, and re-scan.'}} relatedLabel="Continue checking the snippet" related={[["/title-tag-checker/", "Check the page title tag"], ["/on-page-seo-checker/", "Review all supported on-page signals"]]}>
    <section aria-labelledby="description-findings">
      <h2 id="description-findings">What the checker flags</h2>
      <h3>Missing description</h3>
      <p>If the page has no meta description, the report flags the missing element. Check the page’s main purpose before writing one: a useful description tells a reader what they will find, without promising content the page does not contain.</p>
      <h3>Short or long description</h3>
      <p>A length warning is a prompt to review the wording, not a guarantee about how a search result will appear. For example, “SEO tips” gives almost no context, while a long description that repeats the same benefit several times may hide the point. These are illustrative examples, not descriptions taken from a scanned site.</p>
    </section>
    <section aria-labelledby="description-review">
      <h2 id="description-review">Review a description before changing it</h2>
      <h3>Compare the wording with the visible page</h3>
      <p>Read the existing description beside the page heading and content. For a supported meta description issue, you may actively request AI wording candidates, but check each one for accuracy and clarity before choosing it.</p>
      <h3>Update and re-scan</h3>
      <p>Save the chosen text in your CMS or code, reload the page, and scan again to see whether the issue remains. If the page title also needs review, use the <Link href="/title-tag-checker/">title tag check</Link>; for a wider set of signals, use the <Link href="/on-page-seo-checker/">on-page SEO check</Link>.</p>
    </section>
  </LandingPage>;
}
