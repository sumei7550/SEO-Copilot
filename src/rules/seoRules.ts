import type { PageData, PageMetrics, SeoIssue, SeoRule } from '../types/seo';

function hasHeadingJump(page: PageData): boolean {
  let previousLevel = 0;
  for (const heading of page.headings) {
    if (previousLevel > 0 && heading.level > previousLevel + 1) return true;
    previousLevel = heading.level;
  }
  return false;
}

function hasPoorUrlStructure(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    return [...parsed.searchParams.keys()].length > 3
      || pathSegments.some((segment) => /\d{8,}/.test(segment) || /^[a-f\d]{16,}$/i.test(segment))
      || parsed.pathname.includes('//');
  } catch {
    return true;
  }
}

const rule = (value: SeoRule): SeoRule => value;

export const seoRules: readonly SeoRule[] = [
  rule({ id: 'TITLE_001', category: 'title', severity: 'critical', impact: -10, messageKey: 'issueTitleMissing', impactKey: 'impactTitle', solutionKey: 'fixTitleMissing', check: (page) => !page.title }),
  rule({ id: 'TITLE_002', category: 'title', severity: 'warning', impact: -5, messageKey: 'issueTitleShort', impactKey: 'impactTitle', solutionKey: 'fixTitleLength', check: (page) => Boolean(page.title) && page.title.length < 30 }),
  rule({ id: 'TITLE_003', category: 'title', severity: 'warning', impact: -3, messageKey: 'issueTitleLong', impactKey: 'impactTitle', solutionKey: 'fixTitleLength', check: (page) => page.title.length > 60 }),
  rule({ id: 'TITLE_004', category: 'title', severity: 'info', impact: -1, messageKey: 'issueTitleDuplicate', impactKey: 'impactTitle', solutionKey: 'fixTitleDuplicate', check: (page) => page.titleTagCount > 1 }),

  rule({ id: 'META_001', category: 'meta', severity: 'critical', impact: -10, messageKey: 'issueMetaMissing', impactKey: 'impactMeta', solutionKey: 'fixMetaMissing', check: (page) => !page.metaDescription }),
  rule({ id: 'META_002', category: 'meta', severity: 'warning', impact: -5, messageKey: 'issueMetaLength', impactKey: 'impactMeta', solutionKey: 'fixMetaLength', check: (page) => Boolean(page.metaDescription) && page.metaDescription.length < 70 }),
  rule({ id: 'META_003', category: 'meta', severity: 'warning', impact: -3, messageKey: 'issueMetaLength', impactKey: 'impactMeta', solutionKey: 'fixMetaLength', check: (page) => page.metaDescription.length > 160 }),

  rule({ id: 'HEADING_001', category: 'heading', severity: 'critical', impact: -8, messageKey: 'issueH1Missing', impactKey: 'impactHeading', solutionKey: 'fixH1Missing', check: (_page, metrics) => metrics.h1Count === 0 }),
  rule({ id: 'HEADING_002', category: 'heading', severity: 'warning', impact: -4, messageKey: 'issueH1Multiple', impactKey: 'impactHeading', solutionKey: 'fixH1Multiple', check: (_page, metrics) => metrics.h1Count > 1 }),
  rule({ id: 'HEADING_003', category: 'heading', severity: 'warning', impact: -3, messageKey: 'issueHeadingStructure', impactKey: 'impactHeading', solutionKey: 'fixHeadingStructure', check: (page) => hasHeadingJump(page) }),

  rule({ id: 'IMAGE_001', category: 'images', severity: 'warning', impact: -5, messageKey: 'issueImageAlt', impactKey: 'impactImages', solutionKey: 'fixImageAlt', check: (_page, metrics) => metrics.imagesWithoutAlt > 0 }),
  rule({ id: 'IMAGE_002', category: 'images', severity: 'warning', impact: -5, messageKey: 'issueImageAltRatio', impactKey: 'impactImages', solutionKey: 'fixImageAltRatio', check: (_page, metrics) => metrics.imageCount > 0 && metrics.altCoverage < 50 }),
  rule({ id: 'IMAGE_003', category: 'images', severity: 'info', impact: -3, messageKey: 'issueImageLarge', impactKey: 'impactImages', solutionKey: 'fixImageLarge', check: (page) => page.images.some((image) => image.transferSize > 500_000 || image.naturalWidth * image.naturalHeight > 4_000_000) }),

  rule({ id: 'URL_001', category: 'url', severity: 'warning', impact: -2, messageKey: 'issueUrlLong', impactKey: 'impactUrl', solutionKey: 'fixUrlLong', check: (page) => page.url.length > 100 }),
  rule({ id: 'URL_002', category: 'url', severity: 'warning', impact: -3, messageKey: 'issueUrlStructure', impactKey: 'impactUrl', solutionKey: 'fixUrlStructure', check: (page) => hasPoorUrlStructure(page.url) }),

  rule({ id: 'TECH_001', category: 'technical', severity: 'warning', impact: -5, messageKey: 'issueCanonicalMissing', impactKey: 'impactTechnical', solutionKey: 'fixCanonicalMissing', check: (page) => !page.canonical }),
  rule({ id: 'TECH_002', category: 'technical', severity: 'info', impact: -2, messageKey: 'issueSchemaMissing', impactKey: 'impactTechnical', solutionKey: 'fixSchemaMissing', check: (page) => page.schemas.length === 0 }),
  rule({ id: 'TECH_003', category: 'technical', severity: 'warning', impact: -5, messageKey: 'issueSchemaInvalid', impactKey: 'impactTechnical', solutionKey: 'fixSchemaInvalid', check: (page) => page.invalidSchemaCount > 0 }),

  rule({ id: 'CONTENT_001', category: 'content', severity: 'warning', impact: -5, messageKey: 'issueContentLowWords', impactKey: 'impactContent', solutionKey: 'fixContentLowWords', check: (page) => page.wordCount < 300 }),
  rule({ id: 'CONTENT_002', category: 'content', severity: 'info', impact: -3, messageKey: 'issueContentLowRatio', impactKey: 'impactContent', solutionKey: 'fixContentLowRatio', check: (page) => page.textRatio < 0.1 })
];

export function evaluateRules(page: PageData, metrics: PageMetrics): SeoIssue[] {
  return seoRules.filter((item) => item.check(page, metrics)).map(({ check: _check, ...issue }) => issue);
}
