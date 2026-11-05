import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDiagnosticLogger } from './diagnosticLogger';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('AI Fix diagnostic logger', () => {
  it('emits only explicit safe fields with request and Vercel correlation IDs', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    createDiagnosticLogger('request-123', 'sin1::iad1::test').emit('provider_http', 'failed', {
      providerHttpStatus: 429, durationMs: 42, errorType: 'provider_http_error',
    });
    const line = info.mock.calls[0].join(' ');
    const payload = JSON.parse(info.mock.calls[0][1] as string);
    expect(payload).toMatchObject({ requestId: 'request-123', vercelId: 'sin1::iad1::test', environment: 'preview', stage: 'provider_http', provider: 'deepseek', providerHttpStatus: 429 });
    expect(line).not.toMatch(/Authorization|Cookie|apiKey|pageContext|currentValue|Prompt|stack/);
  });

  it('does not emit unsafe Vercel IDs or interrupt a request when logging throws', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => { throw new Error('logger unavailable'); });
    const diagnostics = createDiagnosticLogger('request-123', 'bad\nvalue');
    expect(() => diagnostics.emit('request_entered', 'started')).not.toThrow();
    expect(info).toHaveBeenCalledOnce();
  });
});
