import type { Metadata } from 'next';
import { pageMetadata, STORE_URL } from '@/lib/site';
import { getLocalizedSupport } from '@/lib/localized-pages';

export const metadata: Metadata = pageMetadata('Support', 'Get help with SEO Copilot or report an issue.', 'support');

export default function Support() {
  const s = getLocalizedSupport('en');
  return <main className="page"><div className="wrap prose"><p className="eyebrow">{s.eyebrow}</p><h1>{s.title}</h1><p>{s.intro}</p><div className="faq">{s.faq.map(([q, a]) => <article className="card" key={q}><h3>{q}</h3><p>{a}</p></article>)}</div><div className="actions"><a className="button button-primary" href={STORE_URL} target="_blank" rel="noopener noreferrer">{s.install} ↗</a><a className="button" href="/privacy">{s.privacy}</a><a className="button" href="https://github.com/sumei7550/SEO-Copilot/issues" target="_blank" rel="noopener noreferrer">{s.github}</a></div></div></main>;
}
