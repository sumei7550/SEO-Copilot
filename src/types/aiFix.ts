import type { SeoIssue } from './seo';

/** The page fields supported by the v1.1 AI-fix flow. */
export type AiFixType = 'title' | 'metaDescription' | 'h1';

export interface AiFixContext {
  url: string;
  title: { current: string; length: number; issueType: string | null };
  metaDescription: { current: string; length: number };
  h1: string[];
  language: string;
  pageType: string;
  brand: { name: string | null; source: 'hostname' | 'title' | 'unknown' };
  issue: {
    id: string;
    type: AiFixType;
    label: string;
    severity: SeoIssue['severity'];
    impact: number;
    diagnostic: { messageKey: string; impactKey: string; solutionKey: string };
  };
}

export interface AiFixRequest {
  type: AiFixType;
  issueId: string;
  issueLabel: string;
  currentValue: string;
  page: {
    title: string;
    metaDescription: string;
    h1: string;
  };
  context: AiFixContext;
}

export interface Recommendation {
  id: string;
  content: string;
  rationale: string;
  highlights: string[];
}

export interface AiFixResponse {
  type: AiFixType;
  recommendations: Recommendation[];
}
