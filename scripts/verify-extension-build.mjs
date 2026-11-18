import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const contentScript = readFileSync(resolve(root, 'dist/content.js'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'dist/manifest.json'), 'utf8'));

try {
  new Script(contentScript, { filename: resolve(root, 'dist/content.js') });
} catch (error) {
  throw new Error('dist/content.js must parse as a self-contained classic script because Chrome content scripts are not ES modules.', { cause: error });
}

if (manifest.manifest_version !== 3 || !manifest.side_panel?.default_path) {
  throw new Error('dist/manifest.json must define a Manifest V3 Side Panel.');
}

if (manifest.side_panel?.default_path && (!manifest.permissions?.includes('sidePanel') || !existsSync(resolve(root, 'dist', manifest.side_panel.default_path)))) {
  throw new Error('Side panel entry or permission is missing.');
}
if (manifest.side_panel?.default_path && (!manifest.background?.service_worker || !existsSync(resolve(root, 'dist', manifest.background.service_worker)))) {
  throw new Error('Side panel service worker is missing.');
}
if (!existsSync(resolve(root, 'dist/welcome.html'))) {
  throw new Error('Welcome page is missing from the extension build.');
}
if (manifest.action?.default_popup !== 'index.html' || !existsSync(resolve(root, 'dist/index.html'))) {
  throw new Error('The action popup entry is missing.');
}
if (manifest.background?.service_worker && manifest.background.type !== 'module') {
  const workerPath = resolve(root, 'dist', manifest.background.service_worker);
  try {
    new Script(readFileSync(workerPath, 'utf8'), { filename: workerPath });
  } catch (error) {
    throw new Error('Classic service worker background.js must parse without ESM imports or exports.', { cause: error });
  }
}

if (manifest.version !== '1.4.0') {
  throw new Error(`Expected release version 1.4.0, received ${manifest.version}.`);
}

const permissions = [...(manifest.permissions ?? [])].sort().join(',');
if (permissions !== 'activeTab,scripting,sidePanel,storage,tabs') {
  throw new Error(`Unexpected release permissions: ${permissions}.`);
}

if (manifest.minimum_chrome_version !== '116') {
  throw new Error(`Expected minimum Chrome version 116 for Side Panel, received ${manifest.minimum_chrome_version}.`);
}
const optionalHostPermissions = [...(manifest.optional_host_permissions ?? [])].sort().join(',');
if (optionalHostPermissions !== 'http://*/*,https://*/*') {
  throw new Error(`Unexpected optional host permissions: ${optionalHostPermissions}.`);
}
if ((manifest.host_permissions ?? []).includes('<all_urls>')) {
  throw new Error('The extension must not require all-sites host access.');
}

for (const size of [16, 32, 48, 128]) {
  const iconPath = manifest.icons?.[String(size)];
  if (!iconPath || !existsSync(resolve(root, 'dist', iconPath))) {
    throw new Error(`Missing packaged ${size}x${size} extension icon.`);
  }
}

const localeRoot = resolve(root, 'dist', '_locales');
const localeNames = ['en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'de', 'fr', 'pt_BR', 'pt_PT', 'it', 'nl', 'pl', 'id', 'hi', 'th', 'ms', 'ro', 'cs', 'tr', 'sv', 'uk'];
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

console.log('Extension build verified: V1.4.0, minimal permissions, self-contained content script, and valid Manifest V3 manifest.');
