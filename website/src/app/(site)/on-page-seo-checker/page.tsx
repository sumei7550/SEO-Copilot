import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingPage } from '@/components/LandingPage';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('On-Page SEO Checker for Metadata, Headings and Images', 'Use SEO Copilot’s Chrome extension to check on-page SEO for the page you’re viewing. Review titles, meta descriptions, headings, images, canonical links, schema, and URLs.', 'on-page-seo-checker');
export default function OnPageSeoChecker() {
  return <LandingPage path="on-page-seo-checker" eyebrow="On-page SEO checker" title="Check on-page SEO for the page you’re viewing." intro="Scan the page you’re viewing in Chrome with SEO Copilot. Review metadata, headings, images, canonical links, structured data, URL signals, and visible content." bullets={['See detected issues and their severity, with guidance where available.','For supported title and meta description issues, request AI wording candidates when you want them.','Update your CMS or code yourself, then re-scan the page.']} detail={{heading: 'What the on-page check covers', body: 'Use this page when you want to understand the scope of the scan itself: title and meta description, headings, image SEO attributes, canonical links, structured data, URL structure, and visible-content signals.', next: 'Review the signal list, then open the focused title or meta-description check when either element needs attention.'}} relatedLabel="Inspect a specific element" related={[["/title-tag-checker/", "Check a page title tag"], ["/meta-description-checker/", "Check a meta description"], ["/seo-audit/", "Follow the full page-audit workflow"]]}>
    <section aria-labelledby="on-page-signals">
      <h2 id="on-page-signals">Signals checked on the open page</h2>
      <h3>Titles and meta descriptions</h3>
      <p>The scan checks whether these elements are present and flags supported length or structure issues. They describe the page to a potential visitor, so compare any finding with the actual page before changing the wording. For supported title or meta description issues, AI candidates are available only when you actively request them.</p>
      <h3>Headings and visible content</h3>
      <p>Heading checks can reveal a missing or repeated H1 and a hierarchy that skips levels. Visible-content signals help you notice a page with very little readable copy. Review the layout and the user’s task before deciding whether more text is useful.</p>
      <h3>Images and URL structure</h3>
      <p>Image checks cover missing alternative text and other supported image signals; URL checks point out length or structure concerns. A flagged item needs context: decorative images and a necessary URL path do not call for the same response as missing information.</p>
      <h3>Canonical links and structured data</h3>
      <p>The report can flag an absent canonical link or missing or invalid JSON-LD. Check these against the page’s intended URL and its actual content. A detected issue is a starting point for verification, not permission to add unsupported markup.</p>
    </section>
    <section aria-labelledby="on-page-next-check">
      <h2 id="on-page-next-check">Turn a signal into the next check</h2>
      <p>When the finding concerns one element, open the <Link href="/title-tag-checker/">focused title tag check</Link> or <Link href="/meta-description-checker/">focused meta description check</Link> for examples and a manual review. If several findings need work, use the <Link href="/seo-audit/">page audit workflow</Link> to prioritize, update, and re-scan them. SEO Copilot checks the active page; it does not crawl an entire site.</p>
    </section>
  </LandingPage>;
}
