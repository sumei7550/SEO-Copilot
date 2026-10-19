import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasSiteAccess, permissionPattern, requestSiteAccess } from './sitePermission';

afterEach(() => vi.unstubAllGlobals());

describe('site permission', () => {
  it('builds a per-origin pattern and rejects browser pages', () => {
    expect(permissionPattern('https://example.com:443/article')).toBe('https://example.com/*');
    expect(permissionPattern('http://example.com/article')).toBe('http://example.com/*');
    expect(permissionPattern('chrome://extensions/')).toBeUndefined();
    expect(permissionPattern('https://chromewebstore.google.com/detail/example')).toBeUndefined();
  });

  it('requests the site directly and continues on grant', async () => {
    const request = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('chrome', { permissions: { request } });
    await expect(requestSiteAccess('https://example.com/*')).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith({ origins: ['https://example.com/*'] });
  });

  it('recognizes existing permission without requesting it again', async () => {
    const contains = vi.fn().mockResolvedValue(true);
    const request = vi.fn();
    vi.stubGlobal('chrome', { permissions: { contains, request } });
    expect(await hasSiteAccess('https://example.com/*')).toBe(true);
    expect(contains).toHaveBeenCalledWith({ origins: ['https://example.com/*'] });
    expect(request).not.toHaveBeenCalled();
  });

  it('fails immediately on denial', async () => {
    const request = vi.fn().mockResolvedValue(false);
    vi.stubGlobal('chrome', { permissions: { request } });
    await expect(requestSiteAccess('https://example.com/*')).rejects.toThrow('site-permission-denied');
    expect(request).toHaveBeenCalledOnce();
  });
});
