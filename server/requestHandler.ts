import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateSeoFix } from './seoFixService.js';
import { SeoFixError } from './types.js';
import { getClientIp, getRedisRateLimiter } from './rateLimiter.js';
import { validateRequest } from './requestValidation.js';

type VercelCompatibleRequest = IncomingMessage & {
  body?: unknown;
};

export async function handleSeoFixRequest(
  req: VercelCompatibleRequest,
  res: ServerResponse,
  options: { checkPath?: boolean } = {},
) {
  const requestId = req.headers['x-request-id']?.toString() || randomUUID();
  const startTime = new Date();
  let issueType = 'unknown';
  let httpStatus = 500;
  let recommendationCount: number | null = null;
  let finalize: ((success?: boolean) => Promise<void>) | undefined;

  try {
    const path = req.url?.split('?')[0];
    if (req.method === 'OPTIONS' && (!options.checkPath || path === '/api/v1/seo-fixes')) {
      httpStatus = 204;
      return writeCorsPreflight(res);
    }
    if (req.method !== 'POST' || (options.checkPath && path !== '/api/v1/seo-fixes')) {
      httpStatus = 404;
      return writeError(res, requestId, httpStatus, 'INVALID_REQUEST', 'Not found.');
    }

    const body = await readJson(req);
    issueType = getLoggableIssueType(body.value);
    const validated = validateRequest(body.value, body.bytes);
    finalize = await getRedisRateLimiter().reserve({ deviceId: validated.deviceId, ip: getClientIp(req) });
    const result = await generateSeoFix(validated, body.bytes);
    await finalize(true);
    httpStatus = 200;
    recommendationCount = result.recommendations.length;
    return writeJson(res, httpStatus, {
      requestId,
      recommendations: result.recommendations,
      model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
    });
  } catch (error) {
    if (finalize) await finalize(false).catch(() => undefined);
    const normalized = error instanceof SeoFixError
      ? error
      : new SeoFixError('AI_PROVIDER_ERROR', 'AI provider request failed.', true);
    const status = normalized.code === 'INVALID_REQUEST' ? 400
      : normalized.code === 'UNSUPPORTED_ISSUE_TYPE' ? 422
        : normalized.code === 'AI_TIMEOUT' ? 504
          : ['DAILY_QUOTA_EXCEEDED', 'RATE_LIMITED', 'SERVICE_LIMIT_REACHED'].includes(normalized.code) ? 429 : 502;
    httpStatus = status;
    return writeError(res, requestId, httpStatus, normalized.code, normalized.message, normalized.retryable);
  } finally {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[backend-request]', JSON.stringify({
        requestId,
        issueType,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        latencyMs: Date.now() - startTime.getTime(),
        httpStatus,
        model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
        recommendationCount,
      }));
    }
  }
}

async function readJson(req: VercelCompatibleRequest): Promise<{ value: unknown; bytes: number }> {
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > 8_192) throw new SeoFixError('INVALID_REQUEST', 'Request body is too large.');
    try {
      return { value: typeof req.body === 'string' ? JSON.parse(req.body) : req.body, bytes: Buffer.byteLength(raw) };
    } catch {
      throw new SeoFixError('INVALID_REQUEST', 'Request body must be valid JSON.');
    }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > 8_192) reject(new SeoFixError('INVALID_REQUEST', 'Request body is too large.'));
    });
    req.on('end', () => {
      try { resolve({ value: JSON.parse(raw), bytes: Buffer.byteLength(raw) }); }
      catch { reject(new SeoFixError('INVALID_REQUEST', 'Request body must be valid JSON.')); }
    });
    req.on('error', () => reject(new SeoFixError('INVALID_REQUEST', 'Unable to read request body.')));
  });
}

function getLoggableIssueType(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'unknown';
  const issueType = (value as Record<string, unknown>).issueType;
  return issueType === 'title' || issueType === 'meta-description' ? issueType : 'unknown';
}

function writeError(res: ServerResponse, requestId: string, status: number, code: string, message: string, retryable = false) {
  return writeJson(res, status, { requestId, error: { code, message, retryable } });
}

function writeJson(res: ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

function writeCorsPreflight(res: ServerResponse) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
    'Access-Control-Max-Age': '600',
  });
  res.end();
}
