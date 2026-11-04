// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SiteChrome } from './SiteChrome';
import { trackWebsitePageView } from '@/lib/analytics';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));
vi.mock('@/lib/analytics', () => ({ trackWebsitePageView: vi.fn() }));
vi.mock('@/components/AnalyticsConsentManager', () => ({
  AnalyticsConsentManager: ({ onConsentChange }: { onConsentChange: (choice: string) => void }) =>
    <button type="button" onClick={() => onConsentChange('accepted')}>Accept</button>,
}));
vi.mock('@/components/Header', () => ({ Header: () => <header /> }));
vi.mock('@/components/Footer', () => ({ Footer: () => <footer /> }));

describe('SiteChrome route tracking', () => {
  let host: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  beforeEach(() => {
    pathname = '/';
    vi.clearAllMocks();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it('tracks only once per route after acceptance across English and French pages', () => {
    act(() => root.render(<SiteChrome><main /></SiteChrome>));
    expect(trackWebsitePageView).not.toHaveBeenCalled();
    act(() => (host.querySelector('button') as HTMLButtonElement).click());
    expect(trackWebsitePageView).toHaveBeenCalledExactlyOnceWith('/', 'en');
    act(() => root.render(<SiteChrome><main /></SiteChrome>));
    expect(trackWebsitePageView).toHaveBeenCalledTimes(1);
    pathname = '/fr/pricing/';
    act(() => root.render(<SiteChrome><main /></SiteChrome>));
    expect(trackWebsitePageView).toHaveBeenCalledTimes(2);
    expect(trackWebsitePageView).toHaveBeenLastCalledWith('/fr/pricing/', 'fr');
  });
});
