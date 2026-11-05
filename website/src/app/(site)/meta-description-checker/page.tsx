import type { Metadata } from 'next';
import Link from 'next/link';
import { StoreCta } from '@/components/StoreCta';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata('Meta Description Checker for the Current Page', 'Use SEO Copilot’s Chrome extension to check the meta description on the page you’re viewing. Find missing, short, or long descriptions and request AI suggestions when supported.', 'meta-description-checker');

const beforeHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Beginner Trail Running Shoes | North Ridge</title>
    <meta name="description" content="Running shoes">
  </head>
  <body>
    <h1>Beginner trail running shoes</h1>
    <p>Compare grip, fit, and cushioning for your first trail runs.</p>
  </body>
</html>`;

const afterHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Beginner Trail Running Shoes | North Ridge</title>
    <meta name="description" content="Compare beginner trail running shoes by grip, fit, and cushioning. Find a comfortable pair for your first off-road runs.">
  </head>
  <body>
    <h1>Beginner trail running shoes</h1>
    <p>Compare grip, fit, and cushioning for your first trail runs.</p>
  </body>
</html>`;

export default function MetaDescriptionChecker() {
  return <main className="page tool-guide"><div className="wrap prose">
    <p className="eyebrow">Meta description checker</p>
    <h1>Check the meta description on the page you’re viewing.</h1>
    <p className="hero-copy">Find the description in a page’s HTML, decide whether it tells readers what the page offers, and check your change in Chrome. SEO Copilot checks the page you have open after you install the extension; there is no online URL input on this page.</p>

    <section aria-labelledby="description-purpose">
      <h2 id="description-purpose">What does a meta description do?</h2>
      <p>A meta description is a short summary in the document’s <code>&lt;head&gt;</code>. It is not normally visible in the page body. It can help people understand the page when it appears beneath a result’s title, but it should describe the actual content rather than promise something the page does not provide.</p>
      <p>Google may build the search snippet from page content instead, and may show different snippets for different searches. Changing this tag does not guarantee the wording that appears in search results.</p>
    </section>

    <section aria-labelledby="find-description">
      <h2 id="find-description">Find the description on the current page</h2>
      <ol>
        <li>Open the exact page in Chrome. For server-rendered pages, use <strong>View page source</strong> and search for <code>name="description"</code>.</li>
        <li>If a CMS or script changes the page after loading, open <strong>DevTools → Elements</strong>, expand <code>&lt;head&gt;</code>, and inspect the rendered <code>&lt;meta name="description"&gt;</code> element.</li>
        <li>Read its <code>content</code> value beside the page’s visible heading and main content. If the element is absent, the page has no description for the checker to read.</li>
      </ol>
      <p>SEO Copilot reads the description on the current tab when you start a scan. Use its finding as a prompt to inspect the HTML, then decide what to change.</p>
    </section>

    <section aria-labelledby="description-problems">
      <h2 id="description-problems">Four problems to look for</h2>
      <div className="tool-guide-examples">
        <article><h3>Missing</h3><p>The trail shoe page has a <code>&lt;title&gt;</code> but no <code>&lt;meta name="description"&gt;</code> in its head. Add a summary based on that page’s specific purpose.</p></article>
        <article><h3>Vague</h3><p><code>content="Running shoes"</code> names a topic but gives someone little reason to choose this beginner trail shoe guide over another result.</p></article>
        <article><h3>Short</h3><p><code>content="Great shoes"</code> leaves out the audience and what the page helps them compare. The extension flags descriptions under 70 characters for review.</p></article>
        <article><h3>Long</h3><p>“Shop beginner trail running shoes for beginners. Browse beginner trail running shoes for your first trail runs, then explore our beginner trail running shoes and find the best beginner trail running shoes.” repeats the topic instead of adding detail. The extension flags descriptions over 160 characters for review.</p></article>
      </div>
      <p>Those length checks are product review prompts, not fixed Google character limits. Judge clarity and accuracy first; Google truncates snippets according to the result layout and may choose other page text.</p>
    </section>

    <section aria-labelledby="edit-description">
      <h2 id="edit-description">Replace a vague description in HTML or a CMS</h2>
      <p>In this illustrative trail shoe page, the original tag gives no information beyond the product category. Both examples are complete HTML documents for teaching purposes; SEO Copilot does not edit or publish this code.</p>
      <h3>Before: a vague summary</h3>
      <pre className="tool-guide-code"><code>{beforeHtml}</code></pre>
      <h3>After: a page-specific summary</h3>
      <pre className="tool-guide-code"><code>{afterHtml}</code></pre>
      <p>In hand-written HTML, change the single description tag inside <code>&lt;head&gt;</code> and publish the updated page. In a CMS, open that page’s SEO or search appearance settings, edit its meta description field, then save or publish. The field name varies by CMS; confirm that the final HTML contains the new value rather than assuming the editor preview is live.</p>
    </section>

    <section aria-labelledby="verify-description">
      <h2 id="verify-description">Verify the published change</h2>
      <ol>
        <li>Open the published URL again and reload it. If you see an older version, use a hard refresh or check whether a cache still serves the previous page.</li>
        <li>Inspect the rendered <code>&lt;head&gt;</code> in DevTools and confirm that the <code>content</code> value matches your edit.</li>
        <li>Run SEO Copilot again on that tab. Check whether the original missing or length warning remains, and read the final wording against the visible page.</li>
      </ol>
      <p>For a supported missing, short, or long description issue, you may request AI wording candidates in the extension. Review each candidate for accuracy, copy the one you choose, and make the change yourself in your CMS or code. AI Fix does not publish it.</p>
    </section>

    <section className="tool-guide-next" aria-labelledby="description-next">
      <h2 id="description-next">Check the page you are editing</h2>
      <p>Install SEO Copilot in Chrome, open your page, and start a scan to check its current meta description. If the result also points to the document title, use the <Link href="/title-tag-checker/">title tag checker guide</Link>. For headings, images, canonical links, and other supported signals, see the <Link href="/on-page-seo-checker/">on-page SEO checker</Link>.</p>
      <div className="actions"><StoreCta label="Add to Chrome" /></div>
    </section>
  </div></main>;
}
