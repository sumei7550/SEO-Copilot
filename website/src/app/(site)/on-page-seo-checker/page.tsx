import type { Metadata } from 'next';
import Link from 'next/link';
import { StoreCta } from '@/components/StoreCta';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata('On-Page SEO Checker for Metadata, Headings and Images', 'Use SEO Copilot’s Chrome extension to check on-page SEO for the page you’re viewing. Review titles, meta descriptions, headings, images, canonical links, schema, and URLs.', 'on-page-seo-checker');

const checks = [
  {
    name: 'Title',
    checks: 'The document title in the rendered head and the number of title elements.',
    flags: 'A missing title, a short or long title, or more than one title element.',
    verify: 'Open DevTools → Elements and inspect <head> for <title>; compare its text with the page’s purpose and visible H1.',
    act: 'Edit the page’s SEO title in your CMS or template. If there are two title elements, remove the duplicate source.',
    judgment: 'A length warning alone is not a reason to replace an accurate, useful title.',
  },
  {
    name: 'Meta description',
    checks: 'The description tag on the open page.',
    flags: 'A missing description or one outside the extension’s length guidance.',
    verify: 'Inspect <meta name="description"> in the rendered head and read its content beside the visible page copy.',
    act: 'Write a truthful page-specific summary in the CMS SEO field or HTML head, then check the published value.',
    judgment: 'Do not pad a clear description just to meet a length target. Google may show a different snippet.',
  },
  {
    name: 'H1, H2, and H3',
    checks: 'H1, H2, and H3 elements in the page DOM and their order.',
    flags: 'No H1, more than one H1, or a level jump such as H1 directly to H3.',
    verify: 'Inspect the rendered headings in DevTools and read them in page order; check that each labels its section.',
    act: 'Give the main page topic a clear H1 and use H2/H3 where the content has real sections.',
    judgment: 'A page does not need an H3 merely to complete a pattern; review a multiple-H1 warning in context.',
  },
  {
    name: 'Images and alt text',
    checks: 'Auditable images with no alt attribute, overall alt coverage, and supported large-image signals.',
    flags: 'Missing alt on an auditable image, low alt coverage, or a possible image-size opportunity.',
    verify: 'Inspect the image element and ask what information the image adds. For size concerns, check the delivered file and its displayed size.',
    act: 'Add concise alt text for an informative image; resize or optimize a genuinely oversized asset.',
    judgment: 'Use alt="" for a decorative image. A large source can be intentional; do not rewrite every image solely because it is flagged.',
  },
  {
    name: 'URL signals',
    checks: 'The current URL’s total length and a few structural patterns in its path or query.',
    flags: 'A URL over 100 characters or patterns such as many query parameters or long ID-like path segments.',
    verify: 'Read the address bar, separate the stable page path from tracking or application parameters, and check existing links.',
    act: 'Choose a clearer URL for a new page when practical; plan redirects before changing a published URL.',
    judgment: 'Necessary IDs, filters, or established URLs may be valid. A warning is not a request to break working links.',
  },
  {
    name: 'Canonical link',
    checks: 'Whether the page contains a canonical link.',
    flags: 'No canonical link was found.',
    verify: 'Inspect <link rel="canonical"> and compare its href with the URL you intend search engines to treat as preferred.',
    act: 'If the page needs a canonical, set it in the CMS or template to the correct preferred URL.',
    judgment: 'The extension checks absence; it does not prove that a present canonical target is correct. Confirm the site’s URL policy first.',
  },
  {
    name: 'JSON-LD',
    checks: 'Whether JSON-LD scripts are present and whether their text parses as JSON.',
    flags: 'No JSON-LD, or JSON-LD that cannot be parsed.',
    verify: 'Find scripts with type="application/ld+json" in the rendered head or body; parse the JSON and compare its claims with the page.',
    act: 'Correct malformed JSON if structured data is intentionally published; use a dedicated validator for type and eligibility checks.',
    judgment: 'Do not add schema merely to clear a missing-JSON-LD notice. This scan is not complete structured-data validation.',
  },
  {
    name: 'Visible content',
    checks: 'Body text and an advisory text-density signal, excluding scripts and explicitly hidden elements.',
    flags: 'Fewer than 300 counted words or very little visible text relative to the page structure.',
    verify: 'Read the page as a visitor and check whether it answers the task; inspect whether key copy is actually visible.',
    act: 'Add missing explanations, examples, or instructions only when they help the visitor.',
    judgment: 'A concise contact, utility, or visual page may need little copy. The threshold is not a Google word-count requirement.',
  },
] as const;

const beforeHtml = `<head>
  <title>Shop</title>
  <meta name="description" content="Compare city commuter backpacks by size, pocket layout, and weather protection. Find a practical bag for daily travel.">
</head>
<main>
  <h1>City commuter backpacks</h1>
  <h1>Choose a size</h1>
  <img src="/images/size-chart.png">
</main>`;

