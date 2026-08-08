import { describe, expect, it } from 'vitest';
import type { SeoIssue } from '../types/seo';
import { calculateScore, gradeScore } from './score';

function issue(category: SeoIssue['category'], impact: number, id: string): SeoIssue {
  return { id, category, impact, severity: 'warning', messageKey: 'message', impactKey: 'impact', solutionKey: 'solution' };
}

describe('calculateScore', () => {
  it('starts at 100 and returns the excellent grade', () => {
    expect(calculateScore([])).toEqual({
      score: 100,
      grade: 'excellent',
      categoryScores: { title: 15, meta: 15, heading: 15, images: 15, content: 15, technical: 25 },
      categoryWeights: { title: 15, meta: 15, heading: 15, images: 15, content: 15, technical: 25 }
    });
  });

  it('applies issue impacts to their category and maps URL to technical SEO', () => {
    const result = calculateScore([issue('title', -10, 'TITLE_001'), issue('url', -3, 'URL_002')]);
    expect(result.score).toBe(87);
    expect(result.categoryScores.title).toBe(5);
    expect(result.categoryScores.technical).toBe(22);
    expect(result.grade).toBe('good');
  });

  it('clamps each category at zero', () => {
    expect(calculateScore([issue('title', -100, 'TITLE_001')]).categoryScores.title).toBe(0);
  });

  it('uses the PRD grade boundaries', () => {
    expect([gradeScore(90), gradeScore(70), gradeScore(50), gradeScore(49)]).toEqual(['excellent', 'good', 'needsImprovement', 'poor']);
  });
});
