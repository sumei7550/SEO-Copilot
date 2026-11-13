import { describe, expect, it } from 'vitest';
import { METADATA_LENGTH_LIMITS, metadataLengthStatus } from './metadataLength';
import { seoRules } from './seoRules';
import type { PageData } from '../types/seo';

const basePage: PageData = {
  url: 'https://example.com/', title: 'x'.repeat(40), titleTagCount: 1,
  metaDescription: 'x'.repeat(100), headings: [], images: [], canonical: '',
  schemas: [], invalidSchemaCount: 0, wordCount: 0, textRatio: 0
};

describe('metadata length indicator and Audit rules', () => {
  it.each([
    ['title', 30, 60],
    ['metaDescription', 110, 160]
  ] as const)('uses the same inclusive %s range in Popup and SEO Audit', (field, min, max) => {
    expect(METADATA_LENGTH_LIMITS[field]).toEqual({ min, max });
    const [missing, short, long] = field === 'title'
      ? ['TITLE_001', 'TITLE_002', 'TITLE_003']
      : ['META_001', 'META_002', 'META_003'];
    for (const [value, status, expectedIssue] of [
      ['', 'missing', missing],
      ['x'.repeat(min - 1), 'short', short],
      ['x'.repeat(min), 'in-range', undefined],
      ['x'.repeat(max), 'in-range', undefined],
      ['x'.repeat(max + 1), 'long', long]
    ] as const) {
      expect(metadataLengthStatus(field, value)).toBe(status);
      const page = { ...basePage, [field]: value };
      const matches = seoRules.filter((rule) => rule.id === missing || rule.id === short || rule.id === long)
        .filter((rule) => rule.check(page, {} as never)).map((rule) => rule.id);
      expect(matches).toEqual(expectedIssue ? [expectedIssue] : []);
    }
  });

  it('flags an 80-character description as short in both Popup and SEO Audit', () => {
    const metaDescription = 'x'.repeat(80);
    expect(metadataLengthStatus('metaDescription', metaDescription)).toBe('short');
    const page = { ...basePage, metaDescription };
    expect(seoRules.find((rule) => rule.id === 'META_002')?.check(page, {} as never)).toBe(true);
  });

  it('uses JavaScript string length for Emoji, as the Audit does', () => {
    expect('🙂'.length).toBe(2);
    expect(metadataLengthStatus('title', '🙂'.repeat(15))).toBe('in-range');
    expect(metadataLengthStatus('title', '🙂'.repeat(31))).toBe('long');
  });
});
