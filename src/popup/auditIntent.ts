export type AuditIntent = {
  id: string;
  tabId: number;
  windowId: number;
  url: string;
  category?: 'images' | 'content';
};

export type AuditIntentClaim =
  | { ok: true; intent: AuditIntent }
  | { ok: false; error?: string };

export const AUDIT_PAGE_CHANGED = 'The page changed before the audit could start. Use Scan current page to try again.';
export const AUDIT_INTENT_EXPIRED = 'The audit request expired. Use Scan current page to try again.';
