import { useState } from 'react';
import type { HeadingData, PageData } from '../types/seo';

const DEFAULT_VISIBLE_HEADINGS = 8;

export function headingsAsTsv(headings: HeadingData[]): string {
  return headings.map(({ level, text }) => `H${level}\t${text.replace(/[\t\r\n]/g, ' ')}`).join('\n');
}

export function ContentAnalysis({ page, onRescan }: { page: PageData; onRescan: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [copyFallback, setCopyFallback] = useState('');
  const headings = page.headings;
  const visibleHeadings = expanded ? headings : headings.slice(0, DEFAULT_VISIBLE_HEADINGS);

  async function copyHeadings() {
    const tsv = headingsAsTsv(headings);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(tsv);
      setCopyMessage(`All ${headings.length} headings copied as TSV`);
      setCopyFallback('');
    } catch {
      setCopyMessage('Copy failed. Select the complete TSV below and copy manually.');
      setCopyFallback(tsv);
    }
  }

  return <section className="content-analysis" aria-label="Content analysis">
    <div className="section-heading"><div><h2>Content analysis</h2><p>Words and heading structure from the last scan.</p></div></div>
    <div className="content-metric-card"><p className="content-metric-kicker">Word count</p><p className="content-metric-value">{page.wordCount}<small>words</small></p><p className="content-metric-note">Visible page text estimate. It is not an SEO Score or optimization target.</p></div>
    <div className="content-headings-card">
      <div className="content-heading-top"><h3>Headings</h3><span>{headings.length} found</span></div>
      {headings.length ? <div className="content-heading-list">{visibleHeadings.map((heading, index) => <div className="content-heading-row" data-level={heading.level} key={index}><span className="content-heading-badge">H{heading.level}</span><p className={`content-heading-text${heading.text ? '' : ' is-empty'}`}>{heading.text || 'Empty heading'}</p></div>)}</div> : <div className="content-heading-empty"><strong>No H1–H3 headings found</strong><p>There are no headings to copy. Review the page, then re-scan.</p></div>}
      {headings.length > DEFAULT_VISIBLE_HEADINGS ? <button className="content-show-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show fewer' : 'Show more'}</button> : null}
      <div className="content-heading-actions"><button className="content-copy-button" type="button" onClick={() => void copyHeadings()} disabled={!headings.length}>Copy headings</button><span>TSV · Page order</span></div>
      <p className={`content-copy-status${copyFallback ? ' is-error' : ''}`} role="status" aria-live="polite">{copyMessage}</p>
      {copyFallback ? <textarea className="content-copy-fallback" readOnly value={copyFallback} aria-label="All headings in TSV" onFocus={(event) => event.currentTarget.select()} /> : null}
    </div>
    <button className="rescan-button" type="button" onClick={onRescan}>Done editing? Re-scan page <span>→</span></button>
  </section>;
}
