import type { CategoryScores, Grade, ScoreCategory, ScoreResult, SeoIssue } from '../types/seo';

export const CATEGORY_WEIGHTS: CategoryScores = {
  title: 15,
  meta: 15,
  heading: 15,
  images: 15,
  content: 15,
  technical: 25
};

function scoreCategory(category: ScoreCategory, issues: SeoIssue[]): number {
  const relevantImpact = issues
    .filter((issue) => issue.category === category || (category === 'technical' && issue.category === 'url'))
    .reduce((total, issue) => total + issue.impact, 0);
  return Math.max(0, CATEGORY_WEIGHTS[category] + relevantImpact);
}

export function gradeScore(score: number): Grade {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needsImprovement';
  return 'poor';
}

export function calculateScore(issues: SeoIssue[]): ScoreResult {
  const categories = Object.keys(CATEGORY_WEIGHTS) as ScoreCategory[];
  const categoryScores = Object.fromEntries(categories.map((category) => [category, scoreCategory(category, issues)])) as CategoryScores;
  const score = Object.values(categoryScores).reduce((total, categoryScore) => total + categoryScore, 0);
  return { score, grade: gradeScore(score), categoryScores, categoryWeights: CATEGORY_WEIGHTS };
}
