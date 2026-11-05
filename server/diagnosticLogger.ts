import { SeoFixError } from './types.js';

export type DiagnosticStage =
  | 'request_entered' | 'request_rejected' | 'validation' | 'rate_limit_reserve'
  | 'provider_request' | 'provider_http' | 'provider_parse'
  | 'rate_limit_finalize' | 'request_completed' | 'request_failed';
export type DiagnosticOutcome = 'started' | 'succeeded' | 'failed';
export type DiagnosticErrorType =
  | 'validation_error' | 'rate_limit_error' | 'network_error' | 'timeout'
  | 'provider_error' | 'provider_http_error' | 'provider_invalid_json' | 'provider_empty_result'
  | 'provider_invalid_output' | 'unhandled_error';

export interface DiagnosticFields {
  httpStatus?: number;
  providerHttpStatus?: number;
  durationMs?: number;
  errorType?: DiagnosticErrorType;
  errorCode?: string;
  finalizeAction?: 'commit' | 'release';
  failedStage?: DiagnosticStage;
  model?: string;
}

export interface DiagnosticLogger {
  emit(stage: DiagnosticStage, outcome: DiagnosticOutcome, fields?: DiagnosticFields): void;
}

const provider = 'deepseek';
const model = () => process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

export function createDiagnosticLogger(requestId: string, vercelId?: string | string[]): DiagnosticLogger {
  const candidate = Array.isArray(vercelId) ? vercelId[0] : vercelId;
  const safeVercelId = candidate && /^[a-zA-Z0-9:_-]{1,160}$/.test(candidate) ? candidate : undefined;
  return {
    emit(stage, outcome, fields = {}) {
      try {
        console.info('[ai-fix-diagnostic]', JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          ...(safeVercelId ? { vercelId: safeVercelId } : {}),
          environment: process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview'
            ? process.env.VERCEL_ENV : process.env.NODE_ENV === 'production' ? 'production' : 'development',
          stage,
          outcome,
          provider,
          model: fields.model ?? model(),
          ...fields,
        }));
      } catch {
        // Diagnostics must never change the API outcome.
      }
    },
  };
}

export function classifyDiagnosticError(error: unknown): DiagnosticErrorType {
  if (error instanceof SeoFixError) {
    if (error.code === 'INVALID_REQUEST' || error.code === 'UNSUPPORTED_ISSUE_TYPE') return 'validation_error';
    if (error.code === 'RATE_LIMITED' || error.code === 'DAILY_QUOTA_EXCEEDED' || error.code === 'SERVICE_LIMIT_REACHED') return 'rate_limit_error';
    if (error.code === 'AI_TIMEOUT') return 'timeout';
    if (error.code === 'AI_INVALID_OUTPUT') return 'provider_invalid_output';
    if (error.code === 'EMPTY_RESULT') return 'provider_empty_result';
    return 'provider_error';
  }
  if (error instanceof Error && error.name === 'AbortError') return 'timeout';
  if (error instanceof TypeError) return 'network_error';
  return 'unhandled_error';
}
