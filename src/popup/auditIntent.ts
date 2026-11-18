export type AuditIntent = {
  id: string;
  tabId: number;
  windowId: number;
  url: string;
  category?: 'images' | 'content';
  /** Present only for a popup entry backed by issues in this exact scan. */
  issueIds?: string[];
  generation?: number;
  scannedAt?: number;
};

export type AuditIntentClaim =
  | { ok: true; intent: AuditIntent }
  | { ok: false; error?: string };

export const AUDIT_PAGE_CHANGED = 'The page changed before the audit could start. Use Scan current page to try again.';
export const AUDIT_INTENT_EXPIRED = 'The audit request expired. Use Scan current page to try again.';
export const AUDIT_ISSUE_UNAVAILABLE = 'This issue is no longer available in the current scan. Rescan the page and try again.';

/** Candidate order is the explicit priority when one popup hint can map to multiple issues. */
export function resolveIssueTarget(candidateIds: string[], availableIds: string[]): string | undefined {
  const available = new Set(availableIds);
  return candidateIds.find((id) => available.has(id));
}
