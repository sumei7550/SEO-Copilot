import type { AiFixRequest, AiFixResponse } from '../types/aiFix';
import { generateSeoFixMock } from './generateSeoFix.mock';
import { generateSeoFixReal } from './generateSeoFix.real';

export type AiProviderMode = 'mock' | 'real';

export interface AiProvider {
  generate(request: AiFixRequest): Promise<AiFixResponse>;
}

const mockProvider: AiProvider = { generate: generateSeoFixMock };
const realProvider: AiProvider = { generate: generateSeoFixReal };

export function getAiProvider(mode: AiProviderMode = getConfiguredProviderMode()): AiProvider {
  return mode === 'real' ? realProvider : mockProvider;
}

/** H1 remains on Mock until the Backend contract supports it. */
export function getAiProviderForRequest(request: AiFixRequest): AiProvider {
  return request.type === 'h1' ? mockProvider : getAiProvider();
}

export function getConfiguredProviderMode(): AiProviderMode {
  if (import.meta.env.VITE_AI_PROVIDER === 'real') return 'real';
  if (import.meta.env.VITE_AI_PROVIDER === 'mock') return 'mock';
  return import.meta.env.MODE === 'production' ? 'real' : 'mock';
}
