import type { AiFixRequest, AiFixResponse } from '../types/aiFix';
import { generateSeoFixMock } from './generateSeoFix.mock';

/**
 * Single service entry point for UI consumers. Swap the provider here when the
 * product is connected to a real AI API; components stay unchanged.
 */
export function generateSeoFix(request: AiFixRequest): Promise<AiFixResponse> {
  return generateSeoFixMock(request);
}
