// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { previewResult } from './previewResult';
import { PopupToolViews, type PopupTool } from './PopupToolViews';
import type { SeoResult } from '../types/seo';

let container: HTMLDivElement;
let root: Root;
let result: SeoResult;
let writeText: ReturnType<typeof vi.fn>;
const metadata = { status: 'ready' as const, url: 'https://example.com/', generation: 1, data: { title: 'Example page', metaDescription: 'Example description', url: 'https://example.com/' } };

async function show(tool: PopupTool) {
  await act(async () => root.render(<PopupToolViews tool={tool} metadata={metadata} scan={{ status: 'ready', result }} scanGeneration={1} onRetry={() => {}} onRequestAccess={async () => {}} />));
}
async function click(label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.trim() === label);
  expect(button, label).toBeDefined();
  await act(async () => button!.click());
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  result = structuredClone(previewResult);
  result.page.url = metadata.url;
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe('Popup Page Inspector tools', () => {
  it('shows refresh progress beside the filters without changing the Status button label', async () => {
    result.page.images = [{ src: 'https://example.com/image.png', alt: 'Photo', auditable: true, naturalWidth: 100, naturalHeight: 100, transferSize: 0 }];
    let finishCheck!: (value: Array<{ result: Array<{ code: number }> }>) => void;
    const executeScript = vi.fn(() => new Promise<Array<{ result: Array<{ code: number }> }>>((resolve) => { finishCheck = resolve; }));
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      await act(async () => { container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click(); await Promise.resolve(); });
      expect(container.querySelector('.inspector-image-toolbar .inspector-image-progress-count')?.textContent).toBe('0 of 1');
      expect(container.querySelector<HTMLButtonElement>('.inspector-refresh-button')?.textContent).toBe('Status');
      expect(container.querySelector('.inspector-image-progress-track')).toBeNull();
      await act(async () => { finishCheck([{ result: [{ code: 200 }] }]); await Promise.resolve(); });
      expect(container.querySelector('.inspector-image-progress-count')).toBeNull();
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('200');
    } finally { vi.unstubAllGlobals(); }
  });

  it('only loads nearby thumbnails across repeated Popup mounts and disconnects observers', async () => {
    const callbacks: IntersectionObserverCallback[] = [];
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { callbacks.push(callback); }
      observe() {}
      disconnect = disconnect;
    });
    result.page.images = Array.from({ length: 164 }, (_, index) => ({ src: `https://example.com/${index}.png`, alt: 'Photo', auditable: true, naturalWidth: 2500, naturalHeight: 2500, transferSize: 0 }));
    try {
      for (let cycle = 0; cycle < 3; cycle++) {
        callbacks.length = 0;
        await show('images');
        expect(container.querySelectorAll('.inspector-image-thumb img')).toHaveLength(0);
        await act(async () => callbacks[0]([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
        expect(container.querySelectorAll('.inspector-image-thumb img')).toHaveLength(1);
        await act(async () => callbacks[0]([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
        expect(container.querySelectorAll('.inspector-image-thumb img')).toHaveLength(0);
        await act(async () => root.unmount());
        root = createRoot(container);
      }
      expect(disconnect).toHaveBeenCalledTimes(164 * 3);
    } finally { vi.unstubAllGlobals(); }
  });

  it('deduplicates status checks and prevents a second refresh from starting during the first', async () => {
    result.page.images = Array.from({ length: 8 }, (_, index) => ({ src: `https://example.com/${index % 2}.svg`, alt: 'Logo', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 0 }));
    const executeScript = vi.fn().mockResolvedValue([{ result: [{ code: 200, fileSize: 898 }, { code: 200, fileSize: 898 }] }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      await act(async () => {
        const refresh = container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!;
        refresh.click(); refresh.click();
      });
      expect(executeScript).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('.inspector-image-status.ok')).toHaveLength(8);
      expect(container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')?.disabled).toBe(false);
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(executeScript).toHaveBeenCalledTimes(2);
      expect(container.querySelectorAll('.inspector-image-status.ok')).toHaveLength(8);
    } finally { vi.unstubAllGlobals(); }
  });

  it('rechecks on manual Refresh and replaces a cached 200 with a newly returned 404', async () => {
    result.page.images = [{ src: 'https://example.com/image.svg', alt: 'Icon', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 0 }];
    const executeScript = vi.fn()
      .mockResolvedValueOnce([{ result: [{ code: 200 }] }])
      .mockResolvedValueOnce([{ result: [{ code: 404 }] }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('200');
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(executeScript).toHaveBeenCalledTimes(2);
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('404');
      expect(container.querySelector('.inspector-image-status.broken')).not.toBeNull();
      expect(container.querySelector('.inspector-image-status-source')?.textContent).toBe('Just checked');
      expect(container.querySelector('.inspector-image-status-source')?.getAttribute('translate')).toBe('no');
      expect(container.querySelector('.inspector-image-status-source')?.getAttribute('title')).toContain('Checked at');
    } finally { vi.unstubAllGlobals(); }
  });

  it('keeps the last successful status visible when a forced refresh receives 429', async () => {
    result.page.images = [{ src: 'https://example.com/image.svg', alt: 'Icon', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 0 }];
    const executeScript = vi.fn()
      .mockResolvedValueOnce([{ result: [{ code: 200 }] }])
      .mockResolvedValueOnce([{ result: [{ code: 429, receivedAt: Date.now() }] }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      const refresh = () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click();
      await act(async () => refresh());
      await act(async () => refresh());
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('200');
      expect(container.querySelector('.inspector-image-status-source')?.textContent).toBe('Previous result');
      expect(container.querySelector('.inspector-image-cooldown')?.textContent).toContain('example.com');
    } finally { vi.unstubAllGlobals(); }
  });

  it('checks a large page in bounded batches on two consecutive refreshes', async () => {
    result.page.images = Array.from({ length: 164 }, (_, index) => ({ src: `https://example.com/${index}.svg`, alt: 'Logo', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 0 }));
    const executeScript = vi.fn(async ({ args }: { args: string[][] }) => [{ result: args[0].map(() => ({ code: 200 })) }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      for (let cycle = 0; cycle < 2; cycle++) {
        await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
        expect(container.querySelectorAll('.inspector-image-status.ok')).toHaveLength(164);
        expect(container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')?.disabled).toBe(false);
      }
      expect(executeScript).toHaveBeenCalledTimes(56);
      expect(executeScript.mock.calls.every(([call]) => call.args[0].length <= 6)).toBe(true);
    } finally { vi.unstubAllGlobals(); }
  });

  it('stops injecting after script access fails', async () => {
    result.page.images = Array.from({ length: 30 }, (_, index) => ({ src: `https://example.com/${index}.svg`, alt: 'Logo', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 0 }));
    const executeScript = vi.fn().mockRejectedValue(new Error('Page access revoked'));
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(executeScript).toHaveBeenCalledTimes(1);
      expect(container.querySelectorAll('.inspector-image-status.unchecked')).toHaveLength(30);
      expect(container.querySelector('.inspector-image-status-note')?.textContent).toContain('no HTTP status was verified for 30 images');
      expect(container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')?.disabled).toBe(false);
    } finally { vi.unstubAllGlobals(); }
  });

  it('limits parallel requests to two and stops queued same-host requests after 429', async () => {
    result.page.images = Array.from({ length: 1000 }, (_, index) => ({ src: `https://example.com/${index}.svg`, alt: null, auditable: false, naturalWidth: 1, naturalHeight: 1, transferSize: 0 }));
    const executeScript = vi.fn().mockResolvedValue([{ result: [{ code: 429 }, { code: 200 }, {}, {}, {}, {}] }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(executeScript).toHaveBeenCalledTimes(1);
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('—');
      expect(container.querySelectorAll('.inspector-image-status.broken')).toHaveLength(0);
      expect(container.querySelector('.inspector-image-cooldown')?.textContent).toContain('example.com');
      expect(container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')?.disabled).toBe(false);
    } finally { vi.unstubAllGlobals(); }
  });

  it('presents empty alt with an info icon and the correct filter count', async () => {
    result.page.images = Array.from({ length: 5 }, (_, index) => ({ src: `https://example.com/${index}.svg`, alt: '', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 0 }));
    await show('images');
    const emptyFilter = Array.from(container.querySelectorAll('.inspector-image-filter-menu button')).find((button) => button.textContent?.includes('Empty'));
    expect(emptyFilter?.querySelector('small')?.textContent).toBe('5');
    expect(container.querySelectorAll('.inspector-image-warning')).toHaveLength(5);
    expect(container.querySelector('.inspector-image-info')).toBeNull();
    expect(container.querySelector('.inspector-image-warning svg')).not.toBeNull();
    expect(container.querySelector('.inspector-image-alt')?.textContent).toContain('Empty alt text');
  });

  it('does not mark excluded tracking images as missing-alt audit warnings or load their thumbnails', async () => {
    result.page.images = [];
    result.page.excludedImageCount = 1;
    await show('images');
    expect(container.textContent).toContain('No reportable images');
    expect(container.textContent).toContain('Images without a usable HTTP(S) source and known tracking-sized images');
    expect(container.querySelector('.inspector-image-entry')).toBeNull();
    expect(container.querySelector('.inspector-image-warning')).toBeNull();
    expect(container.querySelector('.inspector-image-thumb img')).toBeNull();
  });

  it('restores checked image statuses and file sizes after closing and reopening the Popup', async () => {
    result.page.images = [{ src: 'https://example.com/image.svg', alt: 'Icon', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 300 }];
    let stored = structuredClone(result);
    const executeScript = vi.fn().mockResolvedValue([{ result: [{ code: 200, fileSize: 898 }] }]);
    const sendMessage = vi.fn(async (message) => {
      if (message.type === 'IMAGE_REFRESH_RUN_START') return { ok: true, generation: 7, runId: 1 };
      if (message.type === 'IMAGE_STATUS_STATE_GET') return { ok: true, cache: {}, cooldowns: {} };
      if (message.type === 'IMAGE_STATUS_STATE_PUT') {
        expect(message.generation).toBe(7);
        expect(message.scannedAt).toBe(result.scannedAt);
        stored = { ...stored, imageStatuses: message.imageStatuses };
      }
      return { ok: true, generation: 7, result: stored };
    });
    vi.stubGlobal('chrome', { runtime: { sendMessage }, scripting: { executeScript } });
    const open = async (tool: PopupTool = 'images') => {
      await act(async () => root.render(<PopupToolViews tool={tool} metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
    };
    try {
      await open();
      expect(container.querySelectorAll('details.inspector-image-filter')).toHaveLength(1);
      expect(container.querySelector<HTMLButtonElement>('.inspector-refresh-button')?.textContent).toContain('Status');
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(container.querySelectorAll('details.inspector-image-filter')).toHaveLength(2);
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('200');
      await act(async () => root.unmount());
      root = createRoot(container);
      await open();
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('200');
      expect(container.querySelectorAll('details.inspector-image-filter')).toHaveLength(2);
      expect(container.querySelector('.inspector-image-size')?.textContent).toBe('150 × 150px 898.00 B');
      await open('content');
      await open();
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('200');
      expect(executeScript).toHaveBeenCalledTimes(1);
      stored = { ...result, scannedAt: result.scannedAt + 1 };
      result = structuredClone(stored);
      await open();
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('—');
    } finally { vi.unstubAllGlobals(); }
  });

  it.each([
    { ranged: false, length: '898', expected: '150 × 150px 898.00 B' },
    { ranged: true, length: '1', expected: '150 × 150px 4.76 KB' },
    { ranged: false, length: null, expected: '150 × 150px' },
  ])('uses verified response length on image status refresh ($ranged, $length)', async ({ ranged, length, expected }) => {
    const fetchMock = vi.fn().mockImplementation(async (_url: string, options: RequestInit) => {
      if (ranged && options.method === 'HEAD') return { status: 405, ok: false, headers: new Headers() };
      const headers = new Headers();
      if (length !== null) headers.set('content-length', length);
      if (ranged) headers.set('content-range', 'bytes 0-0/4874');
      return { status: ranged ? 206 : 200, ok: true, headers, body: { cancel: vi.fn() } };
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('chrome', { scripting: { executeScript: vi.fn(async ({ func, args }: { func: (urls: string[]) => Promise<unknown>; args: string[][] }) => [{ result: await func(args[0]) }]) } });
    try {
      result.page.images = [{ src: 'https://example.com/image.svg', alt: 'Icon', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 300 }];
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={1} onRetry={() => {}} onRequestAccess={async () => {}} />));
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(container.querySelector('.inspector-image-size')?.textContent).toBe(expected);
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe(ranged ? '206' : '200');
      expect(fetchMock).toHaveBeenCalledTimes(ranged ? 2 : 1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('displays actual image body bytes with B or KB and a space after dimensions', async () => {
    result.page.images = [
      { src: 'https://example.com/icon.svg', alt: 'Icon', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 300, fileSize: 898 },
      { src: 'https://example.com/logo.svg', alt: 'Logo', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 300, fileSize: 4874 },
      { src: 'https://example.com/unknown.svg', alt: 'Unknown size', auditable: true, naturalWidth: 150, naturalHeight: 150, transferSize: 300 },
    ];
    await show('images');
    expect(Array.from(container.querySelectorAll('.inspector-image-size'), (item) => item.textContent)).toEqual([
      '150 × 150px 898.00 B', '150 × 150px 4.76 KB', '150 × 150px',
    ]);
  });

  it('shows selected image filters and keeps the visible list in sync', async () => {
    result.page.images = [
      { src: 'https://example.com/empty.png', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
      { src: 'https://example.com/photo.png', alt: 'Product photo', auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
    ];
    await show('images');
    expect(container.querySelectorAll('details.inspector-image-filter')).toHaveLength(1);
    expect(container.querySelector<HTMLButtonElement>('.inspector-refresh-button.is-initial')?.textContent).toContain('Status');
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
    const menus = container.querySelectorAll('details.inspector-image-filter');
    expect(menus).toHaveLength(2);
    expect(container.querySelector('.inspector-refresh-button.is-initial')).toBeNull();
    expect(menus[0].querySelector('summary')?.textContent).toBe('Alt text');
    expect(menus[1].querySelector('summary')?.textContent).toBe('Status');
    menus[0].setAttribute('open', '');
    await act(async () => container.querySelector('.inspector-image-table-head')!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(menus[0].hasAttribute('open')).toBe(false);
    menus[0].setAttribute('open', '');
    await act(async () => menus[1].querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(menus[0].hasAttribute('open')).toBe(false);
    expect(container.querySelectorAll('.inspector-image-entry')).toHaveLength(2);
    expect(Array.from(menus[0].querySelectorAll('button > span'), (item) => item.textContent)).toEqual(['Not empty', 'Empty']);
    expect(Array.from(menus[1].querySelectorAll('button > span'), (item) => item.textContent)).not.toContain('All');
    const choose = async (menu: Element, value: string) => {
      menu.setAttribute('open', '');
      const option = Array.from(menu.querySelectorAll('button')).find((button) => button.querySelector('span')?.textContent === value)!;
      await act(async () => option.click());
      expect(menu.hasAttribute('open')).toBe(false);
      expect(option.getAttribute('aria-checked')).toBe('true');
    };
    await choose(menus[0], 'Empty');
    expect(menus[0].querySelector('summary')?.textContent).toBe('Alt text: Empty');
    expect(container.querySelectorAll('.inspector-image-entry')).toHaveLength(1);
    expect(container.querySelector('.inspector-image-url a')?.getAttribute('href')).toBe('https://example.com/empty.png');
    await choose(menus[0], 'Not empty');
    expect(menus[0].querySelector('summary')?.textContent).toBe('Alt text: Not empty');
    expect(container.querySelector('.inspector-image-url a')?.getAttribute('href')).toBe('https://example.com/photo.png');
    await choose(menus[1], 'Not checked');
    expect(menus[1].querySelector('summary')?.textContent).toBe('Status: Not checked');
    expect(container.querySelectorAll('.inspector-image-entry')).toHaveLength(1);
    await choose(menus[1], 'Broken');
    expect(container.querySelectorAll('.inspector-image-entry')).toHaveLength(0);
    menus[1].setAttribute('open', '');
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Clear Status filter"]')!.click());
    expect(menus[1].hasAttribute('open')).toBe(false);
    expect(menus[1].querySelector('summary')?.textContent).toBe('Status');
    expect(menus[0].querySelector('summary')?.textContent).toBe('Alt text: Not empty');
    expect(container.querySelectorAll('.inspector-image-entry')).toHaveLength(1);
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Clear Alt text filter"]')!.click());
    expect(menus[0].querySelector('summary')?.textContent).toBe('Alt text');
    expect(container.querySelectorAll('.inspector-image-entry')).toHaveLength(2);
    expect(container.querySelector('.inspector-filter-clear')).toBeNull();
  });

  it('groups missing and empty alt with matching visuals and hover guidance', async () => {
    result.page.images = [
      { src: 'https://example.com/missing.png', alt: null, auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
      { src: 'https://example.com/empty.png', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
      { src: 'https://example.com/good.png', alt: 'Product', auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
    ];
    result.issues = [
      { id: 'IMAGE_001', category: 'images', severity: 'warning', messageKey: 'issueImageAlt', impactKey: 'impactImages', solutionKey: 'fixImageAlt', impact: -5 },
      { id: 'IMAGE_004', category: 'images', severity: 'info', messageKey: 'issueImageEmptyAlt', impactKey: 'impactImageEmptyAlt', solutionKey: 'fixImageEmptyAlt', impact: 0 }
    ];
    const openAudit = vi.fn();
    await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} scanGeneration={1} onRetry={() => {}} onRequestAccess={async () => {}} onOpenImageAudit={openAudit} />));
    const empty = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-image-filter-menu button')).find((item) => item.textContent?.includes('Empty'))!;
    await act(async () => empty.click());
    expect(container.querySelectorAll('.inspector-image-entry')).toHaveLength(2);
    expect(container.textContent).toContain('Missing alt text');
    expect(container.textContent).toContain('Empty alt text');
    expect(container.querySelectorAll('.inspector-image-alt.is-empty-alt')).toHaveLength(2);
    expect(container.querySelectorAll('.inspector-image-warning')).toHaveLength(2);
    expect(container.querySelectorAll('.inspector-image-help-trigger[title]')).toHaveLength(0);
    const triggers = container.querySelectorAll<HTMLButtonElement>('.inspector-image-help-trigger');
    await act(async () => container.querySelector('.inspector-image-entry')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(document.getElementById('inspector-image-help-tooltip')).toBeNull();
    await act(async () => triggers[0].dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(document.getElementById('inspector-image-help-tooltip')?.parentElement).toBe(document.body);
    expect(triggers[0].getAttribute('aria-describedby')).toBe('inspector-image-help-description');
    expect(document.getElementById('inspector-image-help-tooltip')?.textContent).toContain('SEO Audit');
    expect(document.getElementById('inspector-image-help-tooltip')?.textContent).toContain('recommended action for its alt text');
    expect(document.getElementById('inspector-image-help-tooltip')?.textContent).toContain('View issue');
    expect(document.getElementById('inspector-image-help-tooltip')?.textContent).not.toContain('no alt attribute');
    expect(container.querySelector('.inspector-image-help-tooltip')).toBeNull();
    await act(async () => triggers[0].dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
    expect(document.getElementById('inspector-image-help-tooltip')).not.toBeNull();
    const tooltip = document.getElementById('inspector-image-help-tooltip')!;
    await act(async () => tooltip.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    await act(async () => tooltip.querySelector<HTMLButtonElement>('.inspector-image-help-audit')!.click());
    expect(openAudit).toHaveBeenCalledWith(['IMAGE_001']);
    await act(async () => tooltip.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
    expect(document.getElementById('inspector-image-help-tooltip')).toBeNull();
    expect(triggers[0].hasAttribute('aria-describedby')).toBe(false);
    await act(async () => triggers[1].focus());
    expect(document.getElementById('inspector-image-help-tooltip')?.textContent).toContain('recommended action for its alt text');
    expect(document.getElementById('inspector-image-help-tooltip')?.textContent).not.toContain('empty alt attribute');
    await act(async () => triggers[1].blur());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 170)); });
    expect(document.getElementById('inspector-image-help-tooltip')).toBeNull();
    await act(async () => triggers[0].click());
    expect(openAudit).toHaveBeenCalledTimes(2);
    expect(openAudit).toHaveBeenLastCalledWith(['IMAGE_001']);
    await act(async () => triggers[1].click());
    expect(openAudit).toHaveBeenCalledTimes(3);
  });

  it('does not expose View issue for image data that has no matching Audit Issue', async () => {
    result.page.images = [
      { src: 'https://example.com/missing.png', alt: null, auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
      { src: 'https://example.com/empty.png', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
    ];
    result.issues = [];
    await show('images');
    expect(container.querySelectorAll('.inspector-image-help-trigger')).toHaveLength(0);
  });

  it('maps a popup Description prompt only to the real META_001 issue', async () => {
    result.page.metaDescription = '';
    result.issues = [{ id: 'META_001', category: 'meta', severity: 'critical', messageKey: 'issueMetaMissing', impactKey: 'impactMeta', solutionKey: 'fixMetaMissing', impact: -10 }];
    const openAudit = vi.fn();
    await act(async () => root.render(<PopupToolViews tool="content" metadata={{ ...metadata, data: { ...metadata.data, metaDescription: '' } }} scan={{ status: 'ready', result }} scanGeneration={1} onRetry={() => {}} onRequestAccess={async () => {}} onOpenContentAudit={openAudit} />));
    const entry = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === 'View issue →');
    expect(entry).toBeDefined();
    await act(async () => entry!.click());
    expect(openAudit).toHaveBeenCalledWith(['META_001']);
  });

  it('checks only images visible under the active Alt filter', async () => {
    result.page.images = [
      { src: 'https://example.com/missing.png', alt: null, auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
      { src: 'https://example.com/good.png', alt: 'Product', auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 },
    ];
    const executeScript = vi.fn(async ({ args }: { args: string[][] }) => [{ result: args[0].map(() => ({ code: 200 })) }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="images" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      const empty = Array.from(container.querySelectorAll<HTMLButtonElement>('.inspector-image-filter-menu button')).find((item) => item.textContent?.includes('Empty'))!;
      await act(async () => empty.click());
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Refresh image statuses"]')!.click());
      expect(executeScript).toHaveBeenCalledOnce();
      expect(executeScript.mock.calls[0][0].args[0]).toEqual(['https://example.com/missing.png']);
      expect(container.querySelector('.inspector-image-status')?.textContent).toBe('200');
    } finally { vi.unstubAllGlobals(); }
  });

  it('keeps Metadata, shows eight headings and copies all headings in page order as TSV', async () => {
    result.page.headings = [
      { level: 1, text: 'Main' }, { level: 3, text: 'Early detail' },
      ...Array.from({ length: 7 }, (_, index) => ({ level: 2 as const, text: `Section ${index + 1}` }))
    ];
    await show('content');
    expect(container.textContent).toContain('Example page');
    expect(container.querySelector('.metadata-heading h2')?.textContent).toBe('Meta');
    expect(container.querySelector('.metadata-field-metaDescription .metadata-field-label')?.textContent).toBe('Description');
    expect(container.querySelector('.inspector-content-stat-row')?.textContent).toContain(`${result.page.wordCount} words`);
    expect(container.querySelector('.inspector-content-stat-row strong')).toBeNull();
    expect(container.querySelector('.inspector-content-section-head')?.textContent).toContain('Copy headings');
    expect(container.querySelector('.inspector-content-section-head button svg')).not.toBeNull();
    expect(container.querySelectorAll('.inspector-heading-row')).toHaveLength(8);
    expect(container.querySelector('.inspector-heading-row[data-level="3"]')?.textContent).toBe('H3Early detail');
    await click('Copy headings');
    expect(writeText).toHaveBeenCalledWith('H1\tMain\nH3\tEarly detail\nH2\tSection 1\nH2\tSection 2\nH2\tSection 3\nH2\tSection 4\nH2\tSection 5\nH2\tSection 6\nH2\tSection 7');
    await click('Show more');
    expect(container.querySelectorAll('.inspector-heading-row')).toHaveLength(9);
    await click('Show fewer');
    expect(container.querySelectorAll('.inspector-heading-row')).toHaveLength(8);
  });

  it('offers full TSV fallback on clipboard failure', async () => {
    result.page.headings = [{ level: 1, text: 'Main' }, { level: 2, text: 'Repeated' }, { level: 2, text: 'Repeated' }];
    writeText.mockRejectedValue(new Error('Denied'));
    await show('content');
    await click('Copy headings');
    expect(container.textContent).toContain('Copy failed');
    expect((container.querySelector('.inspector-fallback') as HTMLTextAreaElement).value).toBe('H1\tMain\nH2\tRepeated\nH2\tRepeated');
  });

  it('shows the heading order warning before the heading list', async () => {
    result.page.headings = [{ level: 3, text: 'Intro' }, { level: 1, text: 'Main' }];
    await show('content');
    const body = container.querySelector('.inspector-content-heading-body')!;
    expect(body.firstElementChild?.textContent).toBe('iThe first heading is not H1');
    expect(body.querySelectorAll('.inspector-heading-row')).toHaveLength(2);
    expect(body.textContent).not.toContain('No H1 heading found.');
  });

  it('shows heading-level jumps as page structure without emphasizing them in the Inspector', async () => {
    result.page.headings = [
      { level: 1, text: 'Plans & pricing' },
      { level: 3, text: 'Lite' },
      { level: 4, text: 'Traffic reports' },
      { level: 5, text: 'Regional reports' },
      { level: 6, text: 'Implementation note' }
    ];
    await show('content');
    const body = container.querySelector('.inspector-content-heading-body')!;
    expect(body.querySelector('.inspector-content-heading-warning')).toBeNull();
    expect(body.querySelector('.is-level-jump')).toBeNull();
    expect(Array.from(body.querySelectorAll('.inspector-heading-row')).map((row) => row.textContent)).toEqual([
      'H1Plans & pricing', 'H3Lite', 'H4Traffic reports', 'H5Regional reports', 'H6Implementation note'
    ]);
  });

  it('shows a missing H1 warning at the start of headings', async () => {
    result.page.headings = [{ level: 2, text: 'Intro' }];
    await show('content');
    expect(container.querySelector('.inspector-content-heading-body')?.firstElementChild?.textContent).toBe('iNo H1 heading found.');
  });

  it('shows only Missing and disables copying when the page has no headings', async () => {
    result.page.headings = [];
    await show('content');
    expect(container.querySelector('.inspector-content-heading-body')?.textContent).toBe('Missing');
    expect(container.querySelector('.inspector-content-heading-warning')).toBeNull();
    expect(container.querySelector<HTMLButtonElement>('.inspector-content-section-head button')?.disabled).toBe(true);
  });

  it('shows parse failures as an actionable warning without persistent metrics', async () => {
    result.page.jsonLdBlockCount = 3;
    result.page.invalidSchemaCount = 1;
    result.metrics.schemaTypes = ['WebPage', 'WebPage', 'Article'];
    await show('structured');
    expect(container.querySelector('.inspector-schema-warning')?.textContent).toBe('1 JSON-LD block couldn’t be parsed.');
    expect(container.querySelectorAll('.inspector-schema-entry')).toHaveLength(2);
    expect(container.querySelector('.inspector-schema-metrics')).toBeNull();
    expect(container.textContent).not.toContain('Copy schema types');
    expect(container.textContent).toContain('Detection only — Google rich result eligibility is not validated.');
  });

  it('shows each graph item and its nested properties without merging duplicate types', async () => {
    result.page.schemas = [
      { type: 'WebPage', format: 'JSON-LD', properties: { '@type': 'WebPage', name: 'Example', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home' }] } } },
      { type: 'ImageObject', format: 'JSON-LD', properties: { '@type': 'ImageObject', width: 1200 } },
      { type: 'ImageObject', format: 'JSON-LD', properties: { '@type': 'ImageObject', width: 600 } },
    ];
    await show('structured');
    expect(container.querySelectorAll('.inspector-schema-entry')).toHaveLength(3);
    expect(container.querySelectorAll('.inspector-schema-entry[open]')).toHaveLength(0);
    expect(container.textContent).toContain('BreadcrumbList');
    expect(container.textContent).toContain('1200');
    expect(container.textContent).toContain('600');
    expect(container.querySelector('.inspector-schema-warning')).toBeNull();
    expect(container.querySelector('.inspector-schema-metrics')).toBeNull();
    await act(async () => container.querySelector<HTMLElement>('.inspector-schema-entry > summary')!.click());
    expect(container.querySelectorAll('.inspector-schema-entry[open]')).toHaveLength(1);
    const nested = container.querySelector<HTMLDetailsElement>('.inspector-schema-nested')!;
    expect(nested.open).toBe(false);
    expect(nested.querySelector('summary')?.textContent).toBe('breadcrumb');
    await act(async () => nested.querySelector('summary')!.click());
    expect(nested.open).toBe(true);
    await act(async () => nested.querySelector('summary')!.click());
    expect(nested.open).toBe(false);
    expect(container.textContent).not.toContain('{1}');
  });

  it('places Organization values before expandable fields in one aligned column', async () => {
    result.page.schemas = [{ type: 'Organization', format: 'JSON-LD', properties: {
      '@id': 'https://example.com/#organization', '@type': 'Organization',
      image: { '@id': 'https://example.com/#image' }, logo: { '@id': 'https://example.com/#logo' },
      name: 'Example', sameAs: ['https://social.example.com/example'], url: 'https://example.com/'
    } }];
    await show('structured');
    const section = container.querySelector('.inspector-schema-entry')!;
    expect(Array.from(section.children).slice(1).map((element) => element.querySelector(':scope > span:first-child, :scope > summary')?.textContent)).toEqual([
      '@id', '@type', 'name', 'url', 'image', 'logo', 'sameAs'
    ]);
    expect(section.querySelectorAll('.inspector-schema-nested[open]')).toHaveLength(0);
  });

  it('groups mixed markup formats without repeating a format beside each item', async () => {
    result.page.schemas = [
      { type: 'WebPage', format: 'JSON-LD', properties: { '@type': 'WebPage' } },
      { type: 'Product', format: 'Microdata', properties: { '@type': 'Product' } },
      { type: 'Organization', format: 'JSON-LD', properties: { '@type': 'Organization' } },
      { type: 'BreadcrumbList', format: 'RDFa', properties: { '@type': 'BreadcrumbList' } }
    ];
    await show('structured');
    expect(Array.from(container.querySelectorAll('.inspector-schema-group > h3')).map((item) => item.textContent)).toEqual(['JSON-LD', 'Microdata', 'RDFa']);
    expect(Array.from(container.querySelectorAll('.inspector-schema-group')).map((group) => Array.from(group.querySelectorAll('.inspector-schema-entry > summary')).map((item) => item.textContent))).toEqual([
      ['WebPage', 'Organization'], ['Product'], ['BreadcrumbList']
    ]);
  });

  it('shows Microdata type arrays as readable type names instead of numeric children', async () => {
    result.page.schemas = [{
      type: 'Organization', format: 'Microdata', properties: {
        '@type': ['http://schema.org/Organization', 'https://schema.org/LocalBusiness'],
        url: 'https://example.com/'
      }
    }];
    await show('structured');
    const typeProperty = Array.from(container.querySelectorAll('.inspector-schema-property')).find((property) => property.firstElementChild?.textContent === '@type');
    expect(typeProperty?.textContent).toBe('@typeOrganization, LocalBusiness');
    expect(typeProperty?.querySelector('span:last-child')?.getAttribute('title')).toBe('http://schema.org/Organization, https://schema.org/LocalBusiness');
    expect(container.querySelector('.inspector-schema-nested')).toBeNull();
    expect(container.textContent).not.toContain('0http://schema.org/Organization');
  });

  it('renders FAQ object arrays without exposing numeric JSON indexes and limits the preview', async () => {
    result.page.schemas = [{
      type: 'FAQPage', format: 'JSON-LD', properties: {
        '@context': 'https://schema.org/', '@type': 'FAQPage',
        mainEntity: Array.from({ length: 7 }, (_, index) => ({
          '@type': 'Question',
          name: `Question ${index + 1}`,
          acceptedAnswer: { '@type': 'Answer', text: `Answer ${index + 1}` }
        }))
      }
    }];
    await show('structured');
    await act(async () => container.querySelector<HTMLElement>('.inspector-schema-entry > summary')!.click());
    const mainEntity = Array.from(container.querySelectorAll<HTMLDetailsElement>('.inspector-schema-array')).find((item) => item.querySelector(':scope > summary')?.textContent === 'mainEntity× 7')!;
    expect(mainEntity).toBeDefined();
    await act(async () => mainEntity.querySelector<HTMLElement>(':scope > summary')!.click());
    expect(mainEntity.open).toBe(true);
    expect(mainEntity.querySelectorAll(':scope > .inspector-schema-array-list > .inspector-schema-array-item')).toHaveLength(5);
    const questionItems = Array.from(mainEntity.querySelectorAll(':scope > .inspector-schema-array-list > .inspector-schema-array-item'));
    expect(questionItems.map((item) => Array.from(item.querySelectorAll(':scope > .inspector-schema-array-fields > .inspector-schema-property')).map((property) => property.textContent))).toEqual([
      ['@typeQuestion', 'nameQuestion 1'],
      ['@typeQuestion', 'nameQuestion 2'],
      ['@typeQuestion', 'nameQuestion 3'],
      ['@typeQuestion', 'nameQuestion 4'],
      ['@typeQuestion', 'nameQuestion 5']
    ]);
    expect(questionItems.every((item) => item.querySelector(':scope > .inspector-schema-array-fields > .inspector-schema-nested > summary')?.textContent === 'acceptedAnswer')).toBe(true);
    expect(Array.from(mainEntity.querySelectorAll('summary')).some((summary) => /^\d+$/.test(summary.textContent ?? ''))).toBe(false);
    expect(mainEntity.querySelectorAll('.inspector-schema-nested')).toHaveLength(5);
    const showAll = mainEntity.querySelector<HTMLButtonElement>('.inspector-schema-show-more')!;
    expect(showAll.textContent).toBe('Show all 7 items');
    await act(async () => showAll.click());
    expect(mainEntity.querySelectorAll(':scope > .inspector-schema-array-list > .inspector-schema-array-item')).toHaveLength(7);
    expect(showAll.textContent).toBe('Show fewer');
  });

  it('renders scalar, empty and mixed arrays without numeric field labels', async () => {
    result.page.schemas = [{ type: 'Organization', format: 'JSON-LD', properties: {
      '@type': 'Organization',
      sameAs: ['https://social.example.com/example', 'https://video.example.com/example'],
      emptyValues: [],
      mixedValues: ['Featured', { '@type': 'Thing', name: 'Example thing' }, 3]
    } }];
    await show('structured');
    await act(async () => container.querySelector<HTMLElement>('.inspector-schema-entry > summary')!.click());
    const arrays = Array.from(container.querySelectorAll<HTMLDetailsElement>('.inspector-schema-array'));
    const sameAs = arrays.find((item) => item.querySelector(':scope > summary')?.textContent === 'sameAs× 2')!;
    await act(async () => sameAs.querySelector<HTMLElement>(':scope > summary')!.click());
    expect(Array.from(sameAs.querySelectorAll<HTMLAnchorElement>(':scope > .inspector-schema-array-list > .inspector-schema-array-item > a')).map((link) => link.href)).toEqual([
      'https://social.example.com/example', 'https://video.example.com/example'
    ]);
    const emptyValues = arrays.find((item) => item.querySelector(':scope > summary')?.textContent === 'emptyValues')!;
    expect(emptyValues.textContent).toContain('Empty list');
    const mixedValues = arrays.find((item) => item.querySelector(':scope > summary')?.textContent === 'mixedValues× 3')!;
    expect(mixedValues.textContent).toContain('Featured');
    expect(Array.from(mixedValues.querySelectorAll('.inspector-schema-array-fields > .inspector-schema-property')).map((property) => property.textContent)).toEqual(['@typeThing', 'nameExample thing']);
    expect(mixedValues.textContent).toContain('3');
    expect(Array.from(container.querySelectorAll('summary')).some((summary) => /^\d+$/.test(summary.textContent ?? ''))).toBe(false);
  });

  it('previews five repeated RDFa instances and renders the rest only on request', async () => {
    result.page.schemas = [
      { type: 'foaf:Image', format: 'RDFa', properties: { '@type': 'foaf:Image', about: 'https://example.com/1.jpg' } },
      { type: 'foaf:Image', format: 'RDFa', properties: { '@type': 'foaf:Image', about: 'https://example.com/2.jpg' } },
      { type: 'foaf:Image', format: 'RDFa', properties: { '@type': 'foaf:Image', about: 'https://example.com/3.jpg' } },
      { type: 'foaf:Image', format: 'RDFa', properties: { '@type': 'foaf:Image', about: 'https://example.com/4.jpg' } },
      { type: 'foaf:Image', format: 'RDFa', properties: { '@type': 'foaf:Image', about: 'https://example.com/5.jpg' } },
      { type: 'foaf:Image', format: 'RDFa', properties: { '@type': 'foaf:Image', about: 'https://example.com/6.jpg' } },
      { type: 'schema:Organization', format: 'RDFa', properties: { '@type': 'schema:Organization', name: 'Example' } }
    ];
    await show('structured');
    const group = container.querySelector<HTMLDetailsElement>('.inspector-schema-type-group')!;
    expect(group).not.toBeNull();
    expect(group.open).toBe(false);
    expect(group.querySelector(':scope > summary')?.textContent).toBe('foaf:Image× 6');
    expect(group.querySelector('.inspector-schema-count')?.getAttribute('aria-label')).toBe('6 instances');
    expect(group.querySelectorAll('.inspector-schema-entry')).toHaveLength(5);
    expect(Array.from(group.querySelectorAll('.inspector-schema-entry > summary')).map((item) => item.textContent)).toEqual(['Instance 1', 'Instance 2', 'Instance 3', 'Instance 4', 'Instance 5']);
    expect(group.textContent).toContain('https://example.com/1.jpg');
    expect(group.textContent).not.toContain('https://example.com/6.jpg');
    const showAll = group.querySelector<HTMLButtonElement>('.inspector-schema-show-more')!;
    expect(showAll.textContent).toBe('Show all 6 instances');
    expect(showAll.getAttribute('aria-expanded')).toBe('false');
    await act(async () => showAll.click());
    expect(group.querySelectorAll('.inspector-schema-entry')).toHaveLength(6);
    expect(group.textContent).toContain('https://example.com/6.jpg');
    expect(showAll.textContent).toBe('Show fewer');
    expect(showAll.getAttribute('aria-expanded')).toBe('true');
    await act(async () => showAll.click());
    expect(group.querySelectorAll('.inspector-schema-entry')).toHaveLength(5);
    expect(Array.from(container.querySelectorAll(':scope .inspector-structured-sheet > .inspector-schema-entry > summary')).map((item) => item.textContent)).toContain('schema:Organization');
    await act(async () => group.querySelector('summary')!.click());
    expect(group.open).toBe(true);
  });

  it('shows a neutral empty state without a validation disclaimer when no markup exists', async () => {
    result.page.schemas = [];
    result.page.jsonLdBlockCount = 0;
    result.metrics.schemaTypes = [];
    await show('structured');
    expect(container.querySelector('.inspector-schema-empty strong')?.textContent).toBe('No structured data detected');
    expect(container.querySelector('.inspector-schema-empty p')?.textContent).toBe('No JSON-LD, Microdata, or RDFa markup was found in the rendered page.');
    expect(container.querySelector('.inspector-index-footnote')).toBeNull();
  });

  it('does not add excluded images to alt filter counts', async () => {
    result.page.images = [{ src: 'https://example.com/b.png', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 50, transferSize: 0 }];
    result.page.excludedImageCount = 1;
    result.metrics.auditableImageCount = 1;
    await show('images');
    const options = Array.from(container.querySelectorAll('.inspector-image-filter-menu button'));
    expect(options.find((button) => button.textContent?.includes('Not empty'))?.querySelector('small')?.textContent).toBe('0');
    expect(options.find((button) => button.textContent?.includes('Empty'))?.querySelector('small')?.textContent).toBe('1');
    expect(container.textContent).not.toContain('Image count');
    expect(container.textContent).toContain('Empty alt');
    expect(container.querySelector('.inspector-image-url a')?.getAttribute('href')).toBe('https://example.com/b.png');
  });

  it('keeps the full image URL in a safe new-tab hyperlink despite shortening the visible label', async () => {
    const fullImageUrl = 'https://example.com/image.png?token=full-original-query';
    result.page.images = [{ src: fullImageUrl, alt: 'Product photo', auditable: true, naturalWidth: 800, naturalHeight: 600, transferSize: 0 }];
    await show('images');
    const link = container.querySelector<HTMLAnchorElement>('.inspector-image-url a')!;
    expect(link.getAttribute('href')).toBe(fullImageUrl);
    expect(link.hasAttribute('title')).toBe(false);
    expect(link.getAttribute('aria-label')).toBe(fullImageUrl);
    expect(link.textContent).toBe('example.com/image.png?…');
    expect(link.querySelector('.inspector-image-external-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(link.rel).toContain('noreferrer');
  });

  it('shows only live DOM canonical and marks future signals as not checked', async () => {
    result.page.canonical = 'https://example.com/preferred';
    await show('indexability');
    expect(container.querySelectorAll('.inspector-index-section')).toHaveLength(4);
    expect(container.querySelector('.inspector-index-url')?.textContent).toBe('https://example.com/preferred');
    expect(container.querySelector('[aria-label="Copy canonical URL"]')).toBeNull();
    expect(container.querySelector('.inspector-index-footnote')).toBeNull();
    expect(container.textContent).toContain('Robots Meta Tag');
    expect(container.textContent).toContain('Not checked');
    expect(container.textContent).not.toContain('https://example.com/robots.txt');
  });

  it('keeps an absent canonical distinct from signals that were not checked', async () => {
    result.page.canonical = '';
    await show('indexability');
    expect(container.querySelector('.inspector-index-missing')?.textContent).toBe('Missing');
    expect(container.querySelector('.inspector-index-missing.is-critical svg')).not.toBeNull();
    expect(container.querySelector('.inspector-index-row .inspector-pill')).toBeNull();
    expect(container.querySelector('[aria-label="Copy canonical URL"]')).toBeNull();
    const robots = Array.from(container.querySelectorAll<HTMLDetailsElement>('.inspector-index-section')).find((section) => section.querySelector('summary')?.textContent === 'Robots')!;
    expect(robots.open).toBe(true);
    await act(async () => robots.querySelector('summary')!.click());
    expect(robots.open).toBe(false);
  });

  it('does not repeat Missing in the status column for an absent raw canonical', async () => {
    result.page.canonical = metadata.url;
    vi.stubGlobal('chrome', { scripting: { executeScript: vi.fn().mockResolvedValue([{ result: { pageUrl: metadata.url, rawCanonical: null } }]) } });
    try {
      await act(async () => root.render(<PopupToolViews tool="indexability" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      const rows = container.querySelectorAll('.inspector-index-section:first-child .inspector-index-row');
      expect(rows[1].querySelector('.inspector-index-missing')?.textContent).toBe('Missing');
      expect(rows[1].querySelector('.inspector-pill')).toBeNull();
    } finally { vi.unstubAllGlobals(); }
  });

  it('shows verified indexability signals after inspecting the active page', async () => {
    result.page.canonical = metadata.url;
    const executeScript = vi.fn().mockResolvedValue([{ result: {
      pageUrl: metadata.url, rawCanonical: metadata.url, robotsMeta: null,
      xRobotsTag: null, robotsUrl: 'https://example.com/robots.txt',
      sitemapUrls: ['https://example.com/sitemap.xml'],
      hreflangs: [{ language: 'fr', url: 'https://example.com/fr/' }]
    } }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="indexability" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      expect(executeScript).toHaveBeenCalledOnce();
      expect(container.textContent).toContain('Self-canonical');
      expect(container.textContent).toContain('Robots.txt');
      expect(container.textContent).toContain('fr');
      expect(container.querySelectorAll('.inspector-index-missing')).toHaveLength(2);
      expect(container.querySelector<HTMLAnchorElement>('a[href="https://example.com/sitemap.xml"]')).not.toBeNull();
    } finally { vi.unstubAllGlobals(); }
  });

  it('marks a confirmed noindex page and a confirmed absent sitemap', async () => {
    const executeScript = vi.fn().mockResolvedValue([{ result: {
      pageUrl: metadata.url, rawCanonical: metadata.url, robotsMeta: 'noindex,nofollow',
      xRobotsTag: null, robotsUrl: 'https://example.com/robots.txt',
      sitemapUrls: null, hreflangs: null
    } }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });
    try {
      await act(async () => root.render(<PopupToolViews tool="indexability" metadata={metadata} scan={{ status: 'ready', result }} tabId={3} onRetry={() => {}} onRequestAccess={async () => {}} />));
      const sections = container.querySelectorAll('.inspector-index-section');
      expect(sections[1].querySelector('summary')?.textContent).toBe('RobotsiNoindex page');
      expect(sections[2].textContent).toContain('Not found');
      expect(sections[2].textContent).not.toContain('Not checked');
    } finally { vi.unstubAllGlobals(); }
  });

  it('treats a canonical without tracking parameters as self-canonical', async () => {
    result.page.url = 'https://example.com/?utm_source=toolbar';
    result.page.canonical = 'https://example.com/';
    await show('indexability');
    expect(container.querySelector('.inspector-index-row .inspector-pill')?.textContent).toBe('Self-canonical');
    result.page.canonical = 'https://example.com/?page=2';
    await show('indexability');
    expect(container.querySelector('.inspector-index-row .inspector-pill')?.textContent).toBe('Found');
  });

  it('does not invent Social or Links results', async () => {
    await show('social');
    expect(container.textContent).toContain('Open graph tags');
    expect(container.textContent).toContain('Not checked');
    await show('links');
    expect(container.querySelector('.inspector-coming-soon-banner')?.textContent).toContain('Outgoing link targets, follow attributes and HTTP status are not collected yet.');
    expect(container.textContent).not.toContain('Found');
  });
});
