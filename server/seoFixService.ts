import { requestDeepSeek, type DeepSeekConfig } from './deepseekClient.js';
import { validateRequest } from './requestValidation.js';
import type { SeoFixResult } from './types.js';

export async function generateSeoFix(body: unknown, bodyBytes?: number, config?: DeepSeekConfig): Promise<SeoFixResult> {
  const request = validateRequest(body, bodyBytes);
  return requestDeepSeek(request, config);
}
