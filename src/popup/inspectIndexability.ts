export interface IndexabilitySignals {
  pageUrl: string;
  rawCanonical?: string | null;
  robotsMeta?: string | null;
  xRobotsTag?: string | null;
  robotsUrl?: string | null;
  sitemapUrls?: string[] | null;
  hreflangs?: Array<{ language: string; url: string }> | null;
}

// Chrome serializes this function for the inspected tab. Keep every helper local.
export async function inspectIndexability(expectedUrl: string): Promise<IndexabilitySignals> {
  const pageUrl = window.location.href;
  const signals: IndexabilitySignals = { pageUrl };
  if (pageUrl !== expectedUrl || !/^https?:$/.test(window.location.protocol)) return signals;

  const robotsDirectives = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name]'))
    .filter((meta) => ['robots', 'googlebot'].includes(meta.name.trim().toLowerCase()))
    .map((meta) => meta.content.trim())
    .filter(Boolean);
  signals.robotsMeta = robotsDirectives.length ? robotsDirectives.join(', ') : null;
  const alternates = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="alternate"][hreflang]'))
    .map((link) => ({ language: link.hreflang.trim(), url: link.href }))
    .filter((item) => item.language && /^https?:\/\//i.test(item.url));
  signals.hreflangs = alternates.length ? alternates.slice(0, 100) : null;

  const origin = window.location.origin;
  const request = async (url: string): Promise<Response | undefined> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(url, { method: 'GET', credentials: 'same-origin', cache: 'force-cache', redirect: 'follow', signal: controller.signal });
      return new URL(response.url).origin === origin ? response : undefined;
    } catch { return undefined; }
    finally { window.clearTimeout(timer); }
  };

  const sitemapUrl = `${origin}/sitemap.xml`;
  const [rawResponse, robotsResponse, sitemapResponse] = await Promise.all([
    request(pageUrl), request(`${origin}/robots.txt`), request(sitemapUrl)
  ]);
  if (rawResponse) {
    signals.xRobotsTag = rawResponse.headers.get('x-robots-tag')?.trim() || null;
    if (rawResponse.headers.get('content-type')?.toLowerCase().includes('html')) {
      try {
        const rawDocument = new DOMParser().parseFromString((await rawResponse.text()).slice(0, 1_000_000), 'text/html');
        const href = rawDocument.querySelector<HTMLLinkElement>('link[rel="canonical" i]')?.getAttribute('href')?.trim();
        signals.rawCanonical = href ? new URL(href, rawResponse.url).href : null;
      } catch { /* Raw HTML remains not checked. */ }
    }
  }

  let declaredSitemaps: string[] = [];
  if (robotsResponse?.status === 404) signals.robotsUrl = null;
  else if (robotsResponse?.ok) {
    try {
      const content = (await robotsResponse.text()).slice(0, 200_000);
      if (robotsResponse.headers.get('content-type')?.toLowerCase().includes('text/plain')
        || /^\s*(?:user-agent|allow|disallow|sitemap)\s*:/im.test(content)) {
        signals.robotsUrl = `${origin}/robots.txt`;
        declaredSitemaps = Array.from(content.matchAll(/^\s*Sitemap\s*:\s*(\S+)/gim), (match) => {
          try { return new URL(match[1], origin).href; } catch { return ''; }
        }).filter((url) => /^https?:\/\//i.test(url)).slice(0, 20);
      } else signals.robotsUrl = null;
    } catch { /* Leave robots.txt unchecked. */ }
  }
  if (declaredSitemaps.length) signals.sitemapUrls = [...new Set(declaredSitemaps)];
  else {
    if (sitemapResponse?.status === 404) signals.sitemapUrls = null;
    else if (sitemapResponse?.ok) {
      try {
        const content = (await sitemapResponse.text()).slice(0, 200_000);
        signals.sitemapUrls = /<(?:\w+:)?(?:urlset|sitemapindex)\b/i.test(content) ? [sitemapUrl] : null;
      } catch { /* Leave sitemap unchecked. */ }
    }
  }
  return signals;
}
