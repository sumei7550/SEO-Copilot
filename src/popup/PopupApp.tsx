import { useCallback, useEffect, useRef, useState } from 'react';
import { PerTabMetadataState, type MetadataState } from './perTabMetadataState';
import { MetadataReadError, readActiveTabMetadata } from './quickMetadata';
import { permissionPattern, requestSiteAccess } from './sitePermission';
import type { AuditIntent } from './auditIntent';
import { previewResult } from './previewResult';
import { scanActiveTab } from './scanActiveTab';
import { getSnapshot, putSnapshot, startSnapshotScan } from './sessionSnapshot';
import { PopupToolViews, type PageScanState, type PopupTool } from './PopupToolViews';

const tools: Array<{ id: PopupTool; label: string }> = [
  { id: 'content', label: 'Content' },
  { id: 'indexability', label: 'Indexability' },
  { id: 'structured', label: 'Structured data' },
  { id: 'social', label: 'Social tags' },
  { id: 'images', label: 'Images' },
  { id: 'links', label: 'Outgoing links' }
];
const toolIssueIds: Record<PopupTool, string[]> = {
  content: ['TITLE_001', 'TITLE_002', 'TITLE_003', 'TITLE_004', 'META_001', 'META_002', 'META_003', 'HEADING_001', 'HEADING_002', 'HEADING_003'],
  indexability: ['URL_001', 'URL_002', 'TECH_001'],
  structured: ['TECH_002', 'TECH_003'],
  images: ['IMAGE_001', 'IMAGE_002', 'IMAGE_003', 'IMAGE_004'],
  social: [],
  links: []
};
const imageAltIssueIds = new Set(['IMAGE_001', 'IMAGE_002', 'IMAGE_004']);

