export type Severity = 'critical' | 'warning' | 'info';
export type Category = 'title' | 'meta' | 'heading' | 'images' | 'content' | 'technical' | 'url';
export type ScoreCategory = Exclude<Category, 'url'>;
export type Grade = 'excellent' | 'good' | 'needsImprovement' | 'poor';

export interface HeadingData {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ImageData {
  src: string;
  alt: string | null;
  /** Loaded and visible enough for checks that require rendered image data. */
  auditable: boolean;
  naturalWidth: number;
  naturalHeight: number;
  /** Rendered CSS dimensions, when available from the live DOM. */
  renderedWidth?: number;
  renderedHeight?: number;
  transferSize: number;
  /** Resource body bytes, excluding HTTP headers; absent when unavailable. */
  fileSize?: number;
}

export interface SchemaData {
  type: string;
  /** Source markup format; absent on scans saved by older versions. */
  format?: 'JSON-LD' | 'Microdata' | 'RDFa';
  id?: string;
  /** Complete, serializable properties for the structured-data inspector. */
  properties?: Record<string, SchemaValue>;
}

export type SchemaValue = string | number | boolean | null | SchemaValue[] | { [key: string]: SchemaValue };

export interface PageData {
  url: string;
  title: string;
  titleTagCount: number;
  metaDescription: string;
  headings: HeadingData[];
  images: ImageData[];
  /** DOM images omitted from the report (no HTTP(S) candidate or tracking-sized). */
  excludedImageCount?: number;
  /** More reportable images existed beyond the scanner limit. */
  imageLimitReached?: boolean;
  canonical: string;
  schemas: SchemaData[];
  /** Number of matching JSON-LD script elements, independent of parsed values. */
  jsonLdBlockCount?: number;
  invalidSchemaCount: number;
  wordCount: number;
  textRatio: number;
  /** Optional document hint used by downstream features such as AI Fix. */
  language?: string;
}

export interface PageMetrics {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  /** Reportable DOM images included in alt coverage; retained for snapshot compatibility. */
  auditableImageCount: number;
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
  imageStatuses?: Record<string, { kind: 'ok' | 'broken' | 'unchecked'; code?: number; fileSize?: number }>;
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
