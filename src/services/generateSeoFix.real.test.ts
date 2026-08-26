import { describe, expect, it, vi } from 'vitest';
import type { AiFixRequest } from '../types/aiFix';
import { generateSeoFixReal } from './generateSeoFix.real';

const request: AiFixRequest = {
  type: 'metaDescription', issueId: 'META_001', issueLabel: 'Missing meta description', currentValue: '',
  page: { title: 'SEO Copilot', metaDescription: '', h1: 'SEO Copilot' },
  context: {
    url: 'https://example.com/page', title: { current: 'SEO Copilot', length: 11, issueType: null },
    metaDescription: { current: '', length: 0 }, h1: ['SEO Copilot'], language: 'en', pageType: 'website',
    brand: { name: 'Example', source: 'hostname' },
    issue: { id: 'META_001', type: 'metaDescription', label: 'Missing meta description', severity: 'warning', impact: 5,
      diagnostic: { messageKey: 'message', impactKey: 'impact', solutionKey: 'solution' } },
  },
};

describe('generateSeoFixReal', () => {
  it('sends the Backend contract and normalizes recommendations for the UI', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ recommendations: [
      { content: 'A better description', rationale: 'It is clearer.' },
    ] }), { status: 200 }));

    await expect(generateSeoFixReal(request, { backendUrl: 'http://localhost:8787', fetchImpl })).resolves.toEqual({
      type: 'metaDescription', recommendations: [{ id: 'metaDescription-1', content: 'A better description', rationale: 'It is clearer.', highlights: [] }],
    });
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(fetchImpl.mock.calls[0][0]).toBe('http://localhost:8787/api/v1/seo-fixes');
    expect(body).toMatchObject({ issueType: 'meta-description', currentValue: '', title: 'SEO Copilot', meta: '', h1: 'SEO Copilot', url: request.context.url, brand: 'Example' });
    expect(body.pageContext).toEqual(request.context);
  });

  it('surfaces backend and empty-response failures', async () => {
    const backendError = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'Provider unavailable' } }), { status: 502 }));
    await expect(generateSeoFixReal(request, { backendUrl: 'http://backend', fetchImpl: backendError })).rejects.toThrow('Provider unavailable');

    const empty = vi.fn().mockResolvedValue(new Response(JSON.stringify({ recommendations: [] }), { status: 200 }));
    await expect(generateSeoFixReal(request, { backendUrl: 'http://backend', fetchImpl: empty })).rejects.toThrow('empty response');
  });

  it('rejects H1 because the Alpha Backend contract supports title and meta only', async () => {
    await expect(generateSeoFixReal({ ...request, type: 'h1' })).rejects.toThrow('H1');
  });
});
