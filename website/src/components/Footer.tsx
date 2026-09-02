import Link from 'next/link';
import { getCopy, localizedPath, type Locale } from '@/lib/site';

export function Footer({ locale = 'en' }: { locale?: Locale }) { const c = getCopy(locale); return <footer className="site-footer"><div className="wrap footer-inner"><span>© 2026 SEO Copilot. {c.footer}</span><div className="footer-links"><Link href={localizedPath(locale, 'privacy')}>Privacy</Link><Link href={localizedPath(locale, 'support')}>{c.nav.support}</Link><a href="https://github.com/sumei7550/SEO-Copilot" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?utm_source=website" target="_blank" rel="noopener noreferrer">Chrome Web Store</a></div></div></footer>; }
