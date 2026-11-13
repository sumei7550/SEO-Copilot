import { permissionPattern } from './sitePermission';

export interface QuickMetadata {
  title: string;
  metaDescription: string;
  url: string;
}

export type MetadataError = 'access-needed' | 'restricted' | 'read-failed';

export class MetadataReadError extends Error {
  constructor(public readonly kind: MetadataError) {
    super(kind);
  }
}

/** Serialized into the current tab. Keep this function free of external references. */
export function extractPageMetadata(): QuickMetadata {
  return {
    title: document.title.trim(),
    metaDescription: document.querySelector<HTMLMetaElement>('meta[name="description" i]')?.content.trim() ?? '',
    url: location.href
  };
}

export async function readActiveTabMetadata(tab: chrome.tabs.Tab): Promise<QuickMetadata> {
  if (!tab.id || !permissionPattern(tab.url ?? '')) throw new MetadataReadError('restricted');

  try {
    const injected = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractPageMetadata });
    const result = injected.find((entry) => entry.frameId === 0)?.result;
    if (!result || typeof result.title !== 'string' || typeof result.metaDescription !== 'string' || typeof result.url !== 'string') {
      throw new MetadataReadError('read-failed');
    }
    return result;
  } catch (error) {
    if (error instanceof MetadataReadError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (/cannot access contents|cannot access a chrome|missing host permission|permission.*denied|not allowed to access/i.test(message)) {
      throw new MetadataReadError('access-needed');
    }
    throw new MetadataReadError('read-failed');
  }
}
