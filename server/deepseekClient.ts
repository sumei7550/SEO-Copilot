import { buildSeoFixPrompt } from './promptBuilder.js';
import { SeoFixError, type SeoFixRequest, type SeoFixResult } from './types.js';
import { validateAiResponse } from './responseValidator.js';
import type { DiagnosticLogger } from './diagnosticLogger.js';

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_TIMEOUT_MS = 10_000;

export interface DeepSeekConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  diagnostics?: DiagnosticLogger;
}

export async function requestDeepSeek(request: SeoFixRequest, config: DeepSeekConfig = {}): Promise<SeoFixResult> {
  const apiKey = config.apiKey ?? process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    config.diagnostics?.emit('provider_request', 'failed', { errorType: 'provider_error', model: config.model ?? process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL });
    throw new SeoFixError('AI_PROVIDER_ERROR', 'DeepSeek is not configured.');
  }
  const started = Date.now();
  const diagnosticModel = config.model ?? process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
  config.diagnostics?.emit('provider_request', 'started', { model: diagnosticModel });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchImpl = config.fetchImpl ?? fetch;
  let fetchAttempted = false;
  let fetchSettled = false;
  try {
    const prompt = buildSeoFixPrompt(request);
    const requestBody = JSON.stringify({
      model: config.model ?? process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You produce concise, valid JSON only.' },
        { role: 'user', content: prompt },
      ],
    });
    fetchAttempted = true;
    const response = await fetchImpl(`${config.baseUrl ?? process.env.DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: requestBody,
      signal: controller.signal,
    });
    fetchSettled = true;
    config.diagnostics?.emit('provider_http', response.ok ? 'succeeded' : 'failed', {
      providerHttpStatus: response.status,
      durationMs: Date.now() - started,
      model: diagnosticModel,
      ...(!response.ok ? { errorType: 'provider_http_error' as const } : {}),
    });
    if (!response.ok) throw new SeoFixError('AI_PROVIDER_ERROR', 'DeepSeek request failed.', response.status >= 500 || response.status === 429);
    let payload: unknown;
    const parseStarted = Date.now();
    try { payload = await response.json(); } catch {
      config.diagnostics?.emit('provider_parse', 'failed', { durationMs: Date.now() - parseStarted, errorType: 'provider_invalid_json', model: diagnosticModel });
      throw new SeoFixError('AI_INVALID_OUTPUT', 'DeepSeek returned invalid JSON.');
    }
    const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      config.diagnostics?.emit('provider_parse', 'failed', { durationMs: Date.now() - parseStarted, errorType: 'provider_empty_result', model: diagnosticModel });
      throw new SeoFixError('EMPTY_RESULT', 'DeepSeek returned an empty result.');
    }
    let parsed: unknown;
    try { parsed = JSON.parse(content); } catch {
      config.diagnostics?.emit('provider_parse', 'failed', { durationMs: Date.now() - parseStarted, errorType: 'provider_invalid_json', model: diagnosticModel });
      throw new SeoFixError('AI_INVALID_OUTPUT', 'DeepSeek content is not valid JSON.');
    }
    try {
      const result = validateAiResponse(parsed);
      config.diagnostics?.emit('provider_parse', 'succeeded', { durationMs: Date.now() - parseStarted, model: diagnosticModel });
      return result;
    } catch (error) {
      config.diagnostics?.emit('provider_parse', 'failed', { durationMs: Date.now() - parseStarted, errorType: 'provider_invalid_output', model: diagnosticModel });
      throw error;
    }
  } catch (error) {
    if (!fetchAttempted) {
      config.diagnostics?.emit('provider_request', 'failed', { durationMs: Date.now() - started, errorType: 'provider_error', model: diagnosticModel });
    } else if (!fetchSettled) {
      config.diagnostics?.emit('provider_http', 'failed', {
        durationMs: Date.now() - started,
        errorType: error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network_error',
        model: diagnosticModel,
      });
    }
    if (error instanceof SeoFixError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') throw new SeoFixError('AI_TIMEOUT', 'DeepSeek request timed out.', true);
    if (error instanceof Error && error.name === 'AbortError') throw new SeoFixError('AI_TIMEOUT', 'DeepSeek request timed out.', true);
    throw new SeoFixError('AI_PROVIDER_ERROR', 'DeepSeek request failed.', true);
  } finally { clearTimeout(timeout); }
}
