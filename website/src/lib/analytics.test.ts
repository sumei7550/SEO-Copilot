// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import mixpanel from 'mixpanel-browser';

vi.mock('mixpanel-browser', () => ({
  default: { init: vi.fn(), track: vi.fn(), track_pageview: vi.fn() },
}));

describe('website install click tracking', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_MIXPANEL_TOKEN', 'test-token');
    window.history.replaceState({}, '', '/fr/pricing/');
    document.documentElement.lang = 'fr';
  });

  it('tracks a click after the page view using one immediate beacon request', async () => {
    const { trackWebsitePageView, trackWebsiteInstallClick } = await import('./analytics');

    trackWebsitePageView('/fr/pricing/', 'fr');
    trackWebsiteInstallClick('store_cta', 'Installer sur Chrome');

    expect(mixpanel.init).toHaveBeenCalledTimes(1);
    expect(mixpanel.track_pageview).toHaveBeenCalledTimes(1);
    expect(mixpanel.track).toHaveBeenCalledTimes(1);
    expect(mixpanel.track).toHaveBeenCalledWith(
      'web_extension_install_clicked',
      expect.objectContaining({
        location: 'store_cta',
        page_path: '/fr/pricing/',
        language: 'fr',
        button_text: 'Installer sur Chrome',
      }),
      { transport: 'sendBeacon', send_immediately: true },
    );
  });

  it('does not throw when the analytics request fails', async () => {
    const { trackWebsiteInstallClick } = await import('./analytics');
    vi.mocked(mixpanel.track).mockImplementationOnce(() => { throw new Error('network error'); });

    expect(() => trackWebsiteInstallClick('header', 'Install on Chrome')).not.toThrow();
    expect(mixpanel.track).toHaveBeenCalledTimes(1);
  });
});
