import { buildSeoFixPrompt } from './promptBuilder.js';
import { SeoFixError, type SeoFixRequest, type SeoFixResult } from './types.js';
import { validateAiResponse } from './responseValidator.js';

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_TIMEOUT_MS = 10_000;

export interface DeepSeekConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export async function requestDeepSeek(request: SeoFixRequest, config: DeepSeekConfig = {}): Promise<SeoFixResult> {
  const apiKey = config.apiKey ?? process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new SeoFixError('AI_PROVIDER_ERROR', 'DeepSeek is not configured.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchImpl = config.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(`${config.baseUrl ?? process.env.DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: config.model ?? process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You produce concise, valid JSON only.' },
          { role: 'user', content: buildSeoFixPrompt(request) },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new SeoFixError('AI_PROVIDER_ERROR', 'DeepSeek request failed.', response.status >= 500 || response.status === 429);
    let payload: unknown;
    try { payload = await response.json(); } catch { throw new SeoFixError('AI_INVALID_OUTPUT', 'DeepSeek returned invalid JSON.'); }
    const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new SeoFixError('EMPTY_RESULT', 'DeepSeek returned an empty result.');
    let parsed: unknown;
    try { parsed = JSON.parse(content); } catch { throw new SeoFixError('AI_INVALID_OUTPUT', 'DeepSeek content is not valid JSON.'); }
    return validateAiResponse(parsed);
  } catch (error) {
    if (error instanceof SeoFixError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') throw new SeoFixError('AI_TIMEOUT', 'DeepSeek request timed out.', true);
    if (error instanceof Error && error.name === 'AbortError') throw new SeoFixError('AI_TIMEOUT', 'DeepSeek request timed out.', true);
    throw new SeoFixError('AI_PROVIDER_ERROR', 'DeepSeek request failed.', true);
  } finally { clearTimeout(timeout); }
}
