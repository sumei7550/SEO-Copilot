import { describe, expect, it, vi } from 'vitest';
import { requestDeepSeek } from './deepseekClient';

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
});
