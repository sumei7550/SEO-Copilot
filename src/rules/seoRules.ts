import type { PageData, SeoIssue } from '../types/seo';

export function evaluateRules(page: PageData): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const add = (id: string, category: SeoIssue['category'], severity: SeoIssue['severity'], messageKey: string, solutionKey: string) => issues.push({ id, category, severity, messageKey, solutionKey });
  if (!page.title) add('title-missing', 'title', 'error', 'issueTitleMissing', 'fixTitleMissing');
  else if (page.title.length < 30) add('title-short', 'title', 'warning', 'issueTitleShort', 'fixTitleLength');
  else if (page.title.length > 60) add('title-long', 'title', 'warning', 'issueTitleLong', 'fixTitleLength');
  if (!page.description) add('meta-missing', 'meta', 'error', 'issueMetaMissing', 'fixMetaMissing');
  else if (page.description.length < 120 || page.description.length > 160) add('meta-length', 'meta', 'warning', 'issueMetaLength', 'fixMetaLength');
  if (page.h1Count === 0) add('h1-missing', 'heading', 'error', 'issueH1Missing', 'fixH1Missing');
  if (page.h1Count > 1) add('h1-multiple', 'heading', 'warning', 'issueH1Multiple', 'fixH1Multiple');
  if (page.imageCount > 0 && page.imagesWithoutAlt > 0) add('image-alt-missing', 'images', 'warning', 'issueImageAlt', 'fixImageAlt');
  try { const parsed = new URL(page.url); if (!['http:', 'https:'].includes(parsed.protocol)) add('url-invalid', 'url', 'error', 'issueUrlInvalid', 'fixUrlInvalid'); } catch { add('url-invalid', 'url', 'error', 'issueUrlInvalid', 'fixUrlInvalid'); }
  if (!page.canonical) add('canonical-missing', 'technical', 'warning', 'issueCanonicalMissing', 'fixCanonicalMissing');
  if (!page.hasSchema) add('schema-missing', 'technical', 'info', 'issueSchemaMissing', 'fixSchemaMissing');
  if (!page.hasRobots) add('robots-missing', 'technical', 'info', 'issueRobotsMissing', 'fixRobotsMissing');
  return issues;
}
