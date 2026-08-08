import type { HeadingData, ImageData, PageData, SchemaData } from '../types/seo';

const MAX_TEXT_LENGTH = 500_000;
const MAX_IMAGES = 1_000;

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
  const images = Array.from(doc.images).slice(0, MAX_IMAGES).map<ImageData>((image) => ({
    src: image.currentSrc || image.src,
    alt: image.hasAttribute('alt') ? image.alt : null,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    transferSize: sizes.get(image.currentSrc || image.src) ?? 0
  }));
  const visibleText = (doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH);
  const htmlLength = Math.max(1, doc.documentElement?.outerHTML.length ?? 1);
  const { schemas, invalidSchemaCount } = parseSchemas(doc);

  return {
    url: locationValue.href,
    title: doc.title.trim(),
    titleTagCount: doc.querySelectorAll('title').length,
    metaDescription: doc.querySelector<HTMLMetaElement>('meta[name="description" i]')?.content.trim() ?? '',
    headings,
    images,
    canonical: doc.querySelector<HTMLLinkElement>('link[rel="canonical" i]')?.href ?? '',
    schemas,
    invalidSchemaCount,
    wordCount: countWords(visibleText),
    textRatio: Math.min(1, visibleText.length / htmlLength)
  };
}
