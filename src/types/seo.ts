export type Severity = 'error' | 'warning' | 'info';
export type Category = 'title' | 'meta' | 'heading' | 'images' | 'technical' | 'url';

export interface SeoIssue { id: string; category: Category; severity: Severity; messageKey: string; solutionKey: string; }
export interface PageData { url: string; title: string; description: string; h1Count: number; h2Count: number; imageCount: number; imagesWithoutAlt: number; canonical: string; hasSchema: boolean; hasRobots: boolean; }
export interface SeoResult { page: PageData; issues: SeoIssue[]; score: number; scannedAt: number; }
export interface ScanResponse { ok: boolean; result?: SeoResult; errorKey?: string; }
