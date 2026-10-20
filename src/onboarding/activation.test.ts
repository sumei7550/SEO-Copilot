import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadActivationState, recordFirstScanCompletedAt, recordOnboardingSeenAt, scanActivationProperties } from './activation';

const values: Record<string, number> = {};
let set: ReturnType<typeof vi.fn>;

beforeEach(() => {
  for (const key of Object.keys(values)) delete values[key];
  set = vi.fn(async (next: Record<string, number>) => { Object.assign(values, next); });
  vi.stubGlobal('chrome', {
    storage: { local: {
      get: vi.fn(async () => ({ ...values })),
      set
    } }
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('first-use state', () => {
  it('records the first actual Welcome view once', async () => {
    expect(await recordOnboardingSeenAt(100)).toBe(100);
    expect(await recordOnboardingSeenAt(200)).toBe(100);
    expect(values.onboardingSeenAt).toBe(100);
    expect(set).toHaveBeenCalledOnce();
  });

  it('records first successful scan once and makes a later Tab non-first', async () => {
    const before = await loadActivationState();
    expect(scanActivationProperties(before)).toEqual({ is_first_scan: true, onboarding_seen: false });
    expect(await recordFirstScanCompletedAt(300)).toBe(300);
    const after = await loadActivationState();
    expect(scanActivationProperties(after).is_first_scan).toBe(false);
    // A new Tab may have scan_type="first", but the user's first scan is over.
    expect(await recordFirstScanCompletedAt(400)).toBe(300);
    expect(values.firstScanCompletedAt).toBe(300);
    expect(set).toHaveBeenCalledOnce();
  });

  it('reports onboarding seen independently of first scan', async () => {
    await recordOnboardingSeenAt(100);
    expect(scanActivationProperties(await loadActivationState())).toEqual({ is_first_scan: true, onboarding_seen: true });
  });

  it('does not overwrite timestamps that already exist in storage', async () => {
    values.onboardingSeenAt = 10;
    values.firstScanCompletedAt = 20;
    expect(await recordOnboardingSeenAt(100)).toBe(10);
    expect(await recordFirstScanCompletedAt(200)).toBe(20);
    expect(set).not.toHaveBeenCalled();
  });
});
