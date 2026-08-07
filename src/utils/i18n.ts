export function t(key: string, substitutions?: string | string[]): string { return globalThis.chrome?.i18n?.getMessage(key, substitutions) || key; }
export function locale(): string { return globalThis.chrome?.i18n?.getUILanguage?.() ?? 'en'; }
