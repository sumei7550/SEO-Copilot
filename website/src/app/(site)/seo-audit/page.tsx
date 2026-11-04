import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('Page-Level SEO Audit Without a Site Crawler', 'Audit the webpage you are viewing, prioritize its SEO issues, make a manual update, and re-scan to verify the result.', 'seo-audit');
export default function SeoAudit() {
  return <LandingPage path="seo-audit" eyebrow="Page-level SEO audit" title="Audit the page in front of you—without a site crawler." intro="Use a focused scan → prioritize → understand → update → re-scan workflow for the active browser page." bullets={['Review the supported page-level signals in one report.','Prioritize issues with a clear score and explanations.','Make the change in your CMS or code, then re-scan.']} detail={{heading: 'A repeatable page audit workflow', body: 'SEO Copilot keeps the audit close to the page: scan it, prioritize the findings, understand why they matter, make a manual update, and verify the result with another scan.', next: 'Use the issue explanations to choose one high-value change before moving to the next finding.'}} relatedLabel="Choose a related check" related={[["/seo-checker/", "Run a quick single-page SEO check"], ["/on-page-seo-checker/", "Review the supported on-page signals"]]}>
    <section aria-labelledby="audit-start">
      <h2 id="audit-start">Run a repeatable audit of one page</h2>
      <h3>Scan the active page</h3>
      <p>Open the exact page you want to improve and run SEO Copilot in Chrome. The report brings its supported page signals, score, and issue list together, so you can work from what is actually on that page rather than an assumption about the whole site.</p>
      <h3>Prioritize the reported issues</h3>
      <p>Read the issue severity, impact, and explanation before choosing a first task. For example, if a page has a missing title and a minor URL warning, investigate the missing title first. The score is a summary to orient your review, not proof of search performance.</p>
    </section>
    <section aria-labelledby="audit-verify">
      <h2 id="audit-verify">Make one manual change and verify it</h2>
      <h3>Check the explanation against the page</h3>
      <p>Confirm the reported element in the page and decide whether the suggested fix fits its purpose. For supported title or meta description issues, you can actively request AI wording candidates, then review them yourself before using any text.</p>
      <h3>Update in your CMS or code</h3>
      <p>Make the chosen change where the page is managed; the extension does not publish it. Keep track of the issue you meant to address so that the next scan has a clear comparison point.</p>
      <h3>Re-scan and compare</h3>
      <p>Reload the updated page and run another scan. Check whether the original issue remains and whether the page still says what you intend. Repeat with the next finding. For a quick first impression instead, start with the <Link href="/seo-checker/">single-page SEO check</Link>; to understand the report’s scope, see the <Link href="/on-page-seo-checker/">on-page signals it covers</Link>.</p>
    </section>
  </LandingPage>;
}
