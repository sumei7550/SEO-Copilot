import { describe, expect, it } from 'vitest';
import { analyzePage } from './pageAnalyzer';
import type { PageData } from '../types/seo';

const pageWithImages = (images: PageData['images']): PageData => ({
  url: 'https://example.com', title: 'Example', titleTagCount: 1, metaDescription: '', headings: [], images,
  canonical: '', schemas: [], invalidSchemaCount: 0, wordCount: 400, textRatio: 0.3
});

describe('analyzePage image audit collection', () => {
  it('counts only auditable informative images as missing-alt candidates', () => {
    const metrics = analyzePage(pageWithImages([
      { src: 'decorative.svg', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 100, transferSize: 0 },
      { src: 'icon.svg', alt: '', auditable: true, naturalWidth: 24, naturalHeight: 24, transferSize: 0 },
      { src: 'product.jpg', alt: null, auditable: true, naturalWidth: 800, naturalHeight: 600, transferSize: 0 },
      { src: 'hidden.png', alt: null, auditable: false, naturalWidth: 800, naturalHeight: 600, transferSize: 0 }
    ]));

    expect(metrics.imageCount).toBe(4);
    expect(metrics.auditableImageCount).toBe(3);
    expect(metrics.imagesWithoutAlt).toBe(1);
    expect(metrics.altCoverage).toBe(67);
  });

  it('does not treat an empty alt attribute as missing alt', () => {
    const metrics = analyzePage(pageWithImages([
      { src: 'decorative.svg', alt: '', auditable: true, naturalWidth: 100, naturalHeight: 100, transferSize: 0 }
    ]));

    expect(metrics.imagesWithoutAlt).toBe(0);
  });
});
