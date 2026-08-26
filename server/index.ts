import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { handleSeoFixRequest } from './requestHandler.js';

loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const PORT = Number(process.env.PORT ?? 8787);
export const server = createServer((req, res) => handleSeoFixRequest(req, res, { checkPath: true }));

const isMainModule = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false;

if (isMainModule) server.listen(PORT);
