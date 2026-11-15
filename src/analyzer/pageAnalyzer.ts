import type { PageData, PageMetrics } from '../types/seo';

export function analyzePage(page: PageData): PageMetrics {
  // Alt requirements apply to every reportable <img>, including lazy-loaded
  // and currently hidden variants. `auditable` remains the signal for checks
  // that require a loaded, visible image, such as performance opportunities.
  const altCandidates = page.images;
  const imagesWithoutAlt = altCandidates.filter((image) => image.alt === null).length;
  const imageCount = page.images.length;
  const auditableImageCount = altCandidates.length;

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
