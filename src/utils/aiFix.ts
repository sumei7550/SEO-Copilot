import type { SeoIssue } from '../types/seo';

const AI_FIX_ISSUE_IDS = new Set([
  'TITLE_001',
  'TITLE_002',
  'TITLE_003',
  'META_001',
  'META_002',
  'META_003',
  'HEADING_001',
  'HEADING_003'
]);

/** AI Fix is limited to issues where generating copy is a direct remediation. */
export function canUseAiFix(issue: SeoIssue): boolean {
  return AI_FIX_ISSUE_IDS.has(issue.id);
}

