import { createServer } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  reserve: vi.fn(),
  generate: vi.fn(),
}));
vi.mock('./rateLimiter.js', () => ({
  getRedisRateLimiter: () => ({ reserve: mocks.reserve }),
  getClientIp: () => '127.0.0.1',
}));
vi.mock('./seoFixService.js', () => ({ generateSeoFix: mocks.generate }));

import { handleSeoFixRequest } from './requestHandler';

const body = {
  deviceId: '0123456789abcdef0123456789abcdef', issueType: 'title',
  currentValue: 'SECRET_PAGE_CONTENT', title: 'SECRET_TITLE', meta: 'SECRET_META',
  h1: 'SECRET_H1', url: 'https://example.com/secret',
  pageContext: { page: 'SECRET_CONTEXT' },
};
let lines: Array<Record<string, unknown>>;
let info: ReturnType<typeof vi.spyOn>;

async function invoke(payload: unknown = body) {
  const server = createServer((req, res) => { void handleSeoFixRequest(req, res); });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('missing test port');
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/seo-fixes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-request-id': 'request-123', 'x-vercel-id': 'sin1::iad1::test' },
      body: JSON.stringify(payload),
    });
    return { status: response.status, json: await response.json() as Record<string, unknown> };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('VERCEL_ENV', 'production');
  lines = [];
  info = vi.spyOn(console, 'info').mockImplementation((_prefix, serialized) => { lines.push(JSON.parse(String(serialized))); });
  mocks.reserve.mockResolvedValue(vi.fn().mockResolvedValue(undefined));
  mocks.generate.mockImplementation(async (_request, _bytes, config) => {
    config.diagnostics.emit('provider_request', 'started');
    config.diagnostics.emit('provider_http', 'succeeded', { providerHttpStatus: 200 });
    config.diagnostics.emit('provider_parse', 'succeeded');
    return { recommendations: [{ content: 'New title', rationale: 'Clearer' }] };
  });
});

afterEach(() => {
  info.mockRestore();
  vi.unstubAllEnvs();
});

describe('AI Fix request diagnostics', () => {
  it('tracks every successful stage with one requestId and no page data', async () => {
    const result = await invoke();
    expect(result.status).toBe(200);
    expect(result.json.requestId).toBe('request-123');
    expect(lines.map((line) => line.stage)).toEqual([
      'request_entered', 'validation', 'validation', 'rate_limit_reserve', 'rate_limit_reserve',
      'provider_request', 'provider_http', 'provider_parse', 'rate_limit_finalize', 'rate_limit_finalize', 'request_completed',
    ]);
    expect(lines.every((line) => line.requestId === 'request-123' && line.environment === 'production')).toBe(true);
    expect(JSON.stringify(lines)).not.toMatch(/SECRET_|example\.com|Authorization|Cookie|apiKey|Prompt/);
  });

  it('records validation failure and preserves the client error shape', async () => {
    const result = await invoke({ ...body, title: 123 });
    expect(result.status).toBe(400);
    expect(result.json).toEqual({ requestId: 'request-123', error: { code: 'INVALID_REQUEST', message: 'title is required and must be within its length limit.', retryable: false } });
    expect(lines.at(-1)).toMatchObject({ stage: 'request_failed', failedStage: 'validation', httpStatus: 400 });
    expect(mocks.reserve).not.toHaveBeenCalled();
  });

  it('identifies reserve failure before the Provider starts', async () => {
    mocks.reserve.mockRejectedValue(new Error('secret Redis URL'));
    const result = await invoke();
    expect(result.status).toBe(502);
    expect(lines.at(-1)).toMatchObject({ stage: 'request_failed', failedStage: 'rate_limit_reserve' });
    expect(lines).toContainEqual(expect.objectContaining({ stage: 'rate_limit_reserve', outcome: 'failed', errorType: 'rate_limit_error' }));
    expect(JSON.stringify(lines)).not.toContain('secret Redis URL');
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it('labels a post-Provider commit failure as rate limit finalization', async () => {
    mocks.reserve.mockResolvedValue(vi.fn().mockRejectedValue(new Error('secret Redis URL')));
    const result = await invoke();
    expect(result.status).toBe(502);
    expect(result.json).toEqual({ requestId: 'request-123', error: { code: 'AI_PROVIDER_ERROR', message: 'AI provider request failed.', retryable: true } });
    expect(lines).toContainEqual(expect.objectContaining({ stage: 'provider_parse', outcome: 'succeeded' }));
    expect(lines).toContainEqual(expect.objectContaining({ stage: 'rate_limit_finalize', outcome: 'failed', finalizeAction: 'commit' }));
    expect(lines.at(-1)).toMatchObject({ stage: 'request_failed', failedStage: 'rate_limit_finalize' });
    expect(lines).not.toContainEqual(expect.objectContaining({ stage: 'rate_limit_finalize', finalizeAction: 'release', outcome: 'succeeded' }));
  });

  it('records Provider failure and a separate release failure', async () => {
    mocks.generate.mockRejectedValue(new Error('secret upstream detail'));
    mocks.reserve.mockResolvedValue(vi.fn().mockRejectedValue(new Error('secret Redis URL')));
    const result = await invoke();
    expect(result.status).toBe(502);
    expect(lines).toContainEqual(expect.objectContaining({ stage: 'rate_limit_finalize', finalizeAction: 'release', outcome: 'failed' }));
    expect(lines.at(-1)).toMatchObject({ stage: 'request_failed', failedStage: 'provider_request' });
    expect(JSON.stringify(lines)).not.toMatch(/secret upstream detail|secret Redis URL/);
  });

  it('keeps the business result when the log writer throws', async () => {
    info.mockImplementation(() => { throw new Error('logger unavailable'); });
    const result = await invoke();
    expect(result.status).toBe(200);
    expect(result.json).toEqual({ requestId: 'request-123', recommendations: [{ content: 'New title', rationale: 'Clearer' }], model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat' });
  });
});
