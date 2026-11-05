// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsConsentManager } from './AnalyticsConsentManager';
import { initializeAcceptedAnalytics, revokeAnalytics } from '@/lib/analytics';

vi.mock('next/script', () => ({
  default: () => <script data-testid="consent-gated-ga4" />,
}));
vi.mock('@/lib/analytics', () => ({
  GA_MEASUREMENT_ID: 'G-TQQPS72SVT',
  initializeAcceptedAnalytics: vi.fn(),
  revokeAnalytics: vi.fn(),
}));

describe('AnalyticsConsentManager', () => {
  let host: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const onConsentChange = vi.fn();
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });
  afterEach(() => { act(() => root.unmount()); host.remove(); });

  it('does not mount GA until acceptance and restores the choice after remount', () => {
    act(() => root.render(<AnalyticsConsentManager locale="en" onConsentChange={onConsentChange} />));
    expect(host.textContent).toContain('Reject analytics');
    expect(host.querySelector('[data-testid="consent-gated-ga4"]')).toBeNull();
    expect(initializeAcceptedAnalytics).not.toHaveBeenCalled();

    act(() => (Array.from(host.querySelectorAll('button')).find(b => b.textContent === 'Reject analytics') as HTMLButtonElement).click());
    expect(window.localStorage.getItem('seo_copilot_analytics_consent')).toBe('rejected');
    expect(host.querySelector('[data-testid="consent-gated-ga4"]')).toBeNull();
    expect(revokeAnalytics).toHaveBeenCalled();

    act(() => (Array.from(host.querySelectorAll('button')).find(b => b.textContent === 'Settings') as HTMLButtonElement).click());
    act(() => (Array.from(host.querySelectorAll('button')).find(b => b.textContent === 'Accept analytics') as HTMLButtonElement).click());
    expect(window.localStorage.getItem('seo_copilot_analytics_consent')).toBe('accepted');
    expect(host.querySelector('[data-testid="consent-gated-ga4"]')).not.toBeNull();
    expect(initializeAcceptedAnalytics).toHaveBeenCalledOnce();

    act(() => root.unmount());
    root = createRoot(host);
    act(() => root.render(<AnalyticsConsentManager locale="de" onConsentChange={onConsentChange} />));
    expect(host.querySelector('[data-testid="consent-gated-ga4"]')).not.toBeNull();
    expect(host.textContent).toContain('Einstellungen');
  });
});
