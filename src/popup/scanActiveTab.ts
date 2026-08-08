import type { ScanResponse } from '../types/seo';

const SCAN_MESSAGE = { type: 'SCAN_PAGE' } as const;

function isScannableUrl(url?: string): boolean {
  if (!url) return false;

  try {
    const protocol = new URL(url).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export async function scanActiveTab(tab: chrome.tabs.Tab): Promise<ScanResponse> {
  if (!tab.id || !isScannableUrl(tab.url)) throw new Error('unscannable-tab');

  try {
    return await chrome.tabs.sendMessage(tab.id, SCAN_MESSAGE) as ScanResponse;
  } catch {
    // Tabs that were already open when the extension was installed or reloaded do
    // not have the declarative content script yet. Inject it once and retry.
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    return await chrome.tabs.sendMessage(tab.id, SCAN_MESSAGE) as ScanResponse;
  }
}
