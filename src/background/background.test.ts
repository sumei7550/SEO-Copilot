import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type InstallListener = (details: { reason: string }) => void;
let installed: InstallListener;
let create: ReturnType<typeof vi.fn>;
let set: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.resetModules();
  create = vi.fn().mockResolvedValue({ id: 7 });
  set = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('chrome', {
    runtime: {
      onInstalled: { addListener: vi.fn((listener: InstallListener) => { installed = listener; }) },
      getURL: vi.fn((path: string) => `chrome-extension://test/${path}`)
    },
    action: { onClicked: { addListener: vi.fn() } },
    storage: { local: { set } },
    tabs: { create }
  });
  await import('./background');
});

afterEach(() => vi.unstubAllGlobals());

describe('Welcome install trigger', () => {
  it('opens the internal Welcome page only on a fresh install', () => {
    installed({ reason: 'install' });
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({ url: 'chrome-extension://test/welcome.html' });
    expect(set).toHaveBeenCalledOnce();
  });

  it.each(['update', 'chrome_update', 'shared_module_update'])('does not open Welcome for %s', (reason) => {
    installed({ reason });
    expect(create).not.toHaveBeenCalled();
    expect(set).toHaveBeenCalledOnce();
  });

  it('does not register a startup handler that could reopen Welcome', () => {
    expect((globalThis.chrome as unknown as { runtime: { onStartup?: unknown } }).runtime.onStartup).toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });
});
