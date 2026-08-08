import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const targetDirectory = resolve(root, 'src', 'generated');
mkdirSync(targetDirectory, { recursive: true });
copyFileSync(resolve(root, 'public', '_locales', 'en', 'messages.json'), resolve(targetDirectory, 'enMessages.json'));
console.log('Synchronized the English development fallback catalog.');
