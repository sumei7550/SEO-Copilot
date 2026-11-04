// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Footer } from './Footer';
import { Header } from './Header';
import { LOCALES, SEO_TOOL_PATHS, localizedPath, seoToolLinks, seoToolsLabel, type Locale } from '@/lib/site';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
vi.mock('@/lib/analytics', () => ({ trackWebsite: vi.fn(), trackWebsiteInstallClick: vi.fn() }));

const locales: Locale[] = ['en', ...LOCALES];
const pathOf = (href: string | null) => href?.replace(/\/$/, '');
const host = document.createElement('div');
document.body.appendChild(host);
const root = createRoot(host);
afterEach(() => act(() => root.render(null)));

describe('SEO tool navigation', () => {
  it.each(locales)('renders localized footer links and both expandable header menus for %s', locale => {
    act(() => root.render(<><Header locale={locale} /><Footer locale={locale} /></>));
    const footer = host.querySelector('footer')!;
    expect(footer.textContent).toContain(seoToolsLabel[locale]);
    const footerLinks = [...footer.querySelectorAll('a[href]')];
    for (const { path, label } of seoToolLinks(locale)) {
      const matches = footerLinks.filter(link => pathOf(link.getAttribute('href')) === pathOf(localizedPath(locale, path)));
      expect(matches).toHaveLength(1);
      expect(matches[0].textContent).toBe(label);
    }
    const desktopButton = host.querySelector<HTMLButtonElement>('.tools-toggle')!;
    expect(desktopButton.textContent).toContain(seoToolsLabel[locale]);
    expect(desktopButton.getAttribute('aria-expanded')).toBe('false');
    act(() => desktopButton.click());
    expect(desktopButton.getAttribute('aria-expanded')).toBe('true');
    for (const path of SEO_TOOL_PATHS) {
      expect([...host.querySelectorAll('.tools-list a')].some(link => pathOf(link.getAttribute('href')) === pathOf(localizedPath(locale, path)))).toBe(true);
    }
    act(() => host.querySelector<HTMLButtonElement>('.mobile-menu-toggle')!.click());
    const mobileToolsButton = host.querySelector<HTMLButtonElement>('.mobile-tools-toggle')!;
    expect(mobileToolsButton.textContent).toContain(seoToolsLabel[locale]);
    act(() => mobileToolsButton.click());
    expect(mobileToolsButton.getAttribute('aria-expanded')).toBe('true');
    for (const path of SEO_TOOL_PATHS) {
      expect([...host.querySelectorAll('.mobile-tools-list a')].some(link => pathOf(link.getAttribute('href')) === pathOf(localizedPath(locale, path)))).toBe(true);
    }
  });
});
