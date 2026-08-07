import type { SeoIssue } from '../types/seo';
export function calculateScore(issues: SeoIssue[]): number { return Math.max(0, Math.min(100, 100 - issues.reduce((total, issue) => total + (issue.severity === 'error' ? 15 : issue.severity === 'warning' ? 8 : 3), 0))); }
