// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import mixpanel from 'mixpanel-browser';

vi.mock('mixpanel-browser', () => ({
  default: { init: vi.fn(), track: vi.fn(), track_pageview: vi.fn(), opt_in_tracking: vi.fn(), opt_out_tracking: vi.fn() },
}));

async function modules() {
  const consent = await import('./analytics-consent');
  const analytics = await import('./analytics');
  return { consent, analytics };
}

describe('website analytics consent and event delivery', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_MIXPANEL_TOKEN', 'test-token');
    window.localStorage.clear();
    window.dataLayer = undefined;
    window.gtag = undefined;
    window.history.replaceState({}, '', '/fr/pricing/');
    document.documentElement.lang = 'fr';
  });

  it('does not initialize either service or send page views before a choice or after rejection', async () => {
    const { consent, analytics } = await modules();
    expect(consent.restoreAnalyticsConsent()).toBe('unset');
    analytics.initializeAcceptedAnalytics();
    analytics.initializeGoogleTag();
    analytics.trackWebsitePageView('/fr/pricing/', 'fr');
    expect(mixpanel.init).not.toHaveBeenCalled();
    expect(mixpanel.track_pageview).not.toHaveBeenCalled();
    expect(window.dataLayer).toBeUndefined();

    consent.saveAnalyticsConsent('rejected');
    analytics.trackWebsitePageView('/fr/pricing/', 'fr');
    analytics.trackWebsiteInstallClick('header', 'Installer');
    expect(mixpanel.track).not.toHaveBeenCalled();
    expect(window.dataLayer).toBeUndefined();
  });

  it('initializes once and sends the original Mixpanel page view plus one GA config', async () => {
    const { consent, analytics } = await modules();
    consent.saveAnalyticsConsent('accepted');
    analytics.initializeAcceptedAnalytics();
    analytics.initializeAcceptedAnalytics();
    analytics.initializeGoogleTag();
    analytics.initializeGoogleTag();
    analytics.trackWebsitePageView('/fr/pricing/', 'fr');
    expect(mixpanel.init).toHaveBeenCalledTimes(1);
    expect(mixpanel.init).toHaveBeenCalledWith('test-token', { autocapture: false, track_pageview: false, persistence: 'localStorage' });
    expect(mixpanel.track_pageview).toHaveBeenCalledOnce();
    expect(mixpanel.track_pageview).toHaveBeenCalledWith({ page_path: '/fr/pricing/', locale: 'fr' });
    expect(window.dataLayer?.filter(item => Array.isArray(item) && item[0] === 'config')).toHaveLength(1);
    expect(window.dataLayer?.filter(item => Array.isArray(item) && item[0] === 'event' && item[1] === 'page_view')).toHaveLength(0);
    expect(window.dataLayer?.map(item => Array.isArray(item) && item[0])).toEqual(['js', 'config', 'event']);
    expect(mixpanel.track).toHaveBeenCalledWith('pricing_page_view', expect.objectContaining({ page_path: '/fr/pricing/', locale: 'fr' }));
  });

  it('sends install clicks to both destinations with the original Mixpanel fields', async () => {
    const { consent, analytics } = await modules();
    consent.saveAnalyticsConsent('accepted');
    analytics.initializeAcceptedAnalytics();
    analytics.initializeGoogleTag();
    analytics.trackWebsiteInstallClick('store_cta', 'Installer sur Chrome');
    expect(mixpanel.track).toHaveBeenCalledWith('web_extension_install_clicked', expect.objectContaining({
      location: 'store_cta', page_path: '/fr/pricing/', language: 'fr', button_text: 'Installer sur Chrome',
      product_surface: 'website', environment: 'production',
    }), { transport: 'sendBeacon', send_immediately: true });
    expect(window.dataLayer).toContainEqual(['event', 'web_extension_install_clicked', expect.objectContaining({ location: 'store_cta', send_to: 'G-TQQPS72SVT' })]);
  });

  it('queues config before the Google script is inserted and retains install clicks during loading', async () => {
    const { consent, analytics } = await modules();
    consent.saveAnalyticsConsent('accepted');
    analytics.initializeAcceptedAnalytics();
    expect(window.dataLayer).toContainEqual(['config', 'G-TQQPS72SVT', expect.anything()]);
    analytics.trackWebsiteInstallClick('header', 'Installer sur Chrome');
    expect(window.dataLayer).toContainEqual(['event', 'web_extension_install_clicked', expect.objectContaining({ location: 'header' })]);
    expect(window.dataLayer?.filter(item => Array.isArray(item) && item[0] === 'config')).toHaveLength(1);
  });

  it('stops future events and clears SDK persistence on withdrawal', async () => {
    const { consent, analytics } = await modules();
    consent.saveAnalyticsConsent('accepted');
    analytics.initializeAcceptedAnalytics();
    analytics.initializeGoogleTag();
    document.cookie = '_ga=test; Path=/';
    consent.saveAnalyticsConsent('rejected');
    analytics.revokeAnalytics();
    analytics.trackWebsitePageView('/fr/pricing/', 'fr');
    analytics.trackWebsiteInstallClick('header', 'Installer');
    expect(window['ga-disable-G-TQQPS72SVT']).toBe(true);
    expect(document.cookie).not.toContain('_ga=');
    expect(mixpanel.opt_out_tracking).toHaveBeenCalledWith({ delete_user: false });
    expect(mixpanel.track_pageview).not.toHaveBeenCalled();
    expect(mixpanel.track).not.toHaveBeenCalled();
    expect(window.dataLayer?.filter(item => Array.isArray(item) && item[0] === 'event')).toHaveLength(0);
  });

  it('resumes without initializing Mixpanel a second time after a new acceptance', async () => {
    const { consent, analytics } = await modules();
    consent.saveAnalyticsConsent('accepted');
    analytics.initializeAcceptedAnalytics();
    consent.saveAnalyticsConsent('rejected');
    analytics.revokeAnalytics();
    consent.saveAnalyticsConsent('accepted');
    analytics.initializeAcceptedAnalytics();
    analytics.initializeGoogleTag();
    analytics.trackWebsiteInstallClick('footer', 'Chrome Web Store');
    expect(mixpanel.init).toHaveBeenCalledTimes(1);
    expect(mixpanel.opt_in_tracking).toHaveBeenCalledTimes(1);
    expect(mixpanel.track).toHaveBeenCalledWith('web_extension_install_clicked', expect.objectContaining({ location: 'footer' }), expect.anything());
  });

  it('restores a saved choice after a module reload and tracks a non-English language change', async () => {
    let { consent } = await modules();
    consent.saveAnalyticsConsent('accepted');
    vi.resetModules();
    const restored = await modules();
    consent = restored.consent;
    expect(consent.restoreAnalyticsConsent()).toBe('accepted');
    restored.analytics.initializeAcceptedAnalytics();
    restored.analytics.initializeGoogleTag();
    restored.analytics.trackWebsite('web_language_changed', { from_locale: 'fr', to_locale: 'de' });
    expect(mixpanel.track).toHaveBeenCalledWith('web_language_changed', expect.objectContaining({ from_locale: 'fr', to_locale: 'de' }));
    expect(window.dataLayer).toContainEqual(['event', 'language_changed', expect.objectContaining({ from_locale: 'fr', to_locale: 'de' })]);
  });

  it('keeps the store link event handler harmless if Mixpanel throws', async () => {
    const { consent, analytics } = await modules();
    consent.saveAnalyticsConsent('accepted');
    vi.mocked(mixpanel.track).mockImplementationOnce(() => { throw new Error('network error'); });
    expect(() => analytics.trackWebsiteInstallClick('header', 'Install on Chrome')).not.toThrow();
    expect(mixpanel.track).toHaveBeenCalledTimes(1);
  });
});
