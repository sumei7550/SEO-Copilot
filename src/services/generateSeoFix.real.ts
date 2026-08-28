import type { AiFixRequest, AiFixResponse, Recommendation } from '../types/aiFix';

const DEFAULT_TIMEOUT_MS = 10_000;

type KnownAiErrorCode =
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_ISSUE_TYPE'
  | 'AI_TIMEOUT'
  | 'AI_PROVIDER_ERROR'
  | 'AI_INVALID_OUTPUT'
  | 'EMPTY_RESULT'
  | 'DAILY_QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'SERVICE_LIMIT_REACHED';

/** Backend codes are preserved even when a newer code is not known by this UI. */
export type AiErrorCode = KnownAiErrorCode | (string & {});

export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: AiErrorCode,
    public readonly retryAfter?: number,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'AiServiceError';
  }
}

class BackendResponseError extends AiServiceError {}

interface BackendRecommendation {
  content?: unknown;
  rationale?: unknown;
}

interface BackendResponse {
  recommendations?: BackendRecommendation[];
  error?: { message?: unknown; code?: unknown; retryAfter?: unknown; retryAfterSeconds?: unknown };
}

export interface RealProviderOptions {
  backendUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  deviceId?: string;
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
  const deviceId = options.deviceId ?? await getDeviceId();
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
        deviceId,
      }),
      signal: controller.signal,
    });

    const payload = await readJson(response);
    if (!response.ok) {
      const code = typeof payload.error?.code === 'string' ? payload.error.code : undefined;
      const message = code === 'DAILY_QUOTA_EXCEEDED' ? "Today's free AI limit has been reached. Try again tomorrow." : typeof payload.error?.message === 'string' ? payload.error.message : 'SEO Copilot backend request failed.';
      const retryAfter = toRetrySeconds(payload.error?.retryAfter);
      const retryAfterSeconds = toRetrySeconds(payload.error?.retryAfterSeconds);
      const headerRetryAfter = toHeaderRetrySeconds(response.headers.get('Retry-After'));
      throw new BackendResponseError(message, code, retryAfter ?? headerRetryAfter, retryAfterSeconds);
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

let deviceIdPromise: Promise<string> | undefined;
async function getDeviceId(): Promise<string> {
  if (deviceIdPromise) return deviceIdPromise;
  deviceIdPromise = createDeviceId();
  return deviceIdPromise;
}

async function createDeviceId(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const stored = await chrome.storage.local.get('deviceId');
    if (typeof stored.deviceId === 'string' && /^[a-zA-Z0-9_-]{16,128}$/.test(stored.deviceId)) return stored.deviceId;
    const deviceId = crypto.randomUUID();
    await chrome.storage.local.set({ deviceId });
    return deviceId;
  }
  return crypto.randomUUID();
}

async function readJson(response: Response): Promise<BackendResponse> {
  let value: unknown;
  try { value = await response.json(); } catch { throw new Error('SEO Copilot backend returned an empty response.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('SEO Copilot backend returned an empty response.');
  return value as BackendResponse;
}

function toRetrySeconds(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return Math.ceil(value);
  if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value.trim())) return Math.ceil(Number(value));
  return undefined;
}

function toHeaderRetrySeconds(value: string | null): number | undefined {
  const deltaSeconds = toRetrySeconds(value);
  if (deltaSeconds !== undefined) return deltaSeconds;
  if (!value) return undefined;
  const retryAt = Date.parse(value);
  return Number.isNaN(retryAt) ? undefined : Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
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
