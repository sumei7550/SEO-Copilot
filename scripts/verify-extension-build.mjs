import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const contentScript = readFileSync(resolve(root, 'dist/content.js'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'dist/manifest.json'), 'utf8'));

if (/^\s*(?:import|export)\s/m.test(contentScript)) {
  throw new Error('dist/content.js must be self-contained because Chrome content scripts are not ES modules.');
}

if (manifest.manifest_version !== 3 || !manifest.action?.default_popup) {
  throw new Error('dist/manifest.json is not a valid Manifest V3 popup extension manifest.');
}

if (manifest.version !== '1.1.0') {
  throw new Error(`Expected release version 1.1.0, received ${manifest.version}.`);
}

const permissions = [...(manifest.permissions ?? [])].sort().join(',');
if (permissions !== 'activeTab,scripting') {
  throw new Error(`Unexpected release permissions: ${permissions}.`);
}

for (const size of [16, 32, 48, 128]) {
  const iconPath = manifest.icons?.[String(size)];
  if (!iconPath || !existsSync(resolve(root, 'dist', iconPath))) {
    throw new Error(`Missing packaged ${size}x${size} extension icon.`);
  }
}

const localeRoot = resolve(root, 'dist', '_locales');
const localeNames = ['en', 'zh_CN', 'ja', 'ko', 'es', 'de', 'fr', 'pt_BR'];
const englishMessages = JSON.parse(readFileSync(resolve(localeRoot, 'en', 'messages.json'), 'utf8'));
const englishKeys = Object.keys(englishMessages).sort().join(',');
for (const locale of localeNames) {
  const localePath = resolve(localeRoot, locale, 'messages.json');
  if (!existsSync(localePath)) throw new Error(`Missing ${locale} locale catalog.`);
  const messages = JSON.parse(readFileSync(localePath, 'utf8').replace(/^\uFEFF/, ''));
  if (Object.keys(messages).sort().join(',') !== englishKeys) {
    throw new Error(`${locale} locale keys do not match the English release catalog.`);
  }
}

// Remove the icon master source file — it is not a runtime asset.
const masterIcon = resolve(root, 'dist/icons/icon-master.png');
if (existsSync(masterIcon)) {
  const { rmSync } = await import('node:fs');
  rmSync(masterIcon);
}

console.log('Extension build verified: V1.1.0, minimal permissions, self-contained content script, and valid Manifest V3 manifest.');
