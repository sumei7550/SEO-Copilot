// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractPageMetadata, MetadataReadError, readActiveTabMetadata } from './quickMetadata';

afterEach(() => {
  vi.unstubAllGlobals();
  document.head.innerHTML = '';
});

describe('Quick Metadata reader', () => {
  it('uses the same trimmed document values as the full scanner', () => {
    document.title = '  A complete title  ';
    document.head.insertAdjacentHTML('beforeend', '<meta name="DESCRIPTION" content="  First description  "><meta name="description" content="Second description">');

    expect(extractPageMetadata()).toEqual({
      title: 'A complete title',
      metaDescription: 'First description',
      url: window.location.href
    });
  });

  it('preserves empty fields as empty strings and counts can use JavaScript length', () => {
    document.title = '';
    const data = extractPageMetadata();
    expect(data.title).toBe('');
    expect(data.metaDescription).toBe('');
    expect('中文🙂'.length).toBe(4);
  });

  it('injects only a lightweight function and never sends SCAN_PAGE', async () => {
    const sendMessage = vi.fn();
    const executeScript = vi.fn().mockResolvedValue([{ frameId: 0, result: { title: 'Title', metaDescription: 'Description', url: 'https://example.com/' } }]);
    vi.stubGlobal('chrome', { scripting: { executeScript }, tabs: { sendMessage } });

    await expect(readActiveTabMetadata({ id: 4, url: 'https://example.com/' } as chrome.tabs.Tab)).resolves.toEqual({ title: 'Title', metaDescription: 'Description', url: 'https://example.com/' });
    expect(executeScript).toHaveBeenCalledWith({ target: { tabId: 4 }, func: extractPageMetadata });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('does not inject into restricted pages', async () => {
    const executeScript = vi.fn();
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    for (const url of ['chrome://extensions/', 'https://chromewebstore.google.com/detail/example']) {
      await expect(readActiveTabMetadata({ id: 4, url } as chrome.tabs.Tab)).rejects.toMatchObject({ kind: 'restricted' });
    }
    expect(executeScript).not.toHaveBeenCalled();
  });

  it('separates access errors from unexpected failures', async () => {
    const executeScript = vi.fn().mockRejectedValueOnce(new Error('Cannot access contents of url'))
      .mockRejectedValueOnce(new Error('Renderer process failed'));
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    const tab = { id: 4, url: 'https://example.com/' } as chrome.tabs.Tab;

    await expect(readActiveTabMetadata(tab)).rejects.toMatchObject({ kind: 'access-needed' });
    await expect(readActiveTabMetadata(tab)).rejects.toMatchObject({ kind: 'read-failed' });
    expect(new MetadataReadError('read-failed').message).toBe('read-failed');
  });
});
