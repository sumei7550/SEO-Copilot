import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeWelcomeTab } from './navigation';

afterEach(() => vi.unstubAllGlobals());

describe('Welcome CTA', () => {
  it('only closes the Welcome tab; it never scans or requests site access', async () => {
    const getCurrent = vi.fn().mockResolvedValue({ id: 12 });
    const remove = vi.fn().mockResolvedValue(undefined);
    const request = vi.fn();
    const sendMessage = vi.fn();
    vi.stubGlobal('chrome', { tabs: { getCurrent, remove, sendMessage }, permissions: { request } });

    await closeWelcomeTab();
    expect(remove).toHaveBeenCalledWith(12);
    expect(request).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('provides a recoverable error when Chrome cannot identify the Welcome tab', async () => {
    vi.stubGlobal('chrome', { tabs: { getCurrent: vi.fn().mockResolvedValue(undefined), remove: vi.fn() } });
    await expect(closeWelcomeTab()).rejects.toThrow('welcome-tab-unavailable');
  });
});
