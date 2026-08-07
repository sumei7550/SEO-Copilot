import type { PageData } from '../types/seo';

export function scanPage(doc: Document = document, locationValue: Location = window.location): PageData {
  const description = doc.querySelector<HTMLMetaElement>('meta[name="description"]')?.content.trim() ?? '';
  const canonical = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '';
  return {
    url: locationValue.href,
    title: doc.title.trim(),
    description,
    h1Count: doc.querySelectorAll('h1').length,
    h2Count: doc.querySelectorAll('h2').length,
    imageCount: doc.images.length,
    imagesWithoutAlt: Array.from(doc.images).filter((image) => !image.hasAttribute('alt') || image.alt.trim() === '').length,
    canonical,
    hasSchema: Boolean(doc.querySelector('script[type="application/ld+json"], [itemscope][itemtype]')),
    hasRobots: Boolean(doc.querySelector('meta[name="robots"]'))
  };
}
