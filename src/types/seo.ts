export type Severity = 'critical' | 'warning' | 'info';
export type Category = 'title' | 'meta' | 'heading' | 'images' | 'content' | 'technical' | 'url';
export type ScoreCategory = Exclude<Category, 'url'>;
export type Grade = 'excellent' | 'good' | 'needsImprovement' | 'poor';

export interface HeadingData {
  level: 1 | 2 | 3;
  text: string;
}

export interface ImageData {
  src: string;
  alt: string | null;
  naturalWidth: number;
  naturalHeight: number;
  transferSize: number;
}

export interface SchemaData {
  type: string;
}

export interface PageData {
  url: string;
  title: string;
  titleTagCount: number;
  metaDescription: string;
  headings: HeadingData[];
  images: ImageData[];
  canonical: string;
  schemas: SchemaData[];
  invalidSchemaCount: number;
  wordCount: number;
  textRatio: number;
}

export interface PageMetrics {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  altCoverage: number;
  schemaTypes: string[];
  wordCount: number;
  textRatio: number;
}

export interface SeoIssue {
  id: string;
  category: Category;
  severity: Severity;
  messageKey: string;
  impactKey: string;
  solutionKey: string;
  impact: number;
}

export interface SeoRule {
  id: string;
  category: Category;
  severity: Severity;
  impact: number;
  messageKey: string;
  impactKey: string;
  solutionKey: string;
  check: (page: PageData, metrics: PageMetrics) => boolean;
}

export type CategoryScores = Record<ScoreCategory, number>;

export interface ScoreResult {
  score: number;
  grade: Grade;
  categoryScores: CategoryScores;
  categoryWeights: CategoryScores;
}

export interface SeoResult extends ScoreResult {
  page: PageData;
  metrics: PageMetrics;
  issues: SeoIssue[];
  scannedAt: number;
}

export interface ScanResponse {
  ok: boolean;
  result?: SeoResult;
  errorKey?: string;
}
