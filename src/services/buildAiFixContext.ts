import type { AiFixContext, AiFixType } from '../types/aiFix';
import type { PageData, SeoIssue } from '../types/seo';

function inferPageType(page: PageData): string {
  const haystack = `${page.url} ${page.title}`.toLowerCase();
  if (page.schemas.some((schema) => /product/i.test(schema.type)) || /product|item|sku/.test(haystack)) return 'product';
  if (page.schemas.some((schema) => /article|news|blog/i.test(schema.type)) || /blog|article|news|post/.test(haystack)) return 'article';
  if (/pricing|plans/.test(haystack)) return 'pricing';
  if (/contact|about|team/.test(haystack)) return 'company';
  if (/service|solution/.test(haystack)) return 'service';
  return 'website';
}

function inferBrand(page: PageData): AiFixContext['brand'] {
  try {
    const hostname = new URL(page.url).hostname.replace(/^www\./i, '');
    const firstLabel = hostname.split('.')[0];
    if (firstLabel && !/^(localhost|127|staging|dev|app)$/i.test(firstLabel)) {
      return { name: firstLabel.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), source: 'hostname' };
    }
  } catch { /* Fall through to the title heuristic. */ }
  const titleBrand = page.title.split(/\s+[|–—-]\s+/).pop()?.trim();
  return titleBrand ? { name: titleBrand, source: 'title' } : { name: null, source: 'unknown' };
}

export function buildAiFixContext(page: PageData, issue: SeoIssue, type: AiFixType, issueLabel: string): AiFixContext {
  return {
    url: page.url,
    title: { current: page.title, length: page.title.length, issueType: issue.id.startsWith('TITLE_') ? issue.id : null },
    metaDescription: { current: page.metaDescription, length: page.metaDescription.length },
    h1: page.headings.filter((heading) => heading.level === 1).map((heading) => heading.text),
    language: page.language || 'unknown',
    pageType: inferPageType(page),
    brand: inferBrand(page),
    issue: { id: issue.id, type, label: issueLabel, severity: issue.severity, impact: issue.impact, diagnostic: { messageKey: issue.messageKey, impactKey: issue.impactKey, solutionKey: issue.solutionKey } }
  };
}
