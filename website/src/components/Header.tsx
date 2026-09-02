'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getCopy, localizedPath, LOCALES, type Locale } from '@/lib/site';

const languageNames: Record<Locale, string> = { en: 'English', 'zh-CN': '简体中文', 'zh-TW': '繁體中文', ja: '日本語', ko: '한국어', de: 'Deutsch', fr: 'Français', es: 'Español', 'pt-BR': 'Português (Brasil)' };
const allLocales: Locale[] = ['en', ...LOCALES];

export function Header({ locale = 'en', currentPath = '' }: { locale?: Locale; currentPath?: string }) {
  const c = getCopy(locale); const [open, setOpen] = useState(false); const languageRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (e: MouseEvent) => { if (!languageRef.current?.contains(e.target as Node)) setOpen(false); }; const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; document.addEventListener('mousedown', close); document.addEventListener('keydown', escape); return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); }; }, []);
  return <header className="site-header"><div className="wrap header-inner"><Link className="brand" href={localizedPath(locale, '')} aria-label="SEO Copilot home"><img className="brand-mark" src="/icon128.png" alt="" width={32} height={32} /><span>SEO Copilot</span></Link><nav className="nav" aria-label="Primary navigation"><Link href={localizedPath(locale, 'features')}>{c.nav.features}</Link><Link href={localizedPath(locale, 'seo-audit')}>{c.nav.audit}</Link><Link href={localizedPath(locale, 'support')}>{c.nav.support}</Link><LanguagePicker locale={locale} currentPath={currentPath} open={open} setOpen={setOpen} languageRef={languageRef} /><InstallLink label={c.cta} /></nav><details className="mobile-menu"><summary aria-label="Open navigation">Menu</summary><div className="mobile-menu-panel"><Link href={localizedPath(locale, 'features')}>{c.nav.features}</Link><Link href={localizedPath(locale, 'seo-audit')}>{c.nav.audit}</Link><Link href={localizedPath(locale, 'support')}>{c.nav.support}</Link><div className="mobile-language"><span>Language</span><LanguagePicker locale={locale} currentPath={currentPath} open={open} setOpen={setOpen} languageRef={languageRef} mobile /></div><InstallLink label={c.cta} /></div></details></div></header>;
}

function LanguagePicker({ locale, currentPath, open, setOpen, languageRef, mobile = false }: { locale: Locale; currentPath: string; open: boolean; setOpen: (value: boolean) => void; languageRef: React.RefObject<HTMLDivElement | null>; mobile?: boolean }) {
  return <div className={`language-picker${mobile ? ' language-picker-mobile' : ''}`} ref={languageRef}>{mobile && <span className="language-current-label">Current: {languageNames[locale]}</span>}<button className="language-button" type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><span>{mobile ? languageNames[locale] : locale === 'en' ? 'EN' : languageNames[locale]}</span><span aria-hidden="true" className="chevron">⌄</span></button>{open && <div className="language-menu" role="menu" aria-label="Choose language">{allLocales.map(item => <Link role="menuitem" aria-current={item === locale ? 'true' : undefined} className={item === locale ? 'selected' : ''} key={item} href={localizedPath(item, currentPath)} onClick={() => setOpen(false)}><span>{languageNames[item]}</span>{item === locale && <span aria-hidden="true">✓</span>}</Link>)}</div>}</div>;
}

function InstallLink({ label }: { label: string }) { return <a className="button button-primary" href="https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?utm_source=website" target="_blank" rel="noopener noreferrer">{label}</a>; }
