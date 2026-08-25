import { describe, expect, it } from 'vitest';
import { canUseAiFix } from './aiFix';
import type { SeoIssue } from '../types/seo';

function issue(id: string, category: SeoIssue['category']): SeoIssue {
  return { id, category, severity: 'warning', impact: -1, messageKey: 'message', impactKey: 'impact', solutionKey: 'solution' };
}

describe('canUseAiFix', () => {
  it('allows copy-generation issues only', () => {
    expect(canUseAiFix(issue('TITLE_001', 'title'))).toBe(true);
    expect(canUseAiFix(issue('TITLE_002', 'title'))).toBe(true);
    expect(canUseAiFix(issue('TITLE_003', 'title'))).toBe(true);
    expect(canUseAiFix(issue('META_001', 'meta'))).toBe(true);
    expect(canUseAiFix(issue('META_002', 'meta'))).toBe(true);
    expect(canUseAiFix(issue('META_003', 'meta'))).toBe(true);
    expect(canUseAiFix(issue('HEADING_001', 'heading'))).toBe(true);
    expect(canUseAiFix(issue('HEADING_003', 'heading'))).toBe(true);
  });

  it('rejects technical and structural issues even in a related category', () => {
    expect(canUseAiFix(issue('TITLE_004', 'title'))).toBe(false);
    expect(canUseAiFix(issue('HEADING_002', 'heading'))).toBe(false);
    expect(canUseAiFix(issue('TECH_001', 'technical'))).toBe(false);
    expect(canUseAiFix(issue('IMAGE_001', 'images'))).toBe(false);
  });
});

