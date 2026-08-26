import type { SeoIssue } from '../types/seo';

const AI_FIX_ISSUE_IDS = new Set([
  'TITLE_001',
  'TITLE_002',
  'TITLE_003',
  'META_001',
  'META_002',
  'META_003'
]);

/** Alpha Real AI is limited to Title and Meta Description copy generation. */
export function canUseAiFix(issue: SeoIssue): boolean {
  return AI_FIX_ISSUE_IDS.has(issue.id);
}
