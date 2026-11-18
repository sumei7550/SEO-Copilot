// This function runs in the inspected tab through chrome.scripting.executeScript.
// Keep it self-contained: Chrome serializes the function without its module scope.
export type ImageUrlCheck = { code?: number; fileSize?: number; retryAfter?: string; receivedAt?: number };

export async function checkImageUrls(urls: string[]): Promise<ImageUrlCheck[]> {
  const results: ImageUrlCheck[] = new Array(urls.length);
  const throttledOrigins = new Set<string>();
  let next = 0;
  const request = async (url: string, method: 'HEAD' | 'GET') => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {
        method, credentials: 'omit', cache: 'no-cache', redirect: 'follow', signal: controller.signal,
        ...(method === 'GET' ? { headers: { Range: 'bytes=0-0' } } : {}),
      });
      if (method === 'GET') { try { await response.body?.cancel(); } catch { /* Discard fallback body. */ } }
      const encoding = response.headers.get('content-encoding');
      const length = response.status === 206
        ? response.headers.get('content-range')?.match(/\/(\d+)$/)?.[1]
        : response.headers.get('content-length');
      const bytes = Number(length);
      return { code: response.status,
        receivedAt: Date.now(),
        ...(response.status === 429 && response.headers.get('retry-after') ? { retryAfter: response.headers.get('retry-after')! } : {}),
        fileSize: response.ok && (!encoding || encoding === 'identity') && Number.isFinite(bytes) && bytes > 0 ? bytes : undefined };
    } finally { window.clearTimeout(timer); }
  };
  const worker = async () => {
    for (;;) {
      const index = next++;
      if (index >= urls.length) return;
      const url = urls[index];
      const origin = new URL(url).origin;
      if (throttledOrigins.has(origin)) { results[index] = {}; continue; }
      try {
        let checked = await request(url, 'HEAD');
        if (checked.code === 405 || checked.code === 501) checked = await request(url, 'GET');
        results[index] = checked;
        if (checked.code === 429) throttledOrigins.add(origin);
      } catch { results[index] = {}; }
      if (next < urls.length && !throttledOrigins.has(origin)) {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(2, urls.length) }, () => worker()));
  return results;
}
