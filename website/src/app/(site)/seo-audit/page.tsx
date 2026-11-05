import type { Metadata } from 'next';
import Link from 'next/link';
import { StoreCta } from '@/components/StoreCta';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata('Page-Level SEO Audit Without a Site Crawler', 'Audit the webpage you are viewing, prioritize its SEO issues, make a manual update, and re-scan to verify the result.', 'seo-audit');

const steps = [
  { title: 'Prepare for a page audit', body: 'Choose the exact page and note its purpose: what should a visitor learn or do? Open that page in Chrome. SEO Copilot checks the current tab after you start a scan; it does not accept a URL for an online audit or crawl a whole site.' },
  { title: 'Run the scan', body: 'Open the installed SEO Copilot extension and start a scan of the active page. The report shows a 0–100 SEO Score and detected issues. The score summarizes supported rules for this scan, not Google rankings or the quality of every part of the site.' },
  { title: 'Review detected issues', body: 'Read the issue count, High, Warning, and Info severity labels, then each finding’s impact and recommended action. Use severity alongside the page’s purpose to decide what to investigate. The issue list is not promised to be automatically sorted by severity; a notice may be inapplicable or need no change.' },
  { title: 'Validate before fixing', body: 'Inspect the rendered HTML in DevTools and read the visible page. Confirm that the flagged element exists, understand why it is there, and decide whether the recommendation fits. For example, an absent JSON-LD notice alone is not a reason to add structured data.' },
  { title: 'Make manual updates', body: 'Change the relevant CMS field, template, or HTML yourself and publish it. SEO Copilot does not edit your site. Optional AI wording candidates are available only for supported missing, short, or long title and meta description issues; review and copy a candidate into your own editor if useful.' },
  { title: 'Re-scan and verify', body: 'Reload the published page in Chrome, inspect the changed element, and start another scan. Check whether the original finding remains. If it does, investigate the published template or cache. Compare the two reports yourself; the extension does not automatically compare scan history.' },
  { title: 'Keep an audit record', body: 'Record the page URL, finding, evidence, chosen action or reason for no change, where you edited, and what the next scan showed. Keep this in your own document or task tracker so another person can review the decision.' },
] as const;

export default function SeoAudit() {
  return <main className="page tool-guide seo-audit-guide"><div className="wrap prose">
    <p className="eyebrow">Page-level SEO audit</p>
    <h1>Audit the page in front of you—without a site crawler.</h1>
    <p className="hero-copy">A useful audit ends with a checked decision, not just a list of warnings. Follow this process for one page you can open in Chrome, from its purpose and scan findings through a manual update and a fresh check.</p>

    <section aria-labelledby="audit-workflow">
      <h2 id="audit-workflow">A complete audit of one open page</h2>
      <ol className="seo-audit-steps">{steps.map((step, index) => <li key={step.title}><span className="seo-audit-step-number" aria-hidden="true">{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
    </section>

    <section aria-labelledby="audit-case">
      <h2 id="audit-case">Example: audit a product introduction page</h2>
      <p>Imagine a page introducing the Alder Desk Lamp. Its purpose is to explain the lamp and help visitors decide whether to view the product details. A scan reports the three findings below. This is an illustrative excerpt, not an actual scan or a calculated score; other findings could also appear.</p>
      <div className="seo-audit-case">
        <article><h3>Missing title <span>High</span></h3><p><strong>Verify:</strong> In DevTools, inspect the rendered <code>&lt;head&gt;</code> and confirm the <code>&lt;title&gt;</code> is absent or empty. <strong>Decision:</strong> Handle this first because the page lacks a document title. Add a page-specific title in the CMS SEO field or template.</p></article>
        <article><h3>Multiple H1 <span>Warning</span></h3><p><strong>Verify:</strong> Count the rendered H1 elements and read their labels. If “Alder Desk Lamp” is the main heading and “Choose a finish” starts a section, change the latter to an H2 in the page editor. Review the actual hierarchy before changing a design template.</p></article>
        <article><h3>Invalid JSON-LD <span>Warning</span></h3><p><strong>Verify:</strong> Find the page’s <code>application/ld+json</code> script and confirm its text fails JSON parsing. If this data is intentionally published, correct its syntax in the CMS or template, then use a dedicated validator for structured-data type and eligibility. The extension’s parsing notice is not complete schema validation.</p></article>
      </div>
      <p>Publish the selected edits, reload the same page, inspect its title, heading levels, and JSON-LD again, then run another scan. Note which original findings remain and what you observed. Do not infer a numerical score change from this example.</p>
    </section>

    <section aria-labelledby="audit-related">
      <h2 id="audit-related">Use a focused guide when a finding needs more detail</h2>
      <p>For a quick interpretation of the report, see the <Link href="/seo-checker/">SEO Checker guide</Link>. The <Link href="/on-page-seo-checker/">On-page SEO Checker guide</Link> explains the supported signals. For a specific wording or markup issue, use the <Link href="/title-tag-checker/">Title Tag Checker</Link> or <Link href="/meta-description-checker/">Meta Description Checker</Link> guide.</p>
    </section>

    <section className="tool-guide-next" aria-labelledby="audit-next"><h2 id="audit-next">Audit your current page in Chrome</h2><p>Install SEO Copilot, open the page you want to review, and start a scan. Keep your own audit record as you verify findings and make changes.</p><div className="actions"><StoreCta label="Add to Chrome" /></div></section>
  </div></main>;
}
