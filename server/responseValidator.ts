import { SeoFixError, type Recommendation, type SeoFixResult } from './types.js';

export function validateAiResponse(value: unknown): SeoFixResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SeoFixError('AI_INVALID_OUTPUT', 'AI output is not a JSON object.');
  }
  const recommendations = (value as Record<string, unknown>).recommendations;
  if (!Array.isArray(recommendations)) {
    throw new SeoFixError('AI_INVALID_OUTPUT', 'AI output has no recommendations array.');
  }
  const valid: Recommendation[] = recommendations
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      content: typeof item.content === 'string' ? cleanText(item.content) : '',
      rationale: typeof item.rationale === 'string' ? cleanText(item.rationale) : '',
    }))
    .filter((item) => item.content.length > 0 && item.rationale.length > 0);

  if (valid.length === 0) throw new SeoFixError('EMPTY_RESULT', 'AI returned no usable recommendations.');
  if (valid.length > 3) throw new SeoFixError('AI_INVALID_OUTPUT', 'AI returned more than 3 recommendations.');

  const unique = valid.filter((item, index, all) => all.findIndex((candidate) => candidate.content === item.content) === index);
  if (unique.length === 0) throw new SeoFixError('EMPTY_RESULT', 'AI returned no unique recommendations.');
  return { recommendations: unique };
}

function cleanText(value: string): string {
  return value.replace(/^```(?:json)?\s*|\s*```$/gi, '').replace(/<[^>]*>/g, '').trim();
}
