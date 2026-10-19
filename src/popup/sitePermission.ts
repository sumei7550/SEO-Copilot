export function permissionPattern(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    if (parsed.hostname === 'chromewebstore.google.com' || (parsed.hostname === 'chrome.google.com' && parsed.pathname.startsWith('/webstore'))) return undefined;
    return `${parsed.protocol}//${parsed.hostname}/*`;
  } catch {
    return undefined;
  }
}

export async function hasSiteAccess(pattern: string): Promise<boolean> {
  return chrome.permissions.contains({ origins: [pattern] });
}

// Call directly from the Scan button handler: Chrome requires user activation.
export async function requestSiteAccess(pattern: string): Promise<void> {
  const granted = await chrome.permissions.request({ origins: [pattern] });
  if (!granted) throw new Error('site-permission-denied');
}
