import { useCallback, useEffect, useRef, useState } from 'react';
import { ScoreCard } from '../components/ScoreCard';
import { Report } from '../report/Report';
import { t } from '../utils/i18n';
import { trackExtension } from '../analytics';
import { previewResult } from './previewResult';
import { scanActiveTab } from './scanActiveTab';
import { PerTabScanState, type ScanType, type TabScanState } from './perTabScanState';
import { hasSiteAccess, permissionPattern, requestSiteAccess } from './sitePermission';
import { loadActivationState, recordFirstScanCompletedAt, scanActivationProperties, type ActivationState } from '../onboarding/activation';

type ActivePage = { tab: chrome.tabs.Tab; url: string; pattern?: string; hasPermission: boolean };
const PERMISSION_MESSAGE = 'SEO Copilot needs access to this site to scan the page.';
const UNSUPPORTED_MESSAGE = "This page can't be scanned. Open a regular website and try again.";
const SCAN_TIMEOUT_MS = 30_000;

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'site-permission-denied') return PERMISSION_MESSAGE;
  if (error instanceof Error && error.message === 'unscannable-tab') return UNSUPPORTED_MESSAGE;
  return t('scanUnavailable');
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  return (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
}

async function withTimeout<T>(work: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => { timeout = setTimeout(() => reject(new Error('scan-timeout')), SCAN_TIMEOUT_MS); })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function App() {
  const isStorePreview = import.meta.env.DEV && !globalThis.chrome?.tabs;
  const showPreviewReport = isStorePreview && !new URLSearchParams(globalThis.location?.search ?? '').has('consent');
  const states = useRef(new PerTabScanState());
  const activePage = useRef<ActivePage | undefined>(undefined);
  const refreshVersion = useRef(0);
  const pendingActivation = useRef<number | undefined>(undefined);
  const viewed = useRef(new Set<number>());
  const viewProps = useRef(new Map<number, Record<string, unknown>>());
  const activation = useRef<ActivationState>({});
  const [activationReady, setActivationReady] = useState<boolean>(isStorePreview);
  const [page, setPage] = useState<ActivePage | undefined>();
  const [ready, setReady] = useState(false);
  const [, setRevision] = useState(0);
  const repaint = useCallback(() => setRevision((value) => value + 1), []);

  const refreshActiveTab = useCallback(async (updatedTabId?: number, updatedUrl?: string) => {
    const version = ++refreshVersion.current;
    try {
      const tab = await getActiveTab();
      if (version !== refreshVersion.current) return;
      if (!tab?.id) {
        activePage.current = undefined;
        setPage(undefined);
        setReady(true);
        pendingActivation.current = undefined;
        return;
      }
      const url = updatedTabId === tab.id && updatedUrl !== undefined ? updatedUrl : tab.url ?? '';
      const pattern = permissionPattern(url);
      // `tabs` permission makes the URL available before the user clicks Scan.
      const next: ActivePage = { tab: url === tab.url ? tab : { ...tab, url }, url, pattern, hasPermission: false };
      activePage.current = next;
      states.current.get(tab.id, url);
      setPage(next);
      repaint();
      next.hasPermission = pattern ? await hasSiteAccess(pattern) : false;
      if (version !== refreshVersion.current) return;
      activePage.current = next;
      setPage(next);
      setReady(true);
      pendingActivation.current = undefined;
    } catch (error) {
      if (version !== refreshVersion.current) return;
      console.error('SEO Copilot: failed to read active tab', error);
      setReady(true);
      pendingActivation.current = undefined;
    }
  }, [repaint]);

  useEffect(() => {
    trackExtension('ext_sidepanel_opened');
  }, []);

  useEffect(() => {
    if (!globalThis.chrome?.storage?.local) {
      setActivationReady(true);
      return;
    }
    let disposed = false;
    void loadActivationState().then((state) => {
      if (disposed) return;
      activation.current = state;
      setActivationReady(true);
    }).catch((error) => {
      if (disposed) return;
      console.error('SEO Copilot: failed to load first-scan state', error);
      setActivationReady(true);
    });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    if (!globalThis.chrome?.tabs || isStorePreview) return;
    const activated = (info: chrome.tabs.OnActivatedInfo) => {
      pendingActivation.current = info.tabId;
      activePage.current = undefined;
      setPage(undefined);
      setReady(false);
      void refreshActiveTab();
    };
    const updated = (tabId: number, change: chrome.tabs.OnUpdatedInfo) => {
      if (change.url !== undefined) {
        states.current.get(tabId, change.url);
        if (activePage.current?.tab.id === tabId) {
          setReady(false);
          void refreshActiveTab(tabId, change.url);
        }
      } else if (change.status === 'complete' && activePage.current?.tab.id === tabId) {
        // Same-URL refresh keeps a completed report. An in-flight scan will
        // either finish, fail, or hit its bounded timeout.
        void refreshActiveTab();
      }
    };
    const removed = (tabId: number) => {
      const current = states.current.remove(tabId);
      if (current && 'scanId' in current) {
        viewed.current.delete(current.scanId);
        viewProps.current.delete(current.scanId);
      }
      if (activePage.current?.tab.id === tabId) void refreshActiveTab();
    };
    void refreshActiveTab();
    chrome.tabs.onActivated.addListener(activated);
    chrome.tabs.onUpdated.addListener(updated);
    chrome.tabs.onRemoved.addListener(removed);
    return () => {
      chrome.tabs.onActivated.removeListener(activated);
      chrome.tabs.onUpdated.removeListener(updated);
      chrome.tabs.onRemoved.removeListener(removed);
    };
  }, [isStorePreview, refreshActiveTab]);

  const currentState: TabScanState = showPreviewReport
    ? { status: 'report', url: 'preview', scanId: 0, result: previewResult }
    : page?.tab.id !== undefined ? states.current.peek(page.tab.id, page.url) : { status: 'idle', url: '' };

  useEffect(() => {
    if (currentState.status !== 'report' || viewed.current.has(currentState.scanId) || showPreviewReport) return;
    viewed.current.add(currentState.scanId);
    trackExtension('ext_report_viewed', { ...viewProps.current.get(currentState.scanId), entry_point: 'sidepanel', issue_count: currentState.result.issues.length });
  }, [currentState, showPreviewReport]);

  const runScan = useCallback((forcedType?: ScanType) => {
    // No await before requestSiteAccess: the permission dialog is tied to this click.
    const target = activePage.current;
    if (!ready || !activationReady || pendingActivation.current !== undefined || !target?.tab.id) return;
    const tabId = target.tab.id;
    const url = target.url;
    const before = states.current.get(tabId, url);
    const previous = before.status === 'report' ? before.result : undefined;
    const scanType = forcedType ?? (previous ? 'rescan' : 'first');
    const scanId = states.current.start(tabId, url, scanType);
    if (scanId === undefined) return;
    repaint();

    const activationProps = scanActivationProperties(activation.current);
    let permissionGranted = target.hasPermission;
    const permissionRequired = !target.hasPermission && Boolean(target.pattern);
    const eventProps = () => ({
      scan_type: scanType, entry_point: 'sidepanel', ...activationProps,
      site_permission_required: permissionRequired, site_permission_granted: permissionGranted
    });
    viewProps.current.set(scanId, eventProps());
    trackExtension('ext_scan_started', eventProps());

    // Start the Chrome prompt synchronously, before entering the async flow.
    const permission = permissionRequired && target.pattern ? requestSiteAccess(target.pattern) : Promise.resolve();
    void (async () => {
      let stage = 'permission';
      try {
        if (!target.pattern) throw new Error('unscannable-tab');
        await permission;
        permissionGranted = true;
        target.hasPermission = true;
        viewProps.current.set(scanId, eventProps());
        if (!states.current.isCurrent(tabId, url, scanId)) return;
        stage = 'scan';
        const response = await withTimeout(scanActiveTab(target.tab));
        if (!response.ok || !response.result) throw new Error(response.errorKey ?? 'scanFailed');
        // A scan can finish while another tab is visible. Verify the owner tab
        // itself rather than comparing with whichever tab is currently active.
        const owner = await chrome.tabs.get(tabId);
        if (owner.url !== url || !states.current.complete(tabId, url, scanId, response.result)) return;
        if (!activation.current.firstScanCompletedAt) {
          const completedAt = Date.now();
          activation.current.firstScanCompletedAt = completedAt;
          void recordFirstScanCompletedAt(completedAt).catch((error) => {
            console.error('SEO Copilot: failed to record first scan', error);
          });
        }
        trackExtension('ext_scan_completed', {
          ...eventProps(), score: response.result.score, issue_count: response.result.issues.length,
          critical_count: response.result.issues.filter((issue) => issue.severity === 'critical').length,
          warning_count: response.result.issues.filter((issue) => issue.severity === 'warning').length,
          info_count: response.result.issues.filter((issue) => issue.severity === 'info').length,
          ...(previous ? { previous_score: previous.score, score_delta: response.result.score - previous.score } : {})
        });
        repaint();
      } catch (error) {
        if (!states.current.fail(tabId, url, scanId, errorMessage(error))) return;
        trackExtension(error instanceof Error && error.message === 'unscannable-tab' ? 'ext_unsupported_page' : 'ext_scan_failed', {
          ...eventProps(), error_code: error instanceof Error ? error.message : 'unknown', failure_stage: stage
        });
        repaint();
      }
    })();
  }, [ready, activationReady, repaint]);

  const status = currentState.status === 'scanning' ? t('scanning') : currentState.status === 'error' ? 'Scan failed' : currentState.status === 'report' ? 'Scan complete' : 'Ready to scan';
  return <main className="extension">
    <header className="app-header"><div><p className="eyebrow">{t('eyebrow')}</p><h1>{t('extensionName')}</h1></div><span className="scan-status"><span /> {status}</span></header>
    {currentState.status === 'scanning' ? <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">{t('scanning')}</div> : null}
    {currentState.status === 'error' ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><p className="font-semibold">{currentState.message === PERMISSION_MESSAGE ? 'Permission required' : 'Scan failed'}</p><p className="mt-1">{currentState.message}</p><button onClick={() => runScan(currentState.scanType)} disabled={!ready || !activationReady} className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{t('retry')}</button></div> : null}
    {currentState.status === 'report' ? <><ScoreCard result={currentState.result} /><Report result={currentState.result} onRescan={() => runScan('rescan')} /></> : null}
    {currentState.status === 'idle' ? <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Scan this page</h2><p className="mt-2 text-sm leading-6 text-slate-600">Check the current page for SEO issues.</p><p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">{t('scanPrivacyNote')}</p><button onClick={() => runScan()} disabled={!ready || !activationReady} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">{ready && activationReady ? 'Scan current page' : 'Checking page…'}</button></section> : null}
    <footer>{t('footer')} · <a className="text-indigo-600 hover:underline" href="https://sumei7550.github.io/SEO-Copilot/privacy.html" target="_blank" rel="noreferrer">{t('privacyPolicy')}</a></footer>
  </main>;
}