const afterHtml = `<head>
  <title>City Commuter Backpacks: Size Guide | Alder Bags</title>
  <meta name="description" content="Compare city commuter backpacks by size, pocket layout, and weather protection. Find a practical bag for daily travel.">
  <link rel="canonical" href="https://example.com/commuter-backpacks/">
</head>
<main>
  <h1>City commuter backpacks</h1>
  <h2>Choose a size</h2>
  <img src="/images/size-chart.png" alt="Backpack sizes shown beside a 15-inch laptop">
</main>`;

export default function OnPageSeoChecker() {
  return <main className="page tool-guide on-page-guide"><div className="wrap prose">
    <p className="eyebrow">On-page SEO checker</p>
    <h1>Check on-page SEO for the page you’re viewing.</h1>
    <p className="hero-copy">Use this checklist to inspect the HTML and visible content of one page, decide which findings matter, and verify a manual change. SEO Copilot checks the current page you open in Chrome after you install the extension. It has no online URL input and does not crawl an entire site.</p>

    <section aria-labelledby="checklist">
      <h2 id="checklist">What to inspect on the open page</h2>
      <p>Start with the reported issue, then confirm it in the rendered page. These checks are product diagnostics; they are not a list of guaranteed Google ranking factors. A 0–100 SEO score summarizes the extension’s supported rules, not future search position.</p>
      <div className="on-page-checklist">
        {checks.map(check => <article key={check.name}>
          <h3>{check.name}</h3>
          <dl>
            <div><dt>Checks</dt><dd>{check.checks}</dd></div>
            <div><dt>Possible finding</dt><dd>{check.flags}</dd></div>
            <div><dt>Verify yourself</dt><dd>{check.verify}</dd></div>
            <div><dt>Common action</dt><dd>{check.act}</dd></div>
            <div><dt>Use judgment</dt><dd>{check.judgment}</dd></div>
          </dl>
        </article>)}
      </div>
      <p>For a deeper look at snippet wording, use the <Link href="/title-tag-checker/">title tag checker</Link> or <Link href="/meta-description-checker/">meta description checker</Link>. This checklist focuses on how the signals fit together on one page.</p>
    </section>

    <section aria-labelledby="case-study">
      <h2 id="case-study">Example: review one commuter backpack page</h2>
      <p>Imagine an Alder Bags category page with a useful product comparison, but a generic document title, two H1s, an informative size chart without alt text, and no canonical link. The snippets below show only the relevant HTML; the rest of the page content is omitted. They are illustrative site-owner edits, not changes the extension performs.</p>
      <h3>Before: the relevant HTML</h3>
      <pre className="tool-guide-code"><code>{beforeHtml}</code></pre>
      <div className="on-page-case-steps">
        <article><h3>1. Confirm each finding</h3><p>In DevTools, find the short <code>&lt;title&gt;Shop&lt;/title&gt;</code>, count two H1 elements, inspect the size-chart image for a missing <code>alt</code>, and check whether the head contains a canonical. Read the visible comparison to decide what the title and image should say.</p></article>
        <article><h3>2. Choose the fixes</h3><p>Replace the generic title with the actual page topic; make “Choose a size” an H2 under the main H1; describe the information in the chart; and add a canonical only after confirming the preferred URL is <code>https://example.com/commuter-backpacks/</code>. The description already matches the page, so leave it alone.</p></article>
        <article><h3>3. Review notices that need no change</h3><p>If the report also notes missing JSON-LD, do not add it without a suitable structured-data use case. If a content-length notice appears, read the full published page before adding copy; the short excerpt here is not the complete page.</p></article>
      </div>
      <h3>After: the selected manual edits</h3>
      <pre className="tool-guide-code"><code>{afterHtml}</code></pre>
      <p>Publish the edited page, reload the exact URL, and inspect its rendered head and image again. Re-scan the tab to see whether the original findings remain. If one does, check the CMS template and cache before making another edit. Select what to work on using the issue explanation and the page’s purpose; the extension’s list is not promised to be automatically sorted by severity.</p>
    </section>

    <section aria-labelledby="use-extension">
      <h2 id="use-extension">Use the extension for the next pass</h2>
      <p>Open a page in Chrome, start a scan, and use the report to focus your manual inspection. For supported missing, short, or long title and meta description issues, you can request optional AI wording candidates, review them, and copy one into your own editor. AI Fix does not repair headings, alt text, canonical links, JSON-LD, or URLs, and SEO Copilot never publishes website changes for you.</p>
      <p>When several findings need work, follow the <Link href="/seo-audit/">page-level SEO audit workflow</Link> to track each change and recheck it.</p>
    </section>

    <section className="tool-guide-next" aria-labelledby="on-page-next">
      <h2 id="on-page-next">Check your current page in Chrome</h2>
      <p>Install SEO Copilot, open the page you want to review, and start a scan. Use the checklist above to verify each finding before editing your CMS or code.</p>
      <div className="actions"><StoreCta label="Add to Chrome" /></div>
    </section>
  </div></main>;
}
