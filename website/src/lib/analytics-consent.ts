'use client';

export type AnalyticsConsent = 'unset' | 'accepted' | 'rejected';

const STORAGE_KEY = 'seo_copilot_analytics_consent';
let currentConsent: AnalyticsConsent = 'unset';

export function getAnalyticsConsent(): AnalyticsConsent { return currentConsent; }

export function restoreAnalyticsConsent(): AnalyticsConsent {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    currentConsent = saved === 'accepted' || saved === 'rejected' ? saved : 'unset';
  } catch {
    currentConsent = 'unset';
  }
  return currentConsent;
}

export function saveAnalyticsConsent(choice: Exclude<AnalyticsConsent, 'unset'>): void {
  currentConsent = choice;
  try { window.localStorage.setItem(STORAGE_KEY, choice); } catch { /* Keep the website usable. */ }
}

export function isAnalyticsAllowed(): boolean { return currentConsent === 'accepted'; }
