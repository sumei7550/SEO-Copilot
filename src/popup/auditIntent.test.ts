import { describe, expect, it } from 'vitest';
import { resolveIssueTarget } from './auditIntent';

describe('Popup issue target priority', () => {
  it('chooses the first available real Issue from the ordered candidates', () => {
    expect(resolveIssueTarget(['IMAGE_001', 'IMAGE_002'], ['IMAGE_002'])).toBe('IMAGE_002');
    expect(resolveIssueTarget(['IMAGE_001', 'IMAGE_002'], ['IMAGE_001', 'IMAGE_002'])).toBe('IMAGE_001');
    expect(resolveIssueTarget(['IMAGE_001', 'IMAGE_002'], [])).toBeUndefined();
  });
});
