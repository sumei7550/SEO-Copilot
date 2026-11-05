import { describe, expect, it, vi } from 'vitest';
import { requestDeepSeek } from './deepseekClient';
import { createDiagnosticLogger } from './diagnosticLogger';

const request = { issueType: 'title', currentValue: 'Old', title: 'Title', meta: 'Meta', h1: 'H1', url: 'https://example.com', pageContext: { language: 'en' } } as const;

describe('requestDeepSeek', () => {
  it('sends the structured prompt and validates the JSON output', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"recommendations":[{"content":"New title","rationale":"Clearer"}]}' } }] }), { status: 200 }));
    const result = await requestDeepSeek(request, { apiKey: 'test-key', fetchImpl });
    expect(result.recommendations[0].content).toBe('New title');
    expect(fetchImpl.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer test-key' });
    expect(JSON.stringify(fetchImpl.mock.calls[0][1])).toContain('Page context');
  });
  it('maps aborts to AI_TIMEOUT', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError'));
    await expect(requestDeepSeek(request, { apiKey: 'test-key', fetchImpl })).rejects.toThrowError(expect.objectContaining({ code: 'AI_TIMEOUT' }));
  });
  it('records Provider HTTP and parse stages without response or prompt content', async () => {
    const lines: Array<Record<string, unknown>> = [];
    const info = vi.spyOn(console, 'info').mockImplementation((_prefix, serialized) => lines.push(JSON.parse(String(serialized))));
    try {
      const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"recommendations":[{"content":"PRIVATE_RESULT","rationale":"Reason"}]}' } }] }), { status: 200 }));
      await requestDeepSeek(request, { apiKey: 'SECRET_KEY', fetchImpl, diagnostics: createDiagnosticLogger('provider-test') });
      expect(lines.map((line) => line.stage)).toEqual(['provider_request', 'provider_http', 'provider_parse']);
      expect(lines.every((line) => line.requestId === 'provider-test')).toBe(true);
      expect(lines[1]).toMatchObject({ providerHttpStatus: 200, outcome: 'succeeded' });
      expect(JSON.stringify(lines)).not.toMatch(/SECRET_KEY|PRIVATE_RESULT|Page context|Authorization|Cookie/);
    } finally { info.mockRestore(); }
  });
  it('records upstream status and parse failures as distinct stages', async () => {
    const lines: Array<Record<string, unknown>> = [];
    const info = vi.spyOn(console, 'info').mockImplementation((_prefix, serialized) => lines.push(JSON.parse(String(serialized))));
    try {
      await expect(requestDeepSeek(request, { apiKey: 'test-key', fetchImpl: vi.fn().mockResolvedValue(new Response('secret provider body', { status: 429 })), diagnostics: createDiagnosticLogger('http-test') })).rejects.toThrow();
      expect(lines.at(-1)).toMatchObject({ stage: 'provider_http', providerHttpStatus: 429, outcome: 'failed' });
      expect(JSON.stringify(lines)).not.toContain('secret provider body');
      lines.length = 0;
      await expect(requestDeepSeek(request, { apiKey: 'test-key', fetchImpl: vi.fn().mockResolvedValue(new Response('{bad json', { status: 200 })), diagnostics: createDiagnosticLogger('parse-test') })).rejects.toThrow();
      expect(lines.at(-1)).toMatchObject({ stage: 'provider_parse', outcome: 'failed', errorType: 'provider_invalid_json' });
    } finally { info.mockRestore(); }
  });
  it('records a network failure without an invented HTTP status', async () => {
    const lines: Array<Record<string, unknown>> = [];
    const info = vi.spyOn(console, 'info').mockImplementation((_prefix, serialized) => lines.push(JSON.parse(String(serialized))));
    try {
      await expect(requestDeepSeek(request, { apiKey: 'test-key', fetchImpl: vi.fn().mockRejectedValue(new TypeError('secret endpoint detail')), diagnostics: createDiagnosticLogger('network-test') })).rejects.toThrow();
      expect(lines.at(-1)).toMatchObject({ stage: 'provider_http', outcome: 'failed', errorType: 'network_error' });
      expect(lines.at(-1)).not.toHaveProperty('providerHttpStatus');
      expect(JSON.stringify(lines)).not.toContain('secret endpoint detail');
    } finally { info.mockRestore(); }
  });
});
