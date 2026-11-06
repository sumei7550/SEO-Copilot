import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { StoreCta } from '@/components/StoreCta';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata('Features', 'Explore the practical SEO audit and AI-assisted improvement features in SEO Copilot.', 'features');

const features = [
  { title: 'Current-page scan', checks: 'The page open in your active Chrome tab after you start a scan.', output: 'A report for that page’s supported SEO signals.', value: 'Review the page you are editing without setting up a site crawl.' },
  { title: 'SEO Score', checks: 'Results from the extension’s supported page-level rules.', output: 'A 0–100 score and a grade.', value: 'Get a quick summary before reading individual findings; the score is not a ranking forecast.' },
  { title: 'Issue detection', checks: 'Title, meta description, headings, images and alt text, URL, canonical, JSON-LD, and visible-content signals.', output: 'Issue count, severity labels, and individual findings.', value: 'Find a concrete element to inspect. A warning is a prompt to judge the page, not an automatic demand to edit it.' },
  { title: 'Explanations and actions', checks: 'Each detected issue in the report.', output: 'An impact explanation and recommended action.', value: 'Understand a finding before changing your CMS or code. The issue list does not set an automatic work order.' },
  { title: 'Optional AI wording', checks: 'Supported missing, short, or long title and meta description issues only.', output: 'Up to three wording candidates when you request them; choose and copy one if useful.', value: 'Explore alternative copy while keeping the final wording and publication under your control.' },
  { title: 'Re-scan after editing', checks: 'The current page after you publish and reload your manual change.', output: 'A fresh score and issue report.', value: 'Check whether the original finding remains. Compare scans yourself; the extension does not track a before-and-after history.' },
] as const;

const workflow = [
  'Open the webpage you want to review in Chrome.',
  'Open the SEO Copilot Side Panel and start a scan of the current page.',
  'Read the score, then inspect the issue count, severity, impact, and recommended action.',
  'If a supported title or meta description issue needs wording help, request optional AI candidates.',
  'Make and publish any chosen change yourself in your CMS or code.',
  'Reload the page and re-scan to check whether the finding remains.',
] as const;

export default function Features() {
  return <main className="page tool-guide features-guide"><div className="wrap prose">
    <p className="eyebrow">Features</p>
    <h1>A clearer way to review a page.</h1>
    <p className="hero-copy">SEO Copilot is a Chrome extension for a focused check of the page you are viewing. Start a local scan, read the report, decide what matters, and verify your own edits with another scan. No account is needed for the basic audit.</p>

    <section aria-labelledby="feature-overview">
      <h2 id="feature-overview">Six ways to move from a page to a decision</h2>
      <div className="features-overview">{features.map(feature => <article key={feature.title}>
        <h3>{feature.title}</h3>
        <dl><div><dt>Checks</dt><dd>{feature.checks}</dd></div><div><dt>Shows</dt><dd>{feature.output}</dd></div><div><dt>Why it helps</dt><dd>{feature.value}</dd></div></dl>
      </article>)}</div>
    </section>

    <section className="features-screenshots" aria-labelledby="features-screen-heading">
      <h2 id="features-screen-heading">See the current Side Panel</h2>
      <p>These captures show SEO Copilot 1.3.2 checking the open Support page, reviewing its reported issues, and generating optional meta description wording. Scores and findings change with the page; review each warning in context before deciding what to edit.</p>
      <figure className="features-scan-shot">
        <a href="/screenshots/features-scan-support-v1.3.2.png" target="_blank" rel="noopener noreferrer" aria-label="Open the full scan result screenshot"><Image src="/screenshots/features-scan-support-v1.3.2.png" alt="SEO Copilot scanning the Support page, with an 82 out of 100 SEO Score, Good grade, and four reported warnings" width={1836} height={905} loading="eager" /></a>
        <figcaption>Full scan: the open Support page and its SEO report. On a narrow screen, scroll the image sideways or open it at full size.</figcaption>
      </figure>
      <div className="features-detail-shots">
        <figure><a href="/screenshots/features-issues-support-v1.3.2.png" target="_blank" rel="noopener noreferrer" aria-label="Open the four-issue report screenshot"><Image src="/screenshots/features-issues-support-v1.3.2.png" alt="SEO report with four warnings about a short title, meta description length, a skipped heading level, and fewer than 300 visible words" width={646} height={912} loading="eager" /></a><figcaption>Issue details: four warnings on this page, each with context to review. A warning does not always require a change.</figcaption></figure>
        <figure><a href="/screenshots/features-ai-support-v1.3.2.png" target="_blank" rel="noopener noreferrer" aria-label="Open the AI recommendations screenshot"><Image src="/screenshots/features-ai-support-v1.3.2.png" alt="AI SEO Fix showing three meta description recommendations for the Support page, with one candidate selected for copying" width={611} height={893} loading="eager" /></a><figcaption>AI recommendations: three optional descriptions for a supported meta description warning. You choose and publish any edit yourself.</figcaption></figure>
      </div>
    </section>

    <section aria-labelledby="feature-workflow">
      <h2 id="feature-workflow">From opening a page to checking your edit</h2>
      <ol className="features-workflow">{workflow.map(step => <li key={step}>{step}</li>)}</ol>
      <p>Basic scanning, parsing, rule checks, and scoring run locally in Chrome. AI suggestions are optional and require a separate request that sends the relevant page context to the SEO Copilot service.</p>
    </section>

    <section aria-labelledby="feature-fit">
      <h2 id="feature-fit">Where it fits</h2>
      <p>Use it while reviewing a landing page, article, product page, or documentation page before publishing, or after a manual update. It is useful when you can inspect the page itself and decide whether a finding applies to its purpose.</p>
      <p>SEO Copilot checks one active page at a time. It has no online URL input, batch URL scan, or full-site crawler, and it never modifies your website automatically. The complete extension interface is currently primarily in English. It does not predict rankings or fully validate structured-data eligibility.</p>
    </section>

    <section aria-labelledby="feature-guides">
      <h2 id="feature-guides">Choose a focused guide</h2>
      <div className="features-guides">
        <Link href="/seo-checker/">SEO Checker <span>Read a quick page report</span></Link>
        <Link href="/on-page-seo-checker/">On-page SEO Checker <span>See supported signals</span></Link>
        <Link href="/title-tag-checker/">Title Tag Checker <span>Investigate a title finding</span></Link>
        <Link href="/meta-description-checker/">Meta Description Checker <span>Review description wording</span></Link>
      </div>
      <p>For a longer review with manual verification and a record of changes, follow the <Link href="/seo-audit/">single-page SEO audit workflow</Link>.</p>
    </section>

    <section className="tool-guide-next" aria-labelledby="feature-next"><h2 id="feature-next">Check the page in front of you</h2><p>Install SEO Copilot, open the page you want to review in Chrome, and start your first scan from the Side Panel.</p><div className="actions"><StoreCta label="Add to Chrome" /></div></section>
  </div></main>;
}
