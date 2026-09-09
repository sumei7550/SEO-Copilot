'use client';

import mixpanel from 'mixpanel-browser';

export type WebsiteEvent = 'web_extension_install_clicked' | 'web_navigation_clicked' | 'web_language_changed' | 'web_support_clicked';

let initialized = false;
function initAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (initialized || process.env.NODE_ENV !== 'production' || !token) return false;
  mixpanel.init(token, { autocapture: false, track_pageview: false, persistence: 'localStorage' });
  initialized = true;
  return true;
}

export function trackWebsite(event: WebsiteEvent, properties: Record<string, unknown> = {}) {
  if (!initAnalytics()) return;
  mixpanel.track(event, { product_surface: 'website', environment: process.env.NODE_ENV === 'production' ? 'production' : 'development', ...properties });
}

export function trackWebsitePageView(pathname: string, locale: string) {
  if (!initAnalytics()) return;
  mixpanel.track_pageview({ page_path: pathname, locale });
}
