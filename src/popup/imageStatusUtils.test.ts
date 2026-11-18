import { describe, expect, it } from 'vitest';
import { imageCooldownUntil, imageStatusKind, imageStatusSource, normalizeImageStatusUrl, restoreFreshImageStatuses } from './imageStatusUtils';

describe('image status cache rules', () => {
  it('normalizes away fragments while preserving query parameters', () => {
    expect(normalizeImageStatusUrl('https://cdn.example/image.png?size=1#preview')).toBe('https://cdn.example/image.png?size=1');
    expect(normalizeImageStatusUrl('https://cdn.example/image.png?size=2')).not.toBe(normalizeImageStatusUrl('https://cdn.example/image.png?size=1'));
  });

  it('restores only timestamped statuses within the five minute TTL', () => {
    const now = 1_000_000;
    const records = restoreFreshImageStatuses({
      fresh: { kind: 'ok', code: 200, checkedAt: now - 299_999 },
      expired: { kind: 'ok', code: 200, checkedAt: now - 300_000 },
      legacy: { kind: 'ok', code: 200 },
    }, now);
    expect(records).toHaveProperty('fresh');
    expect(records).not.toHaveProperty('expired');
    expect(records).not.toHaveProperty('legacy');
  });

  it('never labels expired results as just checked', () => {
    const status = { kind: 'ok' as const, code: 200, checkedAt: 1_000 };
    expect(imageStatusKind(status, 301_000)).toBe('unchecked');
    expect(imageStatusSource(status, 301_000)).toBe('previous');
    expect(imageStatusSource(status, 1_001, true)).toBe('previous');
  });

  it('uses Retry-After seconds and HTTP dates, with a 30 second default', () => {
    const receivedAt = Date.UTC(2026, 10, 17, 12, 0, 0);
    expect(imageCooldownUntil('45', receivedAt)).toBe(receivedAt + 45_000);
    expect(imageCooldownUntil(new Date(receivedAt + 90_000).toUTCString(), receivedAt)).toBe(receivedAt + 90_000);
    expect(imageCooldownUntil(undefined, receivedAt)).toBe(receivedAt + 30_000);
  });
});
