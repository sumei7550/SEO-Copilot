import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QuickMetadataCard } from '../components/QuickMetadataCard';
import { headingsAsTsv } from '../report/ContentAnalysis';
import type { SchemaData, SchemaValue, SeoResult } from '../types/seo';
import type { MetadataState } from './perTabMetadataState';
import { getSnapshot, putImageStatuses } from './sessionSnapshot';
import { checkImageUrls } from './checkImageUrls';
import { inspectIndexability, type IndexabilitySignals } from './inspectIndexability';

export type PopupTool = 'content' | 'indexability' | 'structured' | 'images' | 'social' | 'links';
export type PageScanState = { status: 'idle' | 'scanning' | 'ready' | 'error'; result?: SeoResult; message?: string };
type CheckedImageStatus = { kind: 'ok' | 'broken' | 'unchecked'; code?: number; fileSize?: number };

function Notice({ title, children, tone = '' }: { title: string; children: React.ReactNode; tone?: string }) {
  return <div className={`inspector-notice ${tone}`}><strong>{title}</strong><p>{children}</p></div>;
}

function IndexSection({ title, children, initiallyOpen = true, className = '' }: { title: React.ReactNode; children: React.ReactNode; initiallyOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <details className={`inspector-index-section ${className}`} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}><summary>{title}</summary>{children}</details>;
}

function IndexSignal({ value, checking = false, link = false, criticalMissing = false }: { value?: string | null; checking?: boolean; link?: boolean; criticalMissing?: boolean }) {
  if (value === undefined) return <span className="inspector-index-unchecked">{checking ? 'Checking…' : 'Not checked'}</span>;
  if (value === null || value === '') return <span className={`inspector-index-missing${criticalMissing ? ' is-critical' : ''}`}>{criticalMissing ? <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 15 14H1L8 1Z" fill="currentColor" /><path d="M7 5h2v5H7zM7 11h2v2H7z" fill="#fff" /></svg> : null}Missing</span>;
  return link && /^https?:\/\//i.test(value)
    ? <a className="inspector-index-url" href={value} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{value}</a>
    : <span className="inspector-index-value">{value}</span>;
}

function canonicalStatus(value: string | null | undefined, pageUrl: string): string {
  if (value === undefined) return 'Not checked';
  if (!value) return 'Missing';
  try {
    const canonical = new URL(value);
    const current = new URL(pageUrl);
    canonical.hash = '';
    current.hash = '';
    if (!canonical.search) current.search = '';
    return canonical.href === current.href ? 'Self-canonical' : 'Found';
  }
  catch { return 'Found'; }
}

function SchemaProperty({ name, value, depth = 0 }: { name: string; value: SchemaValue; depth?: number }) {
  if (value !== null && typeof value === 'object') {
    const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item] as const) : Object.entries(value);
    return <details className="inspector-schema-nested" style={{ marginLeft: depth ? 12 : 0 }}>
      <summary>{name}</summary>
      {entries.sort((a, b) => Number(a[1] !== null && typeof a[1] === 'object') - Number(b[1] !== null && typeof b[1] === 'object')).map(([key, child]) => <SchemaProperty key={key} name={key} value={child} depth={depth + 1} />)}
    </details>;
  }
  const text = value === null ? 'null' : String(value);
  return <div className="inspector-schema-property" style={{ marginLeft: depth ? 12 : 0, gridTemplateColumns: `calc(var(--schema-label-width) - ${depth * 12}px) minmax(0, 1fr)` }}><span>{name}</span>{/^https?:\/\//i.test(text) ? <a href={text} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{text}</a> : <span>{text}</span>}</div>;
}

function schemaEntries(properties: Record<string, SchemaValue>): Array<[string, SchemaValue]> {
  return Object.entries(properties).sort((a, b) => Number(a[1] !== null && typeof a[1] === 'object') - Number(b[1] !== null && typeof b[1] === 'object'));
}

