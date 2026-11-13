import type { HeadingData, ImageData, PageData } from '../types/seo';
import { collectStructuredData } from './structuredData';

const MAX_TEXT_LENGTH = 500_000;
const MAX_IMAGES = 1_000;
const NON_CONTENT_SELECTOR = 'script, style, noscript, template, [hidden], [aria-hidden="true"]';

function countWords(text: string): number {
  const cjkCharacters = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  const nonCjkWords = text
    .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, ' ')
    .match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  return cjkCharacters + nonCjkWords;
}

function resourceSizes(performanceValue?: Performance): Map<string, { transferSize: number; fileSize?: number }> {
  const sizes = new Map<string, { transferSize: number; fileSize?: number }>();
  performanceValue?.getEntriesByType('resource').forEach((entry) => {
    const resource = entry as PerformanceResourceTiming;
    const bodySize = resource.decodedBodySize || resource.encodedBodySize;
    sizes.set(resource.name, { transferSize: resource.transferSize || resource.encodedBodySize || 0, fileSize: Number.isFinite(bodySize) && bodySize > 0 ? bodySize : undefined });
  });
  return sizes;
}

function visibleTextData(doc: Document): { text: string; elementCount: number } {
  const body = doc.body;
  if (!body) return { text: '', elementCount: 0 };

  // In the live browser, innerText follows CSS visibility. A detached clone's
  // textContent also includes large hidden SPA panels and result payloads.
  if (typeof body.innerText === 'string') return {
    text: body.innerText.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH),
    elementCount: body.querySelectorAll('*').length
  };

  // Fallback for DOM implementations without innerText, such as jsdom.
  if (typeof body.cloneNode === 'function') {
    const bodyCopy = body.cloneNode(true) as HTMLElement;
    bodyCopy.querySelectorAll(NON_CONTENT_SELECTOR).forEach((element) => element.remove());
    return {
      text: (bodyCopy.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH),
      elementCount: bodyCopy.querySelectorAll('*').length
    };
  }

  // Keep lightweight scanner test doubles and unusual DOM implementations safe.
  return { text: (body.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH), elementCount: 0 };
}

function isHiddenImage(image: HTMLImageElement): boolean {
  let element: HTMLElement | null = image;
  while (element) {
    const hasAttribute = typeof element.hasAttribute === 'function';
    const ariaHidden = typeof element.getAttribute === 'function' ? element.getAttribute('aria-hidden') : null;
    if ((hasAttribute && element.hasAttribute('hidden')) || ariaHidden?.toLowerCase() === 'true') return true;

    const view = element.ownerDocument?.defaultView;
    try {
      const style = view?.getComputedStyle(element) ?? globalThis.getComputedStyle?.(element);
      if (style?.display === 'none' || style?.visibility === 'hidden') return true;
    } catch {
      // A limited DOM implementation may not support computed styles.
    }
    element = element.parentElement ?? null;
  }
  return false;
}

function isAuditableImage(image: HTMLImageElement): boolean {
  if (isHiddenImage(image)) return false;
  if (!Number.isFinite(image.naturalWidth) || !Number.isFinite(image.naturalHeight)
    || image.naturalWidth <= 0 || image.naturalHeight <= 0) return false;
  if (image.naturalWidth <= 1 && image.naturalHeight <= 1) return false;
  if (image.width === 0 || image.height === 0) return false;
  return true;
}

function renderedImageSize(image: HTMLImageElement): { width: number; height: number } {
  try {
    const rect = image.getBoundingClientRect?.();
    if (rect && rect.width > 0 && rect.height > 0) return { width: rect.width, height: rect.height };
  } catch {
    // A limited DOM implementation may not support layout measurements.
  }
  return { width: image.width, height: image.height };
}

export function scanPage(
  doc: Document = document,
  locationValue: Location = window.location,
  performanceValue?: Performance
): PageData {
  const sizes = resourceSizes(performanceValue ?? globalThis.performance);
  const headings = Array.from(doc.querySelectorAll<HTMLHeadingElement>('h1, h2, h3')).map<HeadingData>((heading) => ({
    level: Number(heading.tagName.slice(1)) as HeadingData['level'],
    text: (heading.textContent ?? '').trim()
  }));
  const images: ImageData[] = [];
  let excludedImageCount = 0;
  let imageLimitReached = false;
  for (const image of Array.from(doc.images)) {
    const src = image.currentSrc || image.src;
    // Inline artwork and unloaded/tracking-sized elements are not useful in
    // the network image inventory. Keep duplicates and original DOM order.
    if (!/^https?:\/\//i.test(src) || !Number.isFinite(image.naturalWidth) || !Number.isFinite(image.naturalHeight)
      || image.naturalWidth <= 1 || image.naturalHeight <= 1) {
      excludedImageCount++;
      continue;
    }
    if (images.length >= MAX_IMAGES) { imageLimitReached = true; continue; }
    const rendered = renderedImageSize(image);
    images.push({
      src,
      alt: image.hasAttribute('alt') ? image.alt : null,
      auditable: isAuditableImage(image),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: rendered.width,
      renderedHeight: rendered.height,
      transferSize: sizes.get(src)?.transferSize ?? 0,
      fileSize: sizes.get(src)?.fileSize
    });
  }
  const { text: visibleText, elementCount } = visibleTextData(doc);
  const { schemas, invalidSchemaCount, jsonLdBlockCount } = collectStructuredData(doc);

  return {
    url: locationValue.href,
    title: doc.title.trim(),
    titleTagCount: doc.querySelectorAll('head > title').length,
    metaDescription: doc.querySelector<HTMLMetaElement>('meta[name="description" i]')?.content.trim() ?? '',
    headings,
    images,
    excludedImageCount,
    imageLimitReached,
    canonical: doc.querySelector<HTMLLinkElement>('link[rel="canonical" i]')?.href ?? '',
    schemas,
    jsonLdBlockCount,
    invalidSchemaCount,
    wordCount: countWords(visibleText),
    // Advisory visible-content density; this intentionally does not use total HTML size.
    textRatio: visibleText.length === 0
      ? 0
      : Math.min(1, visibleText.length / Math.max(visibleText.length, elementCount * 24)),
    language: doc.documentElement?.getAttribute?.('lang')?.trim() || undefined
  };
}
