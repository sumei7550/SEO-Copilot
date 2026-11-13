import type { Category, SeoIssue } from '../types/seo';

export const auditCategories = [
  { id: 'content', label: 'Content SEO', ruleCategories: ['title', 'meta', 'content'] },
  { id: 'structure', label: 'Page Structure', ruleCategories: ['heading'] },
  { id: 'technical', label: 'Technical SEO', ruleCategories: ['url', 'technical'] },
  { id: 'images', label: 'Images', ruleCategories: ['images'] },
] as const satisfies ReadonlyArray<{ id: string; label: string; ruleCategories: readonly Category[] }>;

export type AuditCategoryId = (typeof auditCategories)[number]['id'];

export function issuesForCategory(issues: SeoIssue[], category: AuditCategoryId | 'all'): SeoIssue[] {
  if (category === 'all') return issues;
  const ruleCategories: readonly Category[] = auditCategories.find((item) => item.id === category)!.ruleCategories;
  return issues.filter((issue) => ruleCategories.includes(issue.category));
}
