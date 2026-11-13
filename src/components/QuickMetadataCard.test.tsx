// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MetadataState } from '../popup/perTabMetadataState';
import { QuickMetadataCard } from './QuickMetadataCard';

const url = 'https://example.com/path';
const ready = (title = 'A useful title', metaDescription = 'A useful description', pageUrl = url): MetadataState => ({
  status: 'ready', url: pageUrl, generation: 1, data: { title, metaDescription, url: pageUrl }
});
let container: HTMLDivElement;
let root: Root;
const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');

function mockRenderedHeight(height: (element: HTMLElement) => number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get(this: HTMLElement) { return height(this); }
  });
}

async function render(state: MetadataState, onOpenContentAudit?: () => void) {
  await act(async () => root.render(<QuickMetadataCard state={state} onOpenContentAudit={onOpenContentAudit} />));
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  Reflect.deleteProperty(navigator, 'clipboard');
  if (originalScrollHeight) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight);
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('QuickMetadataCard', () => {
  it('shows normal fields, JavaScript lengths, and an available Copy for each field', async () => {
    await render(ready('中文🙂', 'No warning is required to show this value'));
    expect(container.textContent).toContain('中文🙂');
    expect(container.textContent).toContain('4/60');
    expect(container.querySelector('.metadata-length')?.textContent).toBe('4/60');
    expect(container.textContent).toContain('No warning is required to show this value');
    expect(container.querySelector('.metadata-length.is-short')?.getAttribute('aria-label')).toContain('Title: 4 of 60 characters; Short');
    expect(container.querySelector('.metadata-length.is-short')?.getAttribute('title')).toBeNull();
    expect(container.textContent).not.toContain('Short');
    expect(container.querySelectorAll('.metadata-copy svg[aria-hidden="true"]')).toHaveLength(3);
    expect(container.querySelector('[aria-label="Copy URL"]')?.textContent).toBe('');
    expect(container.textContent).not.toContain(`${url.length} chars`);
    expect(container.querySelectorAll('.metadata-copy:not(:disabled)')).toHaveLength(3);
  });

  it('shows in-range and long states using the Audit limits', async () => {
    await render(ready('x'.repeat(52), 'x'.repeat(120)));
    expect(container.querySelectorAll('.metadata-length.is-in-range')).toHaveLength(2);
    expect(container.textContent).toContain('52/60');
    expect(container.textContent).toContain('120/160');
    expect(container.textContent).not.toContain('In range');
    expect(container.querySelector('.metadata-length.is-in-range')?.getAttribute('aria-label')).toContain('In range');
    await render(ready('x'.repeat(63), 'x'.repeat(161)));
    expect(container.querySelectorAll('.metadata-length.is-long')).toHaveLength(2);
    expect(container.textContent).toContain('63/60');
    expect(container.textContent).toContain('161/160');
    expect(container.textContent).not.toContain('Long');
    expect(container.querySelector('.metadata-length.is-long')?.getAttribute('title')).toBeNull();
  });

  it('keeps in-range badges quiet and shows rule-based warning help on hover and keyboard focus', async () => {
    await render(ready('x'.repeat(50), 'x'.repeat(120)));
    const normal = container.querySelector<HTMLElement>('.metadata-length.is-in-range')!;
    expect(normal.hasAttribute('title')).toBe(false);
    expect(normal.hasAttribute('tabindex')).toBe(false);
    await act(async () => normal.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(container.querySelector('[role="tooltip"]')).toBeNull();

    await render(ready('x'.repeat(18), 'x'.repeat(161)));
    const short = container.querySelector<HTMLElement>('.metadata-length.is-short')!;
    const long = container.querySelector<HTMLElement>('.metadata-length.is-long')!;
    expect(short.tabIndex).toBe(0);
    expect(long.tabIndex).toBe(0);
    await act(async () => short.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe('Title is shorter than suggested. Suggested range: 30–60 characters.');
    expect(short.getAttribute('aria-describedby')).toBe('metadata-title-length-tip');
    await act(async () => short.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    await act(async () => long.focus());
    expect(document.activeElement).toBe(long);
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe('Meta description is longer than suggested. Suggested range: 110–160 characters.');
    expect(long.getAttribute('aria-label')).toContain('Long. Suggested range: 110–160 characters');
    await act(async () => long.blur());
    expect(container.querySelector('[role="tooltip"]')).toBeNull();

    await render(ready('x'.repeat(61), 'x'.repeat(80)));
    await act(async () => container.querySelector<HTMLElement>('.metadata-length.is-long')!.focus());
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe('The title may be too long. Lengthy page titles risk being truncated when presented in Google search results. The recommended maximum title length is ~60 characters.');
    await act(async () => container.querySelector<HTMLElement>('.metadata-length.is-short')!.focus());
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe("The meta description may be too short. It is recommended to write longer descriptions as they provide an explanation of the page's content to Google.");
  });

  it('keeps the full long text while folding it and copies the full value', async () => {
    mockRenderedHeight((element) => element.classList.contains('metadata-value') ? 80 : 0);
    const longTitle = 'Long title '.repeat(20);
    const longUrl = `${url}/${'verylongsegment'.repeat(12)}`;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    await render(ready(longTitle, 'Description '.repeat(20), longUrl));
    expect(container.querySelectorAll('.metadata-expand')).toHaveLength(3);
    const titleValue = container.querySelector('#metadata-title')!;
    expect(titleValue.classList.contains('is-collapsed')).toBe(true);
    expect(titleValue.textContent).toBe(longTitle);
    const titleCopy = container.querySelector<HTMLButtonElement>('[aria-label="Copy Title"]')!;
    await act(async () => titleCopy.click());
    expect(writeText).toHaveBeenCalledWith(longTitle);
    expect(container.textContent).toContain('Title copied');
    expect(container.querySelector('.metadata-copy.is-copied')?.getAttribute('title')).toBe('Copied');
    expect(container.querySelector('.metadata-copy.is-copied svg path')?.getAttribute('d')).toBe('m4 10 4 4 8-8');
    const expand = container.querySelector<HTMLButtonElement>('[aria-controls="metadata-title"]')!;
    await act(async () => expand.click());
    expect(expand.getAttribute('aria-expanded')).toBe('true');
    expect(titleValue.classList.contains('is-collapsed')).toBe(false);
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Copy URL"]')!.click());
    expect(writeText).toHaveBeenLastCalledWith(longUrl);
    expect(container.textContent).toContain('URL copied');
  });

  it('does not offer Show more when a long value already fits in two rendered lines', async () => {
    mockRenderedHeight((element) => element.classList.contains('metadata-value') ? 32 : 0);
    await render(ready('Short title', 'A description that is long by character count but fits in two lines at this panel width. '.repeat(2)));
    expect(container.querySelector('.metadata-expand')).toBeNull();
  });

  it('shows a temporary check on successful copy and keeps the button keyboard focusable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    await render(ready());
    const button = container.querySelector<HTMLButtonElement>('[aria-label="Copy Title"]')!;
    button.focus();
    expect(document.activeElement).toBe(button);
    vi.useFakeTimers();
    await act(async () => button.click());
    expect(writeText).toHaveBeenCalledWith('A useful title');
    expect(container.querySelector('[aria-label="Title copied"]')).toBe(button);
    await act(async () => vi.advanceTimersByTime(1800));
    expect(container.querySelector('[aria-label="Copy Title"]')).toBe(button);
    expect(button.classList.contains('is-copied')).toBe(false);
  });

  it('shows Not found only for missing fields and disables their Copy', async () => {
    await render(ready('', ''));
    expect(container.querySelectorAll('.metadata-value.is-empty')).toHaveLength(2);
    expect(container.querySelectorAll('.metadata-length.is-missing')).toHaveLength(2);
    expect(container.textContent).toContain('0/60');
    expect(container.textContent).toContain('0/160');
    expect(container.textContent).not.toContain('Missing');
    expect(container.querySelector('.metadata-length.is-missing')?.getAttribute('title')).toContain('Missing');
    expect(container.querySelector('[aria-label="Copy Title"]')?.hasAttribute('disabled')).toBe(true);
    expect(container.querySelector('[aria-label="Copy Meta description"]')?.hasAttribute('disabled')).toBe(true);
    expect(container.querySelector('[aria-label="Copy URL"]')?.hasAttribute('disabled')).toBe(false);
    expect(container.textContent).toContain('Not found');
  });

  it('shows missing Description inline with hover guidance and an audit action', async () => {
    const openAudit = vi.fn();
    await render(ready('Page title', ''), openAudit);
    const field = container.querySelector('.metadata-field-metaDescription')!;
    const trigger = field.querySelector<HTMLButtonElement>('.metadata-missing-help-trigger')!;
    expect(field.textContent).toContain('Missing');
    expect(field.textContent).not.toContain('Not found');
    expect(container.querySelector('.metadata-message')).toBeNull();
    expect(field.querySelector('.metadata-length')).toBeNull();
    expect(trigger.hasAttribute('title')).toBe(false);
    await act(async () => trigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    const tooltip = document.getElementById('metadata-missing-help-tooltip')!;
    expect(tooltip.parentElement).toBe(document.body);
    expect(tooltip.textContent).toContain('Meta description not found. Run an SEO Audit for a recommended action.');
    await act(async () => trigger.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
    await act(async () => tooltip.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(trigger.getAttribute('aria-describedby')).toBe('metadata-missing-help-description');
    expect(document.getElementById('metadata-missing-help-tooltip')).not.toBeNull();
    await act(async () => tooltip.querySelector<HTMLButtonElement>('button')!.click());
    expect(openAudit).toHaveBeenCalledOnce();
    await act(async () => trigger.click());
    expect(openAudit).toHaveBeenCalledTimes(2);
  });

  it('distinguishes reading, no access, restricted, and failed states', async () => {
    await render({ status: 'reading', url, generation: 1, requestId: 1 });
    expect(container.querySelector('.metadata-skeleton')).not.toBeNull();
    expect(container.textContent).not.toContain('Missing');
    await render({ status: 'error', url, generation: 1, kind: 'access-needed' });
    expect(container.textContent).toContain('Page access needed');
    expect(container.textContent).not.toContain('Not found');
    expect(container.querySelector('.metadata-length.is-missing')).toBeNull();
    expect(container.querySelector('[aria-label="Copy Meta description"]')?.hasAttribute('disabled')).toBe(true);
    await render({ status: 'error', url: 'chrome://extensions/', generation: 2, kind: 'restricted' });
    expect(container.textContent).toContain('This Chrome page cannot be read');
    expect(container.querySelector('.metadata-length.is-missing')).toBeNull();
    await render({ status: 'error', url, generation: 3, kind: 'read-failed' });
    expect(container.textContent).toContain('Could not read this page');
    expect(container.querySelector('.metadata-length.is-missing')).toBeNull();
  });

  it('reports clipboard failure without claiming success and leaves text selectable', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    await render(ready());
    const button = container.querySelector<HTMLButtonElement>('[aria-label="Copy Title"]')!;
    await act(async () => button.click());
    expect(container.textContent).toContain('Copy failed. Select the text and copy it manually.');
    expect(container.textContent).not.toContain('Title copied');
    expect(container.querySelector('.metadata-copy.is-copied')).toBeNull();
    expect(container.querySelector('.metadata-feedback')?.getAttribute('role')).toBe('status');
    expect(container.querySelector('#metadata-title')?.textContent).toBe('A useful title');
  });
});
