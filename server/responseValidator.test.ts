import { describe, expect, it } from 'vitest';
import { validateAiResponse } from './responseValidator';

describe('validateAiResponse', () => {
  it('accepts 1-3 usable recommendations and removes HTML', () => {
    expect(validateAiResponse({ recommendations: [{ content: '<b>Better title</b>', rationale: 'Useful' }] })).toEqual({ recommendations: [{ content: 'Better title', rationale: 'Useful' }] });
  });
  it('rejects empty and oversized results', () => {
    expect(() => validateAiResponse({ recommendations: [] })).toThrowError(expect.objectContaining({ code: 'EMPTY_RESULT' }));
    const tooMany = Array.from({ length: 4 }, (_, index) => ({ content: `Content ${index}`, rationale: 'Reason' }));
    expect(() => validateAiResponse({ recommendations: tooMany })).toThrowError(expect.objectContaining({ code: 'AI_INVALID_OUTPUT' }));
  });
});
