import type { AiFixRequest, AiFixResponse, Recommendation } from '../types/aiFix';

const DEFAULT_TIMEOUT_MS = 10_000;

class BackendResponseError extends Error {}

interface BackendRecommendation {
  content?: unknown;
  rationale?: unknown;
}

interface BackendResponse {
  recommendations?: BackendRecommendation[];
  error?: { message?: unknown };
}

export interface RealProviderOptions {
  backendUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/** Calls the Backend proxy. DeepSeek credentials and provider URLs never enter the extension. */
export async function generateSeoFixReal(request: AiFixRequest, options: RealProviderOptions = {}): Promise<AiFixResponse> {
  if (request.type === 'h1') {
    throw new Error('AI fixes for H1 are not supported by the real provider yet.');
  }

  const backendUrl = options.backendUrl ?? import.meta.env.VITE_SEO_COPILOT_BACKEND_URL;
  if (!backendUrl) throw new Error('SEO Copilot backend is not configured.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(`${backendUrl.replace(/\/$/, '')}/api/v1/seo-fixes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issueType: request.type === 'metaDescription' ? 'meta-description' : 'title',
        currentValue: request.currentValue,
        title: request.page.title,
        meta: request.page.metaDescription,
        h1: request.page.h1,
        url: request.context.url,
        brand: request.context.brand.name,
        pageContext: request.context,
      }),
      signal: controller.signal,
    });

    const payload = await readJson(response);
    if (!response.ok) {
      const message = typeof payload.error?.message === 'string' ? payload.error.message : 'SEO Copilot backend request failed.';
      throw new BackendResponseError(message);
    }
    return normalizeResponse(request.type, payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('SEO Copilot backend request timed out.');
    if (error instanceof BackendResponseError) throw error;
    if (error instanceof Error && error.message.includes('empty response')) throw error;
    throw new Error('Unable to reach the SEO Copilot backend.');
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson(response: Response): Promise<BackendResponse> {
  let value: unknown;
  try { value = await response.json(); } catch { throw new Error('SEO Copilot backend returned an empty response.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('SEO Copilot backend returned an empty response.');
  return value as BackendResponse;
}

function normalizeResponse(type: AiFixRequest['type'], payload: BackendResponse): AiFixResponse {
  if (!Array.isArray(payload.recommendations) || payload.recommendations.length === 0) {
    throw new Error('SEO Copilot backend returned an empty response.');
  }
  const recommendations: Recommendation[] = payload.recommendations
    .map((item, index) => ({
      id: `${type}-${index + 1}`,
      content: typeof item.content === 'string' ? item.content.trim() : '',
      rationale: typeof item.rationale === 'string' ? item.rationale.trim() : '',
      highlights: [],
    }))
    .filter((item) => item.content.length > 0 && item.rationale.length > 0);
  if (recommendations.length === 0) throw new Error('SEO Copilot backend returned an empty response.');
  return { type, recommendations };
}
