export type ActivationState = {
  onboardingSeenAt?: number;
  firstScanCompletedAt?: number;
};

type ActivationKey = keyof ActivationState;
const pendingWrites = new Map<ActivationKey, Promise<number>>();

function validTimestamp(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

export async function loadActivationState(): Promise<ActivationState> {
  const values = await chrome.storage.local.get(['onboardingSeenAt', 'firstScanCompletedAt']);
  return {
    onboardingSeenAt: validTimestamp(values.onboardingSeenAt),
    firstScanCompletedAt: validTimestamp(values.firstScanCompletedAt)
  };
}

export function scanActivationProperties(state: ActivationState): { is_first_scan: boolean; onboarding_seen: boolean } {
  return {
    is_first_scan: !state.firstScanCompletedAt,
    onboarding_seen: Boolean(state.onboardingSeenAt)
  };
}

function recordOnce(key: ActivationKey, timestamp: number): Promise<number> {
  const pending = pendingWrites.get(key);
  if (pending) return pending;
  const write = (async () => {
    const values = await chrome.storage.local.get(key);
    const existing = validTimestamp(values[key]);
    if (existing) return existing;
    await chrome.storage.local.set({ [key]: timestamp });
    return timestamp;
  })();
  pendingWrites.set(key, write);
  void write.finally(() => pendingWrites.delete(key)).catch(() => undefined);
  return write;
}

export function recordOnboardingSeenAt(timestamp = Date.now()): Promise<number> {
  return recordOnce('onboardingSeenAt', timestamp);
}

export function recordFirstScanCompletedAt(timestamp = Date.now()): Promise<number> {
  return recordOnce('firstScanCompletedAt', timestamp);
}
