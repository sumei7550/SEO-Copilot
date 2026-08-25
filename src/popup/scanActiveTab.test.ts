import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScanResponse } from '../types/seo';
import { scanActiveTab } from './scanActiveTab';

const response: ScanResponse = {
  ok: true,
  result: {
    page: {
      url: 'https://aipassport.org/',
      title: 'AI Passport',
      titleTagCount: 1,
      metaDescription: '',
      headings: [{ level: 1, text: 'AI Passport' }],
      images: [],
      canonical: '',
      schemas: [],
      invalidSchemaCount: 0,
      wordCount: 100,
      textRatio: 0.2
    },
    metrics: { h1Count: 1, h2Count: 0, h3Count: 0, imageCount: 0, auditableImageCount: 0, imagesWithoutAlt: 0, altCoverage: 100, schemaTypes: [], wordCount: 100, textRatio: 0.2 },
    issues: [],
    score: 100,
    grade: 'excellent',
    categoryScores: { title: 15, meta: 15, heading: 15, images: 15, content: 15, technical: 25 },
    categoryWeights: { title: 15, meta: 15, heading: 15, images: 15, content: 15, technical: 25 },
    scannedAt: 1
  }
};

afterEach(() => vi.unstubAllGlobals());

describe('scanActiveTab', () => {
  it('uses the existing content script when it is available', async () => {
    const sendMessage = vi.fn().mockResolvedValue(response);
    const executeScript = vi.fn();
    vi.stubGlobal('chrome', { tabs: { sendMessage }, scripting: { executeScript } });

    await expect(scanActiveTab({ id: 7, url: 'https://aipassport.org/' } as chrome.tabs.Tab)).resolves.toBe(response);
    expect(executeScript).not.toHaveBeenCalled();
  });

  it('injects the content script and retries for a pre-existing tab', async () => {
    const sendMessage = vi.fn()
      .mockRejectedValueOnce(new Error('Receiving end does not exist'))
      .mockResolvedValueOnce(response);
    const executeScript = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('chrome', { tabs: { sendMessage }, scripting: { executeScript } });

    await expect(scanActiveTab({ id: 9, url: 'https://aipassport.org/' } as chrome.tabs.Tab)).resolves.toBe(response);
    expect(executeScript).toHaveBeenCalledWith({ target: { tabId: 9 }, files: ['content.js'] });
    expect(sendMessage).toHaveBeenCalledTimes(2);
  });

  it('rejects browser-internal pages without trying to inject', async () => {
    const executeScript = vi.fn();
    vi.stubGlobal('chrome', { tabs: { sendMessage: vi.fn() }, scripting: { executeScript } });

    await expect(scanActiveTab({ id: 3, url: 'chrome://extensions/' } as chrome.tabs.Tab)).rejects.toThrow('unscannable-tab');
    expect(executeScript).not.toHaveBeenCalled();
  });
});