function ImageFilterMenu({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string; count: number }>;
  onChange: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === value);
  const active = value !== 'all';
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !detailsRef.current?.contains(event.target)) detailsRef.current?.removeAttribute('open');
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, []);
  return <div className={`inspector-image-filter-control ${active ? 'is-active' : ''}`}><details className="inspector-image-filter" ref={detailsRef}>
    <summary aria-label={`${label}: ${selectedOption?.label ?? label}`}><span>{active ? `${label}: ${selectedOption?.label ?? value}` : label}</span>{!active ? <svg className="inspector-filter-chevron" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2.5 4h7L6 8z" /></svg> : null}</summary>
    <div className="inspector-image-filter-menu" role="menu" aria-label={`${label} options`}>
      {options.filter((option) => option.value !== 'all').map((option) => <button type="button" role="menuitemradio" aria-checked={value === option.value} key={option.value} onClick={(event) => { onChange(option.value); event.currentTarget.closest('details')?.removeAttribute('open'); }}><span>{option.label}</span><small>{option.count}</small></button>)}
    </div>
  </details>{active ? <button type="button" className="inspector-filter-clear" aria-label={`Clear ${label} filter`} onClick={() => { onChange('all'); detailsRef.current?.removeAttribute('open'); detailsRef.current?.querySelector('summary')?.focus(); }}><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 3 6 6m0-6-6 6" /></svg></button> : null}</div>;
}

function ImageThumbnail({ image }: { image: SeoResult['page']['images'][number] }) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    if (!image.src || !image.auditable || !element.current) { setVisible(false); return; }
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      root: element.current.closest('.inspector-tool-panel'), rootMargin: '64px',
    });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [image.src, image.auditable]);
  return <div className="inspector-image-thumb" ref={element}>{visible && !failed
    ? <img src={image.src} alt="" width="36" height="36" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    : <span>IMG</span>}</div>;
}

function imageUrlLabel(src: string): string {
  if (!src) return 'Not available';
  try {
    const url = new URL(src);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return `${url.host}${url.pathname}${url.search ? '?…' : url.hash ? '#…' : ''}`;
    }
    if (url.protocol === 'data:') return 'Embedded data image';
  } catch {
    // Keep non-URL values readable; copying always uses the original source.
  }
  return src;
}