export function PopupApp() {
  const states = useRef(new PerTabMetadataState());
  const activeTabId = useRef<number | undefined>(undefined);
  const activeTabUrl = useRef('');
  const opening = useRef(false);
  const scanVersion = useRef(0);
  const [tab, setTab] = useState<chrome.tabs.Tab>();
  const [metadata, setMetadata] = useState<MetadataState>({ status: 'idle', url: '', generation: 0 });
  const [openError, setOpenError] = useState('');
  const [openingPanel, setOpeningPanel] = useState(false);
  const [scanState, setScanState] = useState<PageScanState>({ status: 'idle' });
  const [tool, setTool] = useState<PopupTool>('content');
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    const outside = (event: MouseEvent) => { if (!helpRef.current?.contains(event.target as Node)) setHelpOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setHelpOpen(false); };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [helpOpen]);

  const loadPageData = useCallback((target: chrome.tabs.Tab) => {
    if (!target.id || !target.url || !permissionPattern(target.url)) return;
    const tabId = target.id;
    const url = target.url;
    const version = ++scanVersion.current;
    setScanState({ status: 'scanning' });
    void (async () => {
      try {
        const cached = await getSnapshot(tabId, url);
        if (version !== scanVersion.current) return;
        if (cached.ok && cached.result) {
          setScanState({ status: 'ready', result: cached.result });
          return;
        }
        const started = await startSnapshotScan(tabId, url);
        if (version !== scanVersion.current) return;
        const response = await scanActiveTab(target);
        const owner = await chrome.tabs.get(tabId);
        if (version !== scanVersion.current || owner.url !== url || owner.status === 'loading'
          || !response.ok || !response.result || response.result.page.url !== url) {
          if (version === scanVersion.current) setScanState({ status: 'error', message: 'Could not scan this page. Try again.' });
          return;
        }
        if (started.ok && Number.isInteger(started.generation)) {
          const published = await putSnapshot(tabId, url, started.generation, response.result);
          if (version !== scanVersion.current) return;
          if (!published.ok && published.reason === 'stale') {
            setScanState({ status: 'error', message: 'Page changed during the scan. Try again.' });
            return;
          }
        }
        setScanState({ status: 'ready', result: response.result });
      } catch {
        if (version === scanVersion.current) setScanState({ status: 'error', message: 'Could not scan this page. Try again.' });
      }
    })();
  }, []);

  const read = useCallback((target: chrome.tabs.Tab) => {
    if (!target.id) return;
    const url = target.url ?? '';
    const request = states.current.begin(target.id, url);
    if (!request) return;
    setMetadata(states.current.peek(target.id, url));
    void (async () => {
      try {
        const data = await readActiveTabMetadata(target);
        const owner = await chrome.tabs.get(target.id!);
        if (owner.url === url && owner.status !== 'loading') {
          if (states.current.complete(target.id!, url, request.generation, request.requestId, data)) loadPageData(owner);
        } else states.current.fail(target.id!, url, request.generation, request.requestId, 'read-failed');
      } catch (error) {
        states.current.fail(target.id!, url, request.generation, request.requestId, error instanceof MetadataReadError ? error.kind : 'read-failed');
        if (activeTabId.current === target.id && activeTabUrl.current === url) setScanState({ status: 'error', message: error instanceof MetadataReadError && error.kind === 'access-needed' ? 'Page access needed.' : 'Could not scan this page.' });
      }
      if (activeTabId.current === target.id && activeTabUrl.current === url) setMetadata(states.current.peek(target.id!, url));
    })();
  }, [loadPageData]);

  useEffect(() => {
    if (!globalThis.chrome?.tabs) {
      setMetadata({ status: 'ready', url: previewResult.page.url, generation: 0, data: {
        title: previewResult.page.title, metaDescription: previewResult.page.metaDescription, url: previewResult.page.url
      } });
      return;
    }
    let active = true;
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([current]) => {
      if (!active || !current) return;
      activeTabId.current = current.id;
      activeTabUrl.current = current.url ?? '';
      setTab(current);
      if (current.status !== 'loading') read(current);
    });
    const updated = (tabId: number, change: chrome.tabs.OnUpdatedInfo, updatedTab: chrome.tabs.Tab) => {
      if (tabId !== activeTabId.current || (change.url === undefined && change.status !== 'loading' && change.status !== 'complete')) return;
      const url = change.url ?? updatedTab.url ?? '';
      activeTabUrl.current = url;
      if (change.url !== undefined || change.status === 'loading') {
        states.current.invalidate(tabId, url);
        scanVersion.current += 1;
        setScanState({ status: 'idle' });
      }
      setTab({ ...updatedTab, url });
      setMetadata(states.current.peek(tabId, url));
      if (updatedTab.status === 'complete') read(updatedTab);
    };
    chrome.tabs.onUpdated.addListener(updated);
    const activated = () => {
      scanVersion.current += 1;
      setScanState({ status: 'idle' });
      void chrome.tabs.query({ active: true, currentWindow: true }).then(([current]) => {
        if (!active || !current) return;
        activeTabId.current = current.id;
        activeTabUrl.current = current.url ?? '';
        setTab(current);
        setMetadata(current.id ? states.current.peek(current.id, current.url ?? '') : { status: 'idle', url: '', generation: 0 });
        if (current.status !== 'loading') read(current);
      });
    };
    chrome.tabs.onActivated?.addListener(activated);
    return () => {
      active = false;
      chrome.tabs.onUpdated.removeListener(updated);
      chrome.tabs.onActivated?.removeListener(activated);
    };
  }, [read]);

  const openAudit = (category?: 'images' | 'content') => {
    if (!tab?.id || !tab.windowId || !tab.url || opening.current || !permissionPattern(tab.url)) return;
    opening.current = true;
    setOpeningPanel(true);
    setOpenError('');
    const intent: AuditIntent = { id: crypto.randomUUID(), tabId: tab.id, windowId: tab.windowId, url: tab.url, ...(category ? { category } : {}) };
    // Both API calls start in this click gesture. Awaiting either one first
    // could cause Chrome to reject sidePanel.open().
    const queued = chrome.runtime.sendMessage({ type: 'QUEUE_AUDIT_INTENT', intent });
    const opened = chrome.sidePanel.open({ windowId: tab.windowId });
    void Promise.all([queued, opened]).then(() => window.close()).catch(() => {
      void chrome.runtime.sendMessage({ type: 'CANCEL_AUDIT_INTENT', intent }).catch(() => {});
      opening.current = false;
      setOpeningPanel(false);
      setOpenError('Could not open SEO Audit. Try again.');
    });
  };

  const requestMetadataAccess = () => {
    const current = tab;
    const pattern = permissionPattern(current?.url ?? '');
    if (!current?.id || !pattern) return Promise.reject(new Error('unscannable-tab'));
    // The request starts directly in the Metadata card button's click gesture.
    return requestSiteAccess(pattern).then(async () => {
      const owner = await chrome.tabs.get(current.id!);
      if (owner.url !== current.url || owner.status === 'loading') throw new Error('page-changed');
      states.current.invalidate(current.id!, current.url!);
      read(owner);
    });
  };

  const restricted = tab?.url ? !permissionPattern(tab.url) : false;
  const status = metadata.status === 'error' && metadata.kind === 'access-needed' ? 'Access needed'
    : scanState.status === 'error' ? 'Scan failed'
      : scanState.status === 'ready' ? 'Current page'
      : restricted || !tab ? 'Unavailable' : 'Scanning…';
  const structuredFormats = tool === 'structured' && scanState.status === 'ready' && scanState.result
    ? Array.from(new Set([
      ...(scanState.result.page.jsonLdBlockCount ? ['JSON-LD'] : []),
      ...scanState.result.page.schemas.map((schema) => schema.format ?? 'JSON-LD')
    ]))
    : [];
  const logo = globalThis.chrome?.runtime?.getURL?.('icons/icon48.png') ?? '/icons/icon48.png';
  return <main className={`inspector-popup${tool === 'indexability' ? ' is-indexability' : ''}`}>
    <div className="inspector-workspace">
      <aside className="inspector-sidebar">
        <header className="inspector-brand-header" ref={helpRef}>
          <div className="inspector-brand"><img src={logo} alt="" width="26" height="26" /><h1>SEO Copilot</h1></div>
          <button type="button" className="inspector-help-button" aria-label="How to use" aria-expanded={helpOpen} onClick={() => setHelpOpen((value) => !value)}>?
            <span className="inspector-help-tooltip" aria-hidden="true">How to use</span>
          </button>
          {helpOpen ? <div className="inspector-help-popover" role="dialog" aria-label="How to use SEO Copilot"><strong>How to use SEO Copilot</strong><p>Choose a tool to inspect this page. Open SEO Audit for prioritized issues.</p><a href="https://seo-copilot-website.vercel.app/features/#feature-workflow" target="_blank" rel="noopener noreferrer">View guide</a></div> : null}
        </header>
        <nav className="inspector-tool-nav" role="tablist" aria-label="Page tools">{tools.map((item) => {
          const issueIds = toolIssueIds[item.id];
          const toolIssues = scanState.status === 'ready' ? scanState.result?.issues.filter((issue) => issueIds.includes(issue.id)
            && !(item.id === 'content' && issue.id === 'HEADING_001' && scanState.result?.page.headings.length === 0)) ?? [] : [];
          const issueCount = item.id === 'images'
            ? new Set(toolIssues.map((issue) => imageAltIssueIds.has(issue.id) ? 'image-alt' : issue.id)).size
            : toolIssues.length;
          return <button type="button" role="tab" key={item.id} aria-selected={tool === item.id} onClick={() => { setTool(item.id); setHelpOpen(false); }}><span>{item.label}</span>{issueCount > 0 ? <span className={`inspector-nav-count${item.id === 'indexability' && toolIssues.some((issue) => issue.id === 'TECH_001') ? ' is-critical' : ''}`} aria-label={`${issueCount} ${item.label.toLowerCase()} issues`}>{issueCount}</span> : null}</button>;
        })}</nav>
      </aside>
      <div className="inspector-right">
        <header className="inspector-right-header"><h2>{tools.find((item) => item.id === tool)?.label}{structuredFormats.length === 1 ? <span className="inspector-header-schema-format">{structuredFormats[0]}</span> : null}{tool === 'images' && scanState.status === 'ready' && scanState.result ? <span className="inspector-header-count" aria-label={`${scanState.result.page.images.length}${scanState.result.page.imageLimitReached ? ' or more' : ''} reportable images`}>{scanState.result.page.images.length}{scanState.result.page.imageLimitReached ? '+' : ''}</span> : null}</h2><div className="inspector-header-actions" aria-label="Page actions"><span className={`inspector-page-state ${status === 'Current page' ? '' : status === 'Scanning…' ? 'is-busy' : 'is-error'}`}>{status}</span></div></header>
        <div className="inspector-tool-panel" role="tabpanel" aria-label={tools.find((item) => item.id === tool)?.label}><PopupToolViews tool={tool} metadata={metadata} scan={scanState} tabId={tab?.id} onRetry={() => { if (tab) loadPageData(tab); }} onRequestAccess={requestMetadataAccess} onOpenImageAudit={() => openAudit('images')} onOpenContentAudit={() => openAudit('content')} /></div>
      </div>
    </div>
    <footer className="inspector-footer"><button type="button" className="primary-button popup-audit-button" onClick={() => openAudit()} disabled={!tab?.id || restricted || openingPanel}>{openingPanel ? 'Opening SEO Audit…' : <>Open SEO Audit <span aria-hidden="true">→</span></>}</button>{openError ? <p className="popup-open-error" role="alert">{openError}</p> : null}</footer>
  </main>;
}
