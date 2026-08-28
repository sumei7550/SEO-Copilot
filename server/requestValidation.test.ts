import { describe, expect, it } from 'vitest';
import { validateRequest } from './requestValidation';

const valid = { deviceId: '0123456789abcdef0123456789abcdef', issueType: 'title', currentValue: 'Old', title: 'Title', meta: 'Meta', h1: 'H1', url: 'https://example.com', brand: 'Acme', pageContext: { language: 'en', pageType: 'home' } };

describe('validateRequest', () => {
  it('accepts title and meta-description', () => {
    expect(validateRequest(valid).issueType).toBe('title');
    expect(validateRequest({ ...valid, issueType: 'meta-description' }).issueType).toBe('meta-description');
  });
  it('rejects unsupported and malformed requests', () => {
    expect(() => validateRequest({ ...valid, issueType: 'h1' })).toThrowError(expect.objectContaining({ code: 'UNSUPPORTED_ISSUE_TYPE' }));
    expect(() => validateRequest({ ...valid, title: 1 })).toThrowError(expect.objectContaining({ code: 'INVALID_REQUEST' }));
  });
});
