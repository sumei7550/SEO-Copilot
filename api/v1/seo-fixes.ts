import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleSeoFixRequest } from '../../server/requestHandler.js';

type VercelRequest = IncomingMessage & { body?: unknown };

export default function handler(req: VercelRequest, res: ServerResponse) {
  return handleSeoFixRequest(req, res);
}
