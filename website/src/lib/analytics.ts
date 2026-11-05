'use client';

import mixpanel from 'mixpanel-browser';
import { isAnalyticsAllowed } from './analytics-consent';

export const GA_MEASUREMENT_ID = 'G-TQQPS72SVT';
export type WebsiteEvent = 'web_extension_install_clicked' | 'web_navigation_clicked' | 'web_language_changed' | 'web_support_clicked' | 'pricing_page_view';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

let mixpanelInitialized = false;
let gaInitialized = false;
let gaJsInitialized = false;

function isCrawler() {
  if (typeof navigator === 'undefined') return true;
  return /bot|crawler|spider|slurp|Google-InspectionTool|Lighthouse/i.test(navigator.userAgent);
}

function initMixpanel() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!isAnalyticsAllowed() || isCrawler() || process.env.NODE_ENV !== 'production' || !token) return false;
  if (mixpanelInitialized) return true;
  try {
    mixpanel.init(token, { autocapture: false, track_pageview: false, persistence: 'localStorage' });
    mixpanelInitialized = true;
    return true;
  } catch {
    return false;
  }
}

export function initializeAcceptedAnalytics() {
  if (!isAnalyticsAllowed() || isCrawler()) return;
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  // Queue config before Next.js inserts gtag.js. Google processes this on load.
  initializeGoogleTag();
  if (mixpanelInitialized) {
    try { mixpanel.opt_in_tracking({ track: () => {} }); } catch { /* Keep the website usable. */ }
  } else {
    initMixpanel();
  }
}

export function initializeGoogleTag() {
  if (!isAnalyticsAllowed() || gaInitialized || isCrawler()) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer?.push(arguments); };
  if (!gaJsInitialized) {
    window.gtag('js', new Date());
    gaJsInitialized = true;
  }
  window.gtag('config', GA_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  gaInitialized = true;
}

export function revokeAnalytics() {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  gaInitialized = false;
  if (mixpanelInitialized) {
    try { mixpanel.opt_out_tracking({ delete_user: false }); } catch { /* Continue clearing local identifiers. */ }
  }
  // GA4's default browser identifiers are first-party cookies. Clear host and parent-domain copies.
  const gaCookieNames = document.cookie.split(';').map(part => part.trim().split('=')[0]).filter(name => name === '_ga' || name === `_ga_${GA_MEASUREMENT_ID.slice(2)}`);
  const hostname = window.location.hostname;
  const domains = ['', hostname, `.${hostname}`];
  const parts = hostname.split('.');
  for (let index = 1; index < parts.length - 1; index++) domains.push(`.${parts.slice(index).join('.')}`);
  for (const name of gaCookieNames) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
    }
  }
}

function sendGaEvent(event: string, properties: Record<string, unknown>) {
  if (!isAnalyticsAllowed() || window[`ga-disable-${GA_MEASUREMENT_ID}`]) return;
  if (!gaInitialized) initializeGoogleTag();
  try { window.gtag?.('event', event, { ...properties, send_to: GA_MEASUREMENT_ID }); } catch { /* Keep navigation working. */ }
}

export function trackWebsite(event: WebsiteEvent, properties: Record<string, unknown> = {}) {
  if (!isAnalyticsAllowed()) return;
  if (initMixpanel()) {
    try { mixpanel.track(event, { product_surface: 'website', environment: 'production', ...properties }); } catch { /* Keep navigation working. */ }
  }
  sendGaEvent(event === 'web_language_changed' ? 'language_changed' : event, properties);
}

export function trackWebsiteInstallClick(location: string, buttonText: string) {
  if (!isAnalyticsAllowed()) return;
  const properties = {
    product_surface: 'website',
    environment: 'production',
    location,
    page_path: window.location.pathname,
    language: document.documentElement.lang || 'en',
    button_text: buttonText,
  };
  if (initMixpanel()) {
    try { mixpanel.track('web_extension_install_clicked', properties, { transport: 'sendBeacon', send_immediately: true }); } catch { /* Keep the store link working. */ }
  }
  sendGaEvent('web_extension_install_clicked', properties);
}

export function trackWebsitePageView(pathname: string, locale: string) {
  if (!isAnalyticsAllowed()) return;
  // Google Tag handles page_view on load and browser history changes; never send one here.
  if (initMixpanel()) {
    try { mixpanel.track_pageview({ page_path: pathname, locale }); } catch { /* Keep rendering. */ }
  }
  if (pathname.replace(/\/$/, '').endsWith('/pricing')) {
    trackWebsite('pricing_page_view', { page_path: pathname, locale });
  }
}
