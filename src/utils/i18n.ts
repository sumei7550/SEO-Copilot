import englishMessages from '../generated/enMessages.json';

type MessageCatalog = Record<string, { message: string }>;

function fallbackMessage(key: string, substitutions?: string | string[]): string {
  let message = (englishMessages as MessageCatalog)[key]?.message ?? key;
  const values = typeof substitutions === 'string' ? [substitutions] : substitutions ?? [];
  values.forEach((value, index) => { message = message.split(`$${index + 1}`).join(value); });
  if (values[0]) message = message.split('$COUNT$').join(values[0]);
  return message;
}

export function t(key: string, substitutions?: string | string[]): string { return globalThis.chrome?.i18n?.getMessage(key, substitutions) || fallbackMessage(key, substitutions); }
export function locale(): string { return globalThis.chrome?.i18n?.getUILanguage?.() ?? 'en'; }
