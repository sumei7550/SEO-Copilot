import mixpanel from 'mixpanel-browser';

export type ExtensionEvent = 'ext_opened' | 'ext_scan_consent_viewed' | 'ext_scan_started' | 'ext_scan_completed' | 'ext_scan_failed' | 'ext_report_viewed' | 'ext_issue_expanded' | 'ext_ai_fix_requested' | 'ext_ai_fix_succeeded' | 'ext_ai_fix_failed' | 'ext_recommendation_selected' | 'ext_recommendation_copied' | 'ext_rescan_started' | 'ext_rescan_completed';

let initialized = false;
function initAnalytics() {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  if (initialized || !import.meta.env.PROD || !token) return false;
  mixpanel.init(token, { autocapture: false, track_pageview: false, persistence: 'localStorage' });
  initialized = true;
  return true;
}

export function trackExtension(event: ExtensionEvent, properties: Record<string, unknown> = {}) {
  if (!initAnalytics()) return;
  mixpanel.track(event, { product_surface: 'extension', environment: 'production', extension_version: chrome.runtime.getManifest().version, ...properties });
}
