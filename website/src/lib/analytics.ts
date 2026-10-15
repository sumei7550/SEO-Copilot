'use client';

import mixpanel from 'mixpanel-browser';

export type WebsiteEvent = 'web_extension_install_clicked' | 'web_navigation_clicked' | 'web_language_changed' | 'web_support_clicked';

let initialized = false;
function isCrawler() {
  if (typeof navigator === 'undefined') return true;
  return /bot|crawler|spider|slurp|Google-InspectionTool|Lighthouse/i.test(navigator.userAgent);
}

function initAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (initialized || isCrawler() || process.env.NODE_ENV !== 'production' || !token) return false;
  try {
    mixpanel.init(token, { autocapture: false, track_pageview: false, persistence: 'localStorage' });
  } catch {
    return false;
  }
  initialized = true;
  return true;
}

export function trackWebsite(event: WebsiteEvent, properties: Record<string, unknown> = {}) {
  if (!initAnalytics()) return;
  try {
    mixpanel.track(event, { product_surface: 'website', environment: process.env.NODE_ENV === 'production' ? 'production' : 'development', ...properties });
  } catch {
    // Analytics must never affect navigation or page rendering.
  }
}

export function trackWebsitePageView(pathname: string, locale: string) {
  if (!initAnalytics()) return;
  try {
    mixpanel.track_pageview({ page_path: pathname, locale });
  } catch {
    // Analytics must never affect navigation or page rendering.
  }
}