export function PopupToolViews({ tool, metadata, scan, tabId, onRetry, onRequestAccess, onOpenImageAudit, onOpenContentAudit }: {
  tool: PopupTool;
  metadata: MetadataState;
  scan: PageScanState;
  tabId?: number;
  onRetry: () => void;
  onRequestAccess: () => Promise<void>;
  onOpenImageAudit?: () => void;
  onOpenContentAudit?: () => void;
}) {
  const [expandedHeadings, setExpandedHeadings] = useState(false);
  const [imageAltFilter, setImageAltFilter] = useState<'all' | 'not-empty' | 'empty'>('all');
  const [imageStatusFilter, setImageStatusFilter] = useState<'all' | 'ok' | 'broken' | 'unchecked'>('all');
  const [imageHelpOverlay, setImageHelpOverlay] = useState<{ key: string; text: string; top: number; left: number }>();
  const [imageStatuses, setImageStatuses] = useState<Record<string, CheckedImageStatus>>({});
  const [imageStatusReady, setImageStatusReady] = useState(false);
  const [imageStatusProgress, setImageStatusProgress] = useState<{ done: number; total: number }>();
  const imageStatusRun = useRef(0);
  const imageRefreshBusy = useRef(false);
  const imageHelpHideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [feedback, setFeedback] = useState<{ target: string; text: string; failed: boolean; fallback?: string }>({ target: '', text: '', failed: false });
  const [indexProbe, setIndexProbe] = useState<{ key: string; signals: IndexabilitySignals }>();
  const [indexChecking, setIndexChecking] = useState(false);
  const indexRun = useRef(0);
  const indexCache = useRef(new Map<string, IndexabilitySignals>());
  useEffect(() => {
    const run = ++imageStatusRun.current;
    imageRefreshBusy.current = false;
    setExpandedHeadings(false); setImageAltFilter('all'); setImageStatusFilter('all');
    setImageHelpOverlay(undefined);
    setImageStatuses(scan.result?.imageStatuses ?? {});
    setImageStatusReady(Boolean(Object.keys(scan.result?.imageStatuses ?? {}).length));
    setImageStatusProgress(undefined);
    setFeedback({ target: '', text: '', failed: false });
    if (tool === 'images' && tabId && scan.status === 'ready' && scan.result) {
      const result = scan.result;
      void getSnapshot(tabId, result.page.url).then((cached) => {
        if (run === imageStatusRun.current && cached.ok && cached.result?.scannedAt === result.scannedAt) {
          setImageStatuses(cached.result.imageStatuses ?? {});
          setImageStatusReady(Boolean(Object.keys(cached.result.imageStatuses ?? {}).length));
        }
      });
    }
    return () => { imageStatusRun.current++; };
  }, [scan.result?.scannedAt, scan.result?.page.url, scan.status, tool, tabId]);

  const result = scan.status === 'ready' ? scan.result : undefined;
  const page = result?.page;
  const indexKey = page ? `${page.url}|${result?.scannedAt ?? 0}` : '';
  useEffect(() => {
    if (tool !== 'indexability' || !page || !tabId || !globalThis.chrome?.scripting) return;
    const run = ++indexRun.current;
    const cached = indexCache.current.get(indexKey);
    if (cached) { setIndexProbe({ key: indexKey, signals: cached }); setIndexChecking(false); return; }
    setIndexChecking(true);
    void chrome.scripting.executeScript({ target: { tabId }, args: [page.url], func: inspectIndexability })
      .then(([reply]) => {
        const signals = reply?.result;
        if (!signals || signals.pageUrl !== page.url || run !== indexRun.current) return;
        indexCache.current.set(indexKey, signals);
        setIndexProbe({ key: indexKey, signals });
      })
      .catch(() => { /* The current tab could not be inspected. */ })
      .finally(() => { if (run === indexRun.current) setIndexChecking(false); });
    return () => { indexRun.current++; };
  }, [tool, page?.url, result?.scannedAt, tabId, indexKey]);
  useEffect(() => {
    if (!imageHelpOverlay) return;
    const hide = () => setImageHelpOverlay(undefined);
    const panel = document.querySelector('.inspector-tool-panel');
    panel?.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
    return () => { panel?.removeEventListener('scroll', hide); window.removeEventListener('resize', hide); };
  }, [imageHelpOverlay]);
  useEffect(() => () => { if (imageHelpHideTimer.current) clearTimeout(imageHelpHideTimer.current); }, []);
  const cancelImageHelpHide = () => {
    if (imageHelpHideTimer.current) clearTimeout(imageHelpHideTimer.current);
    imageHelpHideTimer.current = undefined;
  };
  const hideImageHelpSoon = () => {
    cancelImageHelpHide();
    imageHelpHideTimer.current = setTimeout(() => setImageHelpOverlay(undefined), 150);
  };
  const showImageHelp = (key: string, text: string, button: HTMLButtonElement) => {
    cancelImageHelpHide();
    const bounds = button.getBoundingClientRect();
    const width = Math.min(240, window.innerWidth - 16);
    const left = Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8));
    const tooltipHeight = 110;
    const top = bounds.bottom + tooltipHeight + 8 <= window.innerHeight
      ? bounds.bottom + 4 : Math.max(8, bounds.top - tooltipHeight - 4);
    setImageHelpOverlay({ key, text, top, left });
  };
  const copy = async (target: string, value: string, fallback = false) => {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({ target, text: target === 'headings' ? `All ${page?.headings.length ?? 0} headings copied as TSV` : 'Copied', failed: false });
    } catch {
      setFeedback({ target, text: fallback ? target === 'headings' ? 'Copy failed. Select the complete TSV below and copy manually.' : 'Copy failed. Select the full URL below and copy manually.' : 'Copy failed. Select the text and copy it manually.', failed: true, fallback: fallback ? value : undefined });
    }
  };
  const copyStatus = (target: string) => feedback.target === target ? <p className={`inspector-feedback ${feedback.failed ? 'is-error' : ''}`} role="status" aria-live="polite">{feedback.text}</p> : null;
  const refreshImageStatuses = async (entries: Array<{ image: SeoResult['page']['images'][number]; index: number; key: string }>) => {
    if (imageRefreshBusy.current) return;
    imageRefreshBusy.current = true;
    const run = ++imageStatusRun.current;
    const grouped = new Map<string, string[]>();
    entries.forEach(({ image, key }) => {
      if (!/^https?:\/\//i.test(image.src)) return;
      try { new URL(image.src); } catch { return; }
      const keys = grouped.get(image.src) ?? [];
      keys.push(key);
      grouped.set(image.src, keys);
    });
    const targets = [...grouped].map(([src, keys]) => ({ src, keys }));
    setImageStatusProgress({ done: 0, total: entries.length });
    const cached = tabId && page ? await getSnapshot(tabId, page.url) : undefined;
    if (run !== imageStatusRun.current) return;
    let done = entries.length - targets.reduce((count, task) => count + task.keys.length, 0);
    setImageStatusProgress({ done, total: entries.length });
    const results: Record<string, CheckedImageStatus> = { ...imageStatuses };
    const throttledOrigins = new Set<string>();
    let scriptingUnavailable = false;
    let lastProgressAt = 0;
    // Bound both the injected work and cross-process script calls. A long
    // image list no longer injects one function for every URL on each refresh.
    for (let offset = 0; offset < targets.length; offset += 6) {
      if (run !== imageStatusRun.current) return;
      const batch = targets.slice(offset, offset + 6);
      const runnable = batch.filter((task) => !throttledOrigins.has(new URL(task.src).origin));
      let checked: Array<{ code?: number; fileSize?: number }> = [];
      if (runnable.length && tabId && globalThis.chrome?.scripting && !scriptingUnavailable) {
        try {
          const [reply] = await chrome.scripting.executeScript({ target: { tabId }, args: [runnable.map((task) => task.src)], func: checkImageUrls });
          if (Array.isArray(reply?.result)) checked = reply.result;
        } catch {
          // Navigation or permission loss invalidates the remaining checks.
          scriptingUnavailable = true;
        }
      }
      if (run !== imageStatusRun.current) return;
      const byUrl = new Map(runnable.map((task, index) => [task.src, checked[index]]));
      for (const task of batch) {
        const response = byUrl.get(task.src);
        const code = response?.code;
        const status: CheckedImageStatus = typeof code === 'number'
          ? { kind: code === 429 ? 'unchecked' : code >= 200 && code < 400 ? 'ok' : 'broken', code, fileSize: response?.fileSize }
          : { kind: 'unchecked' };
        if (code === 429) throttledOrigins.add(new URL(task.src).origin);
        for (const key of task.keys) results[key] = status;
        done += task.keys.length;
      }
      const now = Date.now();
      if (offset + batch.length === targets.length || now - lastProgressAt >= 100) {
        lastProgressAt = now;
        setImageStatuses({ ...results });
      setImageStatusProgress({ done, total: entries.length });
      }
    }
    if (run !== imageStatusRun.current) return;
    // Non-HTTP URLs and browser-blocked requests are explicitly unchecked.
    entries.forEach(({ key }) => { if (!results[key]) results[key] = { kind: 'unchecked' }; });
    setImageStatuses(results);
    setImageStatusProgress(undefined);
    setImageStatusReady(true);
    if (tabId && page && result && cached?.ok && cached.result?.scannedAt === result.scannedAt) {
      await putImageStatuses(tabId, page.url, cached.generation, result.scannedAt, results);
    }
    if (run === imageStatusRun.current) imageRefreshBusy.current = false;
  };
  const accessNeeded = metadata.status === 'error' && metadata.kind === 'access-needed';
  const restricted = metadata.status === 'error' && metadata.kind === 'restricted';
  const stateNotice = restricted
    ? <Notice title="This page cannot be inspected" tone="is-error">Open a regular website to view page data and run an SEO Audit.</Notice>
    : scan.status === 'scanning' || scan.status === 'idle'
    ? <Notice title="Scanning page…">Reading page data. The tools will appear when the scan finishes.</Notice>
    : <><Notice title={accessNeeded ? 'Page access needed' : 'Could not scan this page'} tone="is-error">{accessNeeded ? 'Allow access to this site before reading its page data.' : 'The page data could not be read. Previous results are hidden.'}</Notice><button type="button" className="inspector-outline inspector-state-action" onClick={accessNeeded ? () => void onRequestAccess() : onRetry}>{accessNeeded ? 'Allow access to this site' : 'Try again'}</button></>;

  if (tool === 'content') {
    const headings = page?.headings ?? [];
    const visible = expandedHeadings ? headings : headings.slice(0, 8);
    const h1Count = headings.filter((heading) => heading.level === 1).length;
    return <div className="inspector-content-sheet">
      <QuickMetadataCard state={metadata} onRequestAccess={onRequestAccess} onOpenContentAudit={onOpenContentAudit} sectionTitle="Meta" />
      {!page ? stateNotice : <section className="inspector-content-group" aria-labelledby="inspector-content-heading">
        <div className="inspector-content-section-head"><h3 id="inspector-content-heading">Content</h3><button type="button" className="inspector-outline" disabled={!headings.length} onClick={() => void copy('headings', headingsAsTsv(headings), true)}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></svg><span>Copy headings</span></button></div>
        <div className="inspector-content-stat-row"><span>Word count</span><span>{page.wordCount} words</span></div>
        <div className="inspector-content-heading-list"><span className="inspector-content-row-label">Headings</span><div className="inspector-content-heading-body">
          {headings.length > 0 && (h1Count === 0 || headings[0].level !== 1) ? <div className="inspector-content-heading-warning"><span className="inspector-content-heading-info-icon" aria-hidden="true">i</span><span>{h1Count === 0 ? 'No H1 heading found.' : 'The first heading is not H1'}</span></div> : null}
          {visible.length ? visible.map((heading, index) => <div className="inspector-heading-row" data-level={heading.level} key={index}><b>H{heading.level}</b><span className={!heading.text ? 'is-empty' : ''}>{heading.text || 'Empty heading'}</span></div>) : <span className="inspector-content-heading-missing">Missing</span>}
          {headings.length > 8 ? <button type="button" className="inspector-text-button" aria-expanded={expandedHeadings} onClick={() => setExpandedHeadings((value) => !value)}>{expandedHeadings ? 'Show fewer' : 'Show more'}</button> : null}
        </div></div>
        {h1Count > 1 ? <p className="inspector-check">{h1Count} H1 headings found. Review the primary heading.</p> : null}
        {copyStatus('headings')}{feedback.target === 'headings' && feedback.fallback ? <textarea className="inspector-fallback" readOnly aria-label="All headings in TSV" value={feedback.fallback} onFocus={(event) => event.currentTarget.select()} /> : null}
      </section>}
    </div>;
  }

  if (tool === 'social') return <div className="inspector-unified-sheet inspector-social-sheet">
    <div className="inspector-coming-soon-banner"><strong>Coming soon</strong><p>Social tags are not collected yet. The fields below have not been checked.</p></div>
    <IndexSection title="Open graph tags" initiallyOpen={false}>{['og:title', 'og:type', 'og:image', 'og:url', 'og:description'].map((label) => <div className="inspector-social-row" key={label}><span>{label}</span><span>Not checked</span></div>)}</IndexSection>
    <IndexSection title="X (Twitter) card">{['twitter:card', 'twitter:site', 'twitter:description', 'twitter:title', 'twitter:image'].map((label) => <div className="inspector-social-row" key={label}><span>{label}</span><span>Not checked</span></div>)}</IndexSection>
  </div>;
  if (tool === 'links') return <div className="inspector-unified-sheet inspector-links-sheet">
    <div className="inspector-coming-soon-banner"><strong>Coming soon</strong><p>Outgoing link targets, follow attributes and HTTP status are not collected yet.</p></div>
  </div>;
  if (!page || !result) return stateNotice;

  if (tool === 'indexability') {
    const canonical = page.canonical;
    const signals = indexProbe?.key === indexKey ? indexProbe.signals : undefined;
    const rawCanonical = signals?.rawCanonical;
    const robotsUrl = signals?.robotsUrl;
    const robotsMeta = signals?.robotsMeta;
    const xRobotsTag = signals?.xRobotsTag;
    const sitemaps = signals?.sitemapUrls;
    const hreflangs = signals?.hreflangs;
    const noindex = [robotsMeta, xRobotsTag].some((value) => value && /(?:^|[\s,])noindex(?=$|[\s,])/i.test(value));
    return <div className="inspector-unified-sheet inspector-indexability">
      <IndexSection title="Canonical URL">
        <div className="inspector-index-row">
          <span className="inspector-index-label">In Rendered HTML</span>
          <IndexSignal value={canonical || null} link criticalMissing />
          {canonical ? <span className="inspector-pill is-ok">{canonicalStatus(canonical, page.url)}</span> : null}
        </div>
        <div className="inspector-index-row"><span className="inspector-index-label">In Raw HTML</span><IndexSignal value={rawCanonical} checking={indexChecking} link criticalMissing />{rawCanonical ? <span className="inspector-pill is-ok">{canonicalStatus(rawCanonical, page.url)}</span> : null}</div>
      </IndexSection>
      <IndexSection title={<>Robots{noindex ? <span className="inspector-index-warning"><span className="inspector-index-warning-icon" aria-hidden="true">i</span>Noindex page</span> : null}</>}>
        <div className="inspector-index-row"><span className="inspector-index-label">Robots.txt</span><IndexSignal value={robotsUrl} checking={indexChecking} link /></div>
        <div className="inspector-index-row"><span className="inspector-index-label">Robots Meta Tag</span><IndexSignal value={robotsMeta} checking={indexChecking} /></div>
        <div className="inspector-index-row"><span className="inspector-index-label">X-Robots-Tag HTTP</span><IndexSignal value={xRobotsTag} checking={indexChecking} /></div>
      </IndexSection>
      <IndexSection title="Sitemaps">
        {sitemaps?.length ? sitemaps.map((url) => <div className="inspector-index-row" key={url}><span className="inspector-index-label" /><IndexSignal value={url} link /></div>) : <div className="inspector-index-row"><span className="inspector-index-label" />{sitemaps === null ? <span className="inspector-index-missing">Not found</span> : <IndexSignal value={undefined} checking={indexChecking} />}</div>}
      </IndexSection>
      <IndexSection title="Hreflangs">
        {hreflangs?.length ? hreflangs.map((item, index) => <div className="inspector-index-row" key={`${item.language}-${item.url}-${index}`}><span className="inspector-index-label">{item.language}</span><IndexSignal value={item.url} link /></div>) : <div className="inspector-index-row"><span className="inspector-index-label" /><IndexSignal value={hreflangs === null ? null : undefined} checking={indexChecking} /></div>}
      </IndexSection>
    </div>;
  }

  if (tool === 'structured') {
    const blocks = page.jsonLdBlockCount;
    const schemas: SchemaData[] = page.schemas.length ? page.schemas : Array.from(new Set(result.metrics.schemaTypes)).map((type) => ({ type }));
    const detected = (blocks ?? 0) > 0 || schemas.length > 0;
    const formats = Array.from(new Set(schemas.map((schema) => schema.format ?? 'JSON-LD')));
    const entries = schemas.map((schema, index) => ({ schema, index }));
    const renderEntry = ({ schema, index }: typeof entries[number]) => <IndexSection title={schema.type || 'Untyped item'} key={`${schema.format}-${schema.id}-${index}`} className="inspector-schema-entry" initiallyOpen={false}>
      {schemaEntries(schema.properties ?? { '@type': schema.type }).map(([name, value]) => <SchemaProperty key={name} name={name} value={value} />)}
    </IndexSection>;
    return <div className="inspector-unified-sheet inspector-structured-sheet">
      {schemas.length ? formats.length > 1 ? formats.map((format) => <div className="inspector-schema-group" key={format}><h3>{format}</h3>{entries.filter(({ schema }) => (schema.format ?? 'JSON-LD') === format).map(renderEntry)}</div>) : entries.map(renderEntry) : <div className="inspector-schema-empty">{page.invalidSchemaCount ? 'Structured data was found, but a JSON-LD block could not be parsed.' : detected ? 'Structured data was found, but no item was collected.' : 'No structured data detected.'}</div>}
      <div className="inspector-schema-metrics"><div><span>JSON-LD blocks</span><span>{blocks === undefined ? 'Not available' : blocks}</span></div><div><span>Items</span><span>{schemas.length}</span></div><div><span>JSON-LD parse errors</span><span>{page.invalidSchemaCount}</span></div></div>
      <p className="inspector-index-footnote">Markup is collected from this page. Google rich result eligibility is not checked.</p>
    </div>;
  }

  const images = page.images;
  const altNotEmpty = images.filter((image) => Boolean(image.alt?.trim())).length;
  const altEmpty = images.length - altNotEmpty;
  const statusCounts = images.reduce((counts, image, index) => {
    const key = `${image.src}-${index}`;
    const status = imageStatuses[key];
    if (!status) counts.unchecked++;
    else counts[status.kind]++;
    return counts;
  }, { ok: 0, broken: 0, unchecked: 0 });
  const filteredImages = images.map((image, index) => ({ image, index, key: `${image.src}-${index}` })).filter(({ image, key }) => {
    const altMatches = imageAltFilter === 'all' || (imageAltFilter === 'not-empty' ? Boolean(image.alt?.trim()) : !image.alt?.trim());
    const status = imageStatuses[key]?.kind ?? 'unchecked';
    const statusMatches = imageStatusFilter === 'all' || status === imageStatusFilter;
    return altMatches && statusMatches;
  });
  const exportImages = () => {
    const quote = (value: unknown) => {
      const raw = String(value ?? '');
      const safe = /^[\s]*[=+@\-]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.split('"').join('""')}"`;
    };
    const rows = [['#', 'URL', 'Alt', 'Width', 'Height', 'Size (KB)', 'Status'], ...images.map((image, index) => {
      const status = imageStatuses[`${image.src}-${index}`];
      const fileSize = image.fileSize ?? status?.fileSize;
      return [index + 1, image.src, image.alt ?? '', image.naturalWidth || '', image.naturalHeight || '', fileSize ? (fileSize / 1024).toFixed(2) : '', status?.code ?? ''];
    })];
    const csv = `\uFEFF${rows.map((row) => row.map(quote).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    let host = 'page';
    try { host = new URL(page.url).host.replace(/[^a-z0-9.-]+/gi, '_'); } catch { /* keep fallback */ }
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
    anchor.download = `Images-${host}-${timestamp}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const imageToolbar = <div className="inspector-image-toolbar">
    <ImageFilterMenu label="Alt text" value={imageAltFilter} onChange={(value) => setImageAltFilter(value as typeof imageAltFilter)} options={[{ value: 'all', label: 'All', count: images.length }, { value: 'not-empty', label: 'Not empty', count: altNotEmpty }, { value: 'empty', label: 'Empty', count: altEmpty }]} />
    {imageStatusReady ? <ImageFilterMenu label="Status" value={imageStatusFilter} onChange={(value) => setImageStatusFilter(value as typeof imageStatusFilter)} options={[{ value: 'all', label: 'All', count: images.length }, { value: 'ok', label: 'Ok', count: statusCounts.ok }, { value: 'broken', label: 'Broken', count: statusCounts.broken }, { value: 'unchecked', label: 'Not checked', count: statusCounts.unchecked }]} /> : null}
    <button type="button" className={`inspector-refresh-button ${imageStatusReady ? '' : 'is-initial'} ${imageStatusProgress ? 'is-loading' : ''}`} aria-label="Refresh image statuses" disabled={!filteredImages.length || Boolean(imageStatusProgress)} onClick={() => void refreshImageStatuses(filteredImages)}>{imageStatusProgress ? <span className="inspector-spinner" aria-hidden="true" /> : <svg className="inspector-refresh-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.8 7.2A6 6 0 1 0 15 10" /><path d="M14.8 3.5v3.7h-3.7" /></svg>}{imageStatusReady ? null : 'Status'}</button>
    {imageStatusProgress ? <span className="inspector-image-progress-count" role="status" aria-label={`Checking image statuses: ${imageStatusProgress.done} of ${imageStatusProgress.total}`}>{imageStatusProgress.done} of {imageStatusProgress.total}</span> : null}
    <button type="button" className="inspector-outline inspector-image-export" aria-label="Export images as CSV" onClick={exportImages} disabled={!images.length}><svg className="inspector-image-export-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 1h7l4 4v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" /><path fill="#fff" d="M7 5.5h2v4h1.5L8 12 5.5 9.5H7z" /></svg>Export</button>
  </div>;
  return <><section className="inspector-card inspector-images-card">
      {imageToolbar}
      {Object.values(imageStatuses).some((status) => status.code === 429) ? <p className="inspector-check is-neutral" role="status">An image server limited requests (429). Remaining images on that server were not checked. Try again later.</p> : null}
      {imageStatusReady && !imageStatusProgress && statusCounts.unchecked > 0 ? <p className="inspector-image-status-note" role="status">Not checked means no HTTP status was verified for {statusCounts.unchecked} image{statusCounts.unchecked === 1 ? '' : 's'}. A thumbnail may still appear when the separate status request is blocked or times out.</p> : null}
      <div className="inspector-image-table-head"><strong>Image details</strong><strong>Status</strong></div>
      {filteredImages.length ? filteredImages.map(({ image, index, key }) => {
        const status = imageStatuses[key];
        const fileSize = image.fileSize ?? status?.fileSize;
        const safeLink = /^https?:\/\//i.test(image.src);
        const emptyAlt = image.alt === null || image.alt.trim() === '';
        const helpText = image.alt === null
          ? 'This image has no alt attribute. Describe it if it conveys information. If it is decorative, set alt="".'
          : 'This image has an empty alt attribute. Keep it empty if the image is decorative; describe it if it conveys information.';
        return <div className="inspector-image-entry" key={key}>
          <ImageThumbnail image={image} />
          <div className="inspector-image-content">
            <p className={`inspector-image-alt ${emptyAlt ? 'is-empty-alt' : ''}`}>{emptyAlt ? <span className="inspector-image-warning" aria-hidden="true"><svg viewBox="0 0 14 14" aria-hidden="true"><rect x="6" y="3" width="2" height="2" fill="currentColor" /><rect x="6" y="6" width="2" height="5" fill="currentColor" /></svg></span> : null}<span>{image.alt === null ? 'Missing alt text' : image.alt.trim() === '' ? 'Empty alt text' : image.alt}</span>{emptyAlt ? <button type="button" className="inspector-image-help-trigger" aria-label={`How to fix ${image.alt === null ? 'missing' : 'empty'} alt text; open image audit`} aria-describedby={imageHelpOverlay?.key === key ? 'inspector-image-help-description' : undefined} onMouseEnter={(event) => showImageHelp(key, helpText, event.currentTarget)} onMouseLeave={hideImageHelpSoon} onFocus={(event) => showImageHelp(key, helpText, event.currentTarget)} onBlur={(event) => { if (!document.getElementById('inspector-image-help-tooltip')?.contains(event.relatedTarget as Node)) hideImageHelpSoon(); }} onClick={() => onOpenImageAudit?.()}>How to fix →</button> : null}</p>
            <p className="inspector-image-url">{safeLink ? <a href={image.src} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label={image.src}>{imageUrlLabel(image.src)}<svg className="inspector-image-external-icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 1.5h3.5V5M10.5 1.5 5.5 6.5M9.5 7v3.5h-8v-8H5" /></svg></a> : <span>{imageUrlLabel(image.src)}</span>}</p>
            <p className="inspector-image-size">{image.naturalWidth > 0 && image.naturalHeight > 0 ? `${image.naturalWidth} × ${image.naturalHeight}px` : 'Natural size unavailable'}{fileSize && fileSize > 0 ? ` ${fileSize < 1024 ? `${fileSize.toFixed(2)} B` : `${(fileSize / 1024).toFixed(2)} KB`}` : ''}</p>
          </div>
          <span className={`inspector-image-status ${status?.kind ?? 'unchecked'}`}>{status?.code ?? '—'}</span>
        </div>;
      }) : <Notice title={images.length ? 'No matching images' : 'No reportable images'}>{images.length ? 'Change the filters to see more images.' : 'Non-HTTP images and images without usable natural dimensions are excluded from this list.'}</Notice>}
    </section>
    {imageHelpOverlay ? createPortal(<div id="inspector-image-help-tooltip" className="inspector-image-help-tooltip" role="group" aria-label="Image alt text guidance" style={{ top: imageHelpOverlay.top, left: imageHelpOverlay.left }} onMouseEnter={cancelImageHelpHide} onMouseLeave={() => setImageHelpOverlay(undefined)}><p id="inspector-image-help-description">{imageHelpOverlay.text}</p><button type="button" className="inspector-image-help-audit" onClick={() => onOpenImageAudit?.()}>Open image audit →</button></div>, document.body) : null}
  </>;
}
