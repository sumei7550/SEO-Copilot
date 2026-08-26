import type { AiFixRequest, AiFixResponse } from '../types/aiFix';
import { getAiProviderForRequest } from './aiProvider';

/**
 * Single service entry point for UI consumers. Components do not know which
 * provider is configured.
 */
export function generateSeoFix(request: AiFixRequest): Promise<AiFixResponse> {
  return getAiProviderForRequest(request).generate(request);
}
