import type { Metadata } from 'next';
import Link from 'next/link';
import { StoreCta } from '@/components/StoreCta';
import { pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('Single Page SEO Checker for Chrome', 'Check one open webpage, see a 0–100 SEO score, and find prioritized page-level issues without running a full-site crawl.', 'seo-checker');
export default function SeoChecker() {
  return <main className="page tool-guide seo-checker-guide"><div className="wrap prose">
    <p className="eyebrow">Single page SEO checker</p>
    <h1>Check the SEO health of one page in seconds.</h1>
    <p className="hero-copy">A quick scan is useful when you need to decide what to inspect on the page in front of you. SEO Copilot checks the current page after you start a scan in Chrome; its report gives you a score and individual findings to review.</p>

    <section aria-labelledby="read-report">
      <h2 id="read-report">Read the report before choosing a fix</h2>
      <div className="seo-checker-report-parts">
        <article>
          <h3>Start with the 0–100 score</h3>
          <p>The score summarizes the extension’s supported page-level rules at the time of the scan. Use it as an overview, then read the findings behind it. It is not a Google ranking prediction or a measure of every SEO concern.</p>
        </article>
        <article>
          <h3>Read the count and severity</h3>
          <p>The report shows how many issues it found and groups their severity as High, Warning, or Info. Read the individual issue cards for the finding, impact explanation, and recommended action. A count alone cannot tell you whether a notice matters for this page.</p>
        </article>
        <article>
          <h3>Choose what to verify first</h3>
          <p>Weigh the severity alongside the page’s purpose and the cost or risk of changing it. Check the page itself before editing. The order in which cards appear does not set your work order, and some advisory notices need no change.</p>
        </article>
      </div>
    </section>

    <section aria-labelledby="report-example">
      <h2 id="report-example">Example: three findings on one product page</h2>
      <p>Imagine a backpack product page with no document title, a URL longer than 100 characters, and an informative size chart whose image has no <code>alt</code> attribute. These are illustrative findings from the current rules, not a screenshot or a calculated score. The full report could include other notices too.</p>
      <div className="seo-checker-findings">
        <article>
          <div className="seo-checker-finding-head"><h3>Missing title</h3><span className="seo-checker-severity high">High</span></div>
          <p><strong>Check:</strong> Inspect the rendered <code>&lt;head&gt;</code> for a <code>&lt;title&gt;</code> and confirm whether it is empty or absent. For a product page, this is a strong first candidate: a useful title identifies the page. Add it in the site template or CMS, then reload and inspect again.</p>
        </article>
        <article>
          <div className="seo-checker-finding-head"><h3>Missing image alt</h3><span className="seo-checker-severity warning">Warning</span></div>
          <p><strong>Check:</strong> Inspect the size chart and decide whether it conveys information. If it does, add concise alt text that communicates its purpose. An intentionally decorative image can use <code>alt=&quot;&quot;</code>; do not invent text for decoration.</p>
        </article>
        <article>
          <div className="seo-checker-finding-head"><h3>Long URL</h3><span className="seo-checker-severity warning">Warning</span></div>
          <p><strong>Check:</strong> Read the full URL and distinguish a long stable path from necessary filters or tracking parameters. A published URL may have links pointing to it. Consider a clearer path only when the change is worthwhile and redirects are planned.</p>
        </article>
      </div>
      <p>Here, confirm the missing title first because it is marked High and directly affects how this product page identifies itself. Check the informative chart next. Defer the URL change until you understand its existing links and redirect cost. This is a judgment for the example, not an automatic priority assigned by the extension.</p>
    </section>

    <section aria-labelledby="next-decision">
      <h2 id="next-decision">A short decision path after a scan</h2>
      <ol className="seo-checker-steps">
        <li><strong>View the score</strong> as a summary of the supported checks.</li>
        <li><strong>Read each finding</strong>, its severity, impact, and recommended action.</li>
        <li><strong>Decide whether it applies</strong> by checking the actual page and its purpose.</li>
        <li><strong>Choose one priority</strong> using severity, user impact, and change cost.</li>
        <li><strong>Make the change yourself</strong> in your CMS or source code.</li>
        <li><strong>Reload and re-scan</strong> the same page to see whether the finding remains.</li>
      </ol>
      <p>For the signals the scan can detect, see the <Link href="/on-page-seo-checker/">on-page SEO checker guide</Link>. For a longer verification and recheck process, use the <Link href="/seo-audit/">single-page SEO audit guide</Link>. If the title needs work, the <Link href="/title-tag-checker/">title tag checker guide</Link> covers that issue in detail.</p>
    </section>

    <section aria-labelledby="checker-scope">
      <h2 id="checker-scope">What this checker does and does not do</h2>
      <p>SEO Copilot is a Chrome extension for the single page currently open in your active tab. It does not accept a URL for an online scan, crawl a whole site, or edit your website automatically. For supported missing, short, or long title and meta description issues, you may request AI wording candidates, review them, and copy one into your editor. Other findings require your own diagnosis and changes.</p>
    </section>

    <section className="tool-guide-next" aria-labelledby="checker-next">
      <h2 id="checker-next">Check the page you have open</h2>
      <p>Install the extension in Chrome, open the page you want to review, and start a scan. Use the report to select a finding worth checking before you change the site.</p>
      <div className="actions"><StoreCta label="Add to Chrome" /></div>
    </section>
  </div></main>;
}
