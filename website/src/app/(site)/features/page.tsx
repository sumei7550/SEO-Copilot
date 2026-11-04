import type { Metadata } from 'next';
import { StoreCta } from '@/components/StoreCta';
import Link from 'next/link';
import { FEATURE_CARD_PATHS, localizedPath, pageMetadata } from '@/lib/site';
export const metadata: Metadata = pageMetadata('Features', 'Explore the practical SEO audit and AI-assisted improvement features in SEO Copilot.', 'features');
export default function Features() {
  return <main className="page"><div className="wrap prose">
    <p className="eyebrow">Features</p>
    <h1>A clearer way to review a page.</h1>
    <p>SEO Copilot keeps page-level SEO focused: find the signals that matter, understand the reason, then decide what to change.</p>
    <div className="cards">{[
      ['SEO score', 'A fast 0–100 snapshot of the page’s on-page health.'],
      ['Issue detection', 'Find missing, short, long, duplicated, or structurally weak SEO elements.'],
      ['Actionable explanations', 'See the impact and a practical fix for every supported issue.'],
      ['AI title suggestions', 'Generate several title candidates when the current title needs work.'],
      ['AI meta descriptions', 'Create concise options grounded in the page context.'],
      ['Re-scan workflow', 'Update your page manually, then scan again to verify the result.'],
    ].map(([title, body], index) => <article className="card" key={title}><div className="icon">✓</div><h3>{FEATURE_CARD_PATHS[index] ? <Link href={localizedPath('en', FEATURE_CARD_PATHS[index])}>{title}</Link> : title}</h3><p>{body}</p></article>)}</div>

    <section aria-labelledby="scan-results">
      <h2 id="scan-results">What a page scan shows</h2>
      <h3>SEO score and prioritized issues</h3>
      <p>Open the page you want to review and run the extension. The 0–100 score is a quick snapshot; the issue list shows which supported checks need attention. Use the findings to choose a first task, rather than treating the number as a search ranking prediction.</p>
      <h3>Actionable explanations</h3>
      <p>Each reported issue includes an explanation and a suggested next step. Compare that guidance with the page itself before editing your CMS or code. The report helps you decide what to investigate; it does not change the website for you.</p>
    </section>

    <section aria-labelledby="feature-workflow">
      <h2 id="feature-workflow">Six features, from finding an issue to checking the fix</h2>
      <h3>SEO score and issue detection</h3>
      <p>The score summarizes the active page, while issue detection points to supported title, meta description, heading, image, URL, canonical, structured data, and content signals. Together they turn a broad concern into a specific item to inspect.</p>
      <h3>Explanations and suggested next steps</h3>
      <p>Read the issue’s impact and fix guidance to understand why it appeared. Confirm the finding against the live page before deciding whether it applies to your content.</p>
      <h3>AI title and meta description ideas</h3>
      <p>For supported title or meta description issues, you can actively request wording candidates based on the page context. Review their accuracy and choose the wording yourself; AI suggestions are optional and are never published automatically.</p>
      <h3>Re-scan after a manual change</h3>
      <p>After updating the page in your own CMS or code, scan it again to check whether the issue still appears. This closes the loop between a reported problem and the change you actually made.</p>
    </section>

    <section aria-labelledby="focused-checks">
      <h2 id="focused-checks">Choose the right focused check</h2>
      <p>Start with the <Link href={localizedPath('en', 'title-tag-checker')}>title tag check</Link> if a page title needs attention, or the <Link href={localizedPath('en', 'meta-description-checker')}>meta description check</Link> for snippet wording. Use the <Link href={localizedPath('en', 'on-page-seo-checker')}>on-page signal guide</Link> to see the scan’s coverage, then follow the <Link href={localizedPath('en', 'seo-audit')}>page audit workflow</Link> when you are ready to prioritize and verify several fixes.</p>
    </section>

    <div className="actions"><StoreCta /><Link className="button button-secondary" href={localizedPath('en', 'pricing')}>View plans</Link></div>
  </div></main>;
}
