import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateSeoFix } from './seoFixService.js';
import { SeoFixError } from './types.js';
import { getClientIp, getRedisRateLimiter } from './rateLimiter.js';
import { validateRequest } from './requestValidation.js';
import { classifyDiagnosticError, createDiagnosticLogger, type DiagnosticLogger, type DiagnosticStage } from './diagnosticLogger.js';

type VercelCompatibleRequest = IncomingMessage & {
  body?: unknown;
};

export async function handleSeoFixRequest(
  req: VercelCompatibleRequest,
  res: ServerResponse,
  options: { checkPath?: boolean } = {},
) {
  const requestId = req.headers['x-request-id']?.toString() || randomUUID();
  const started = Date.now();
  const diagnostics = createDiagnosticLogger(requestId, req.headers['x-vercel-id']);
  let stage: DiagnosticStage = 'request_entered';
  let stageStarted = started;
  let httpStatus = 500;
  let finalize: ((success?: boolean) => Promise<void>) | undefined;

  try {
    diagnostics.emit('request_entered', 'started');
    const path = req.url?.split('?')[0];
    if (req.method === 'OPTIONS' && (!options.checkPath || path === '/api/v1/seo-fixes')) {
      httpStatus = 204;
      diagnostics.emit('request_completed', 'succeeded', { httpStatus, durationMs: Date.now() - started });
      return writeCorsPreflight(res);
    }
    if (req.method !== 'POST' || (options.checkPath && path !== '/api/v1/seo-fixes')) {
      httpStatus = 404;
      diagnostics.emit('request_rejected', 'failed', { httpStatus, errorCode: 'INVALID_REQUEST' });
      return writeError(res, requestId, httpStatus, 'INVALID_REQUEST', 'Not found.');
    }

    stage = 'validation';
    stageStarted = Date.now();
    diagnostics.emit('validation', 'started');
    const body = await readJson(req);
    const validated = validateRequest(body.value, body.bytes);
    diagnostics.emit('validation', 'succeeded', { durationMs: Date.now() - stageStarted });
    stage = 'rate_limit_reserve';
    const reserveStarted = Date.now();
    diagnostics.emit('rate_limit_reserve', 'started');
    try {
      finalize = await getRedisRateLimiter().reserve({ deviceId: validated.deviceId, ip: getClientIp(req) });
      diagnostics.emit('rate_limit_reserve', 'succeeded', { durationMs: Date.now() - reserveStarted });
    } catch (error) {
      diagnostics.emit('rate_limit_reserve', 'failed', { durationMs: Date.now() - reserveStarted, errorType: 'rate_limit_error' });
      throw error;
    }
    stage = 'provider_request';
    const providerDiagnostics: DiagnosticLogger = {
      emit(providerStage, outcome, fields) {
        stage = providerStage;
        diagnostics.emit(providerStage, outcome, fields);
      },
    };
    const result = await generateSeoFix(validated, body.bytes, { diagnostics: providerDiagnostics });
    stage = 'rate_limit_finalize';
    const finalizeStarted = Date.now();
    diagnostics.emit('rate_limit_finalize', 'started', { finalizeAction: 'commit' });
    try {
      await finalize(true);
      diagnostics.emit('rate_limit_finalize', 'succeeded', { finalizeAction: 'commit', durationMs: Date.now() - finalizeStarted });
    } catch (error) {
      diagnostics.emit('rate_limit_finalize', 'failed', { finalizeAction: 'commit', durationMs: Date.now() - finalizeStarted, errorType: 'rate_limit_error' });
      throw error;
    }
    httpStatus = 200;
    diagnostics.emit('request_completed', 'succeeded', { httpStatus, durationMs: Date.now() - started });
    return writeJson(res, httpStatus, {
      requestId,
      recommendations: result.recommendations,
      model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
    });
  } catch (error) {
    const failedStage = stage;
    if (finalize) {
      if (failedStage === 'rate_limit_finalize') {
        // Keep the existing cleanup call, but do not claim a release: the limiter may have already marked it finalized.
        await finalize(false).catch(() => undefined);
      } else {
        const finalizeStarted = Date.now();
        diagnostics.emit('rate_limit_finalize', 'started', { finalizeAction: 'release' });
        await finalize(false).then(
          () => diagnostics.emit('rate_limit_finalize', 'succeeded', { finalizeAction: 'release', durationMs: Date.now() - finalizeStarted }),
          () => diagnostics.emit('rate_limit_finalize', 'failed', { finalizeAction: 'release', durationMs: Date.now() - finalizeStarted, errorType: 'rate_limit_error' }),
        );
      }
    }
    const normalized = error instanceof SeoFixError
      ? error
      : new SeoFixError('AI_PROVIDER_ERROR', 'AI provider request failed.', true);
    const status = normalized.code === 'INVALID_REQUEST' ? 400
      : normalized.code === 'UNSUPPORTED_ISSUE_TYPE' ? 422
        : normalized.code === 'AI_TIMEOUT' ? 504
          : ['DAILY_QUOTA_EXCEEDED', 'RATE_LIMITED', 'SERVICE_LIMIT_REACHED'].includes(normalized.code) ? 429 : 502;
    httpStatus = status;
    if (failedStage === 'validation') diagnostics.emit('validation', 'failed', { durationMs: Date.now() - stageStarted, errorType: classifyDiagnosticError(error), errorCode: normalized.code });
    diagnostics.emit('request_failed', 'failed', { failedStage, httpStatus, durationMs: Date.now() - started, errorType: failedStage === 'rate_limit_reserve' || failedStage === 'rate_limit_finalize' ? 'rate_limit_error' : classifyDiagnosticError(error), errorCode: normalized.code });
    return writeError(res, requestId, httpStatus, normalized.code, normalized.message, normalized.retryable);
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
