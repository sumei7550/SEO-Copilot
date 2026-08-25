import type { SeoResult } from '../types/seo';

export const previewResult: SeoResult = {
  page: {
    url: 'https://example.com/products/seo-copilot',
    title: 'SEO Copilot — Actionable On-Page SEO Audit', titleTagCount: 1,
    metaDescription: 'Run a clear on-page SEO audit and understand exactly what to fix next.',
    headings: [{ level: 1, text: 'SEO Copilot' }, { level: 2, text: 'Features' }],
    images: [], canonical: '', schemas: [], invalidSchemaCount: 0, wordCount: 540, textRatio: 0.24
  },
  metrics: { h1Count: 1, h2Count: 1, h3Count: 0, imageCount: 0, auditableImageCount: 0, imagesWithoutAlt: 0, altCoverage: 100, schemaTypes: [], wordCount: 540, textRatio: 0.24 },
  issues: [
    { id: 'TECH_001', category: 'technical', severity: 'warning', impact: -5, messageKey: 'issueCanonicalMissing', impactKey: 'impactTechnical', solutionKey: 'fixCanonicalMissing' },
    { id: 'META_002', category: 'meta', severity: 'warning', impact: -5, messageKey: 'issueMetaLength', impactKey: 'impactMeta', solutionKey: 'fixMetaLength' },
    { id: 'TECH_002', category: 'technical', severity: 'info', impact: -2, messageKey: 'issueSchemaMissing', impactKey: 'impactTechnical', solutionKey: 'fixSchemaMissing' }
  ],
  score: 88,
  grade: 'good',
  categoryScores: { title: 15, meta: 10, heading: 15, images: 15, content: 15, technical: 18 },
  categoryWeights: { title: 15, meta: 15, heading: 15, images: 15, content: 15, technical: 25 },
  scannedAt: Date.now()
};
