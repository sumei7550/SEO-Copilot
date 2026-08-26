import { SeoFixError, type SeoFixRequest, type SupportedIssueType } from './types.js';

const LIMITS = {
  body: 8_192,
  currentValue: 500,
  title: 300,
  meta: 500,
  h1: 500,
  url: 2_000,
  pageContext: 3_000,
} as const;

export function validateRequest(value: unknown, bodyBytes = JSON.stringify(value).length): SeoFixRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SeoFixError('INVALID_REQUEST', 'Request body must be a JSON object.');
  }
  if (bodyBytes > LIMITS.body) {
    throw new SeoFixError('INVALID_REQUEST', 'Request body is too large.');
  }

  const input = value as Record<string, unknown>;
  if (typeof input.issueType !== 'string') {
    throw new SeoFixError('INVALID_REQUEST', 'issueType is required.');
  }
  if (input.issueType !== 'title' && input.issueType !== 'meta-description') {
    throw new SeoFixError('UNSUPPORTED_ISSUE_TYPE', 'Only title and meta-description are supported.');
  }

  for (const field of ['currentValue', 'title', 'meta', 'h1', 'url'] as const) {
    if (typeof input[field] !== 'string' || input[field].length > LIMITS[field]) {
      throw new SeoFixError('INVALID_REQUEST', `${field} is required and must be within its length limit.`);
    }
  }
  if (!input.pageContext || typeof input.pageContext !== 'object' || Array.isArray(input.pageContext)) {
    throw new SeoFixError('INVALID_REQUEST', 'pageContext must be an object.');
  }
  if (JSON.stringify(input.pageContext).length > LIMITS.pageContext) {
    throw new SeoFixError('INVALID_REQUEST', 'pageContext is too large.');
  }
  if (input.brand !== undefined && input.brand !== null && typeof input.brand !== 'string') {
    throw new SeoFixError('INVALID_REQUEST', 'brand must be a string or null.');
  }

  return input as unknown as SeoFixRequest;
}

export function isSupportedIssueType(value: string): value is SupportedIssueType {
  return value === 'title' || value === 'meta-description';
}
