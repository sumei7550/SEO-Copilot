import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { getLocalizedPrivacy } from '@/lib/localized-pages';

export const metadata: Metadata = pageMetadata('Privacy Policy', 'Privacy information for SEO Copilot.', 'privacy');

export default function Privacy() {
  const p = getLocalizedPrivacy('en');
  return <main className="page"><div className="wrap prose"><p className="eyebrow">{p.eyebrow}</p><h1>{p.title}</h1><p>{p.effective}</p><h2>{p.scanHeading}</h2><p>{p.scan}</p><h2>{p.aiHeading}</h2><p>{p.ai}</p><h2>{p.storageHeading}</h2><p>{p.storage}</p><p>{p.limits} <a href="https://github.com/sumei7550/SEO-Copilot/blob/main/docs/PRIVACY_DATA_MAP.md" target="_blank" rel="noopener noreferrer">data map</a>.</p><h2>{p.notHeading}</h2><ul>{p.notDo.map(item => <li key={item}>{item}</li>)}</ul><h2>{p.contact}</h2><p><a href="https://github.com/sumei7550/SEO-Copilot/issues" target="_blank" rel="noopener noreferrer">{p.contactLink}</a></p></div></main>;
}
