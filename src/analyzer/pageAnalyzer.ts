import type { PageData, PageMetrics } from '../types/seo';

export function analyzePage(page: PageData): PageMetrics {
  const imagesWithoutAlt = page.images.filter((image) => image.alt === null || image.alt.trim() === '').length;
  const imageCount = page.images.length;

  return {
    h1Count: page.headings.filter((heading) => heading.level === 1).length,
    h2Count: page.headings.filter((heading) => heading.level === 2).length,
    h3Count: page.headings.filter((heading) => heading.level === 3).length,
    imageCount,
    imagesWithoutAlt,
    altCoverage: imageCount === 0 ? 100 : Math.round(((imageCount - imagesWithoutAlt) / imageCount) * 100),
    schemaTypes: [...new Set(page.schemas.map((schema) => schema.type).filter(Boolean))],
    wordCount: page.wordCount,
    textRatio: page.textRatio
  };
}
