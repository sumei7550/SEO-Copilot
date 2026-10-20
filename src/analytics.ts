import mixpanel from 'mixpanel-browser';

export type ExtensionEvent = 'ext_onboarding_viewed' | 'ext_sidepanel_opened' | 'ext_scan_started' | 'ext_scan_completed' | 'ext_scan_failed' | 'ext_unsupported_page' | 'ext_report_viewed' | 'ext_issue_expanded' | 'ext_ai_fix_requested' | 'ext_ai_fix_succeeded' | 'ext_ai_fix_failed' | 'ext_recommendation_selected' | 'ext_recommendation_copied';

let initialized = false;
function initAnalytics() {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  if (!import.meta.env.PROD || !token) return false;
  if (initialized) return true;
  // Send scan events immediately so navigation or closing the panel does not
  // leave them queued in the SDK's default batch window.
  mixpanel.init(token, { autocapture: false, track_pageview: false, persistence: 'localStorage', batch_requests: false });
  initialized = true;
  return true;
}

export function trackExtension(event: ExtensionEvent, properties: Record<string, unknown> = {}) {
  if (!initAnalytics()) return;
  const payload = { product_surface: 'extension', environment: 'production', extension_version: chrome.runtime.getManifest().version, ...properties };
  mixpanel.track(event, payload, { send_immediately: true });
}
