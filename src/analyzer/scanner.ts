import type { HeadingData, ImageData, PageData, SchemaData } from '../types/seo';

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

function schemaType(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const type = (value as { '@type'?: unknown })['@type'];
  return Array.isArray(type) ? type.filter((item): item is string => typeof item === 'string').join(', ') : typeof type === 'string' ? type : '';
}

function parseSchemas(doc: Document): { schemas: SchemaData[]; invalidSchemaCount: number } {
  const schemas: SchemaData[] = [];
  let invalidSchemaCount = 0;

  doc.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]').forEach((script) => {
    try {
      const parsed: unknown = JSON.parse(script.textContent ?? '');
      const values = Array.isArray(parsed) ? parsed : [parsed];
      values.forEach((value) => schemas.push({ type: schemaType(value) }));
    } catch {
      invalidSchemaCount += 1;
    }
  });

  return { schemas, invalidSchemaCount };
}

function resourceSizes(performanceValue?: Performance): Map<string, number> {
  const sizes = new Map<string, number>();
  performanceValue?.getEntriesByType('resource').forEach((entry) => {
    const resource = entry as PerformanceResourceTiming;
    sizes.set(resource.name, resource.transferSize || resource.encodedBodySize || 0);
  });
  return sizes;
}

function visibleTextData(doc: Document): { text: string; elementCount: number } {
  const body = doc.body;
  if (!body) return { text: '', elementCount: 0 };

  // Use a detached copy so scripts, styles, JSON-LD, hydration payloads,
  // templates, and explicitly hidden content do not affect content signals.
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
  const images = Array.from(doc.images).slice(0, MAX_IMAGES).map<ImageData>((image) => {
    const rendered = renderedImageSize(image);
    return {
      src: image.currentSrc || image.src,
      alt: image.hasAttribute('alt') ? image.alt : null,
      auditable: isAuditableImage(image),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: rendered.width,
      renderedHeight: rendered.height,
      transferSize: sizes.get(image.currentSrc || image.src) ?? 0
    };
  });
  const { text: visibleText, elementCount } = visibleTextData(doc);
  const { schemas, invalidSchemaCount } = parseSchemas(doc);

  return {
    url: locationValue.href,
    title: doc.title.trim(),
    titleTagCount: doc.querySelectorAll('head > title').length,
    metaDescription: doc.querySelector<HTMLMetaElement>('meta[name="description" i]')?.content.trim() ?? '',
    headings,
    images,
    canonical: doc.querySelector<HTMLLinkElement>('link[rel="canonical" i]')?.href ?? '',
    schemas,
    invalidSchemaCount,
    wordCount: countWords(visibleText),
    // Advisory visible-content density; this intentionally does not use total HTML size.
    textRatio: visibleText.length === 0
      ? 0
      : Math.min(1, visibleText.length / Math.max(visibleText.length, elementCount * 24)),
    language: doc.documentElement?.getAttribute?.('lang')?.trim() || undefined
  };
}
