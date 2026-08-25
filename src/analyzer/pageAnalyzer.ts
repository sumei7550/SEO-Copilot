import type { PageData, PageMetrics } from '../types/seo';

export function analyzePage(page: PageData): PageMetrics {
  const auditableImages = page.images.filter((image) => image.auditable);
  const imagesWithoutAlt = auditableImages.filter((image) => image.alt === null).length;
  const imageCount = page.images.length;
  const auditableImageCount = auditableImages.length;

  return {
    h1Count: page.headings.filter((heading) => heading.level === 1).length,
    h2Count: page.headings.filter((heading) => heading.level === 2).length,
    h3Count: page.headings.filter((heading) => heading.level === 3).length,
    imageCount,
    auditableImageCount,
    imagesWithoutAlt,
    altCoverage: auditableImageCount === 0 ? 100 : Math.round(((auditableImageCount - imagesWithoutAlt) / auditableImageCount) * 100),
    schemaTypes: [...new Set(page.schemas.map((schema) => schema.type).filter(Boolean))],
    wordCount: page.wordCount,
    textRatio: page.textRatio
  };
}
