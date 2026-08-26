export type SupportedIssueType = 'title' | 'meta-description';

export interface SeoFixRequest {
  issueType: SupportedIssueType | string;
  currentValue: string;
  title: string;
  meta: string;
  h1: string;
  url: string;
  brand?: string | null;
  pageContext: Record<string, unknown>;
}

export interface Recommendation {
  content: string;
  rationale: string;
}

export interface SeoFixResult {
  recommendations: Recommendation[];
}

export type SeoFixErrorCode =
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_ISSUE_TYPE'
  | 'AI_TIMEOUT'
  | 'AI_PROVIDER_ERROR'
  | 'AI_INVALID_OUTPUT'
  | 'EMPTY_RESULT';

export class SeoFixError extends Error {
  constructor(
    public readonly code: SeoFixErrorCode,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'SeoFixError';
  }
}
