import { useCallback, useState } from 'react';
import { ScoreCard } from '../components/ScoreCard';
import { Report } from '../report/Report';
import type { SeoResult } from '../types/seo';
import { t } from '../utils/i18n';
import { scanActiveTab } from './scanActiveTab';
import { previewResult } from './previewResult';

function getActiveTab(): Promise<chrome.tabs.Tab> { return chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => tabs[0]); }

export function App() {
  const isStorePreview = import.meta.env.DEV && !globalThis.chrome?.tabs;
  const showPreviewReport = isStorePreview && !new URLSearchParams(globalThis.location?.search ?? '').has('consent');
  const [result, setResult] = useState<SeoResult | undefined>(showPreviewReport ? previewResult : undefined);
  const [showReport, setShowReport] = useState<boolean>(showPreviewReport);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scan = useCallback(async () => { setLoading(true); setError(''); setShowReport(false); try { const response = await scanActiveTab(await getActiveTab()); if (!response.ok || !response.result) throw new Error(response.errorKey ?? 'scanFailed'); setResult(response.result); } catch { setError(t('scanUnavailable')); } finally { setLoading(false); } }, []);
  const rescan = useCallback(async () => { await scan(); setShowReport(true); }, [scan]);
  return <main className="extension"><header className="app-header"><div><p className="eyebrow">{t('eyebrow')}</p><h1>{t('extensionName')}</h1></div><span className="scan-status"><span /> Scan complete</span></header>{loading ? <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">{t('scanning')}</div> : error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><p>{error}</p><button onClick={() => void scan()} className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white">{t('retry')}</button></div> : result ? <><ScoreCard result={result} />{showReport ? <Report result={result} onRescan={() => void rescan()} /> : <button onClick={() => setShowReport(true)} className="rescan-button">{t('viewReport')} <span>→</span></button>}</> : <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">{t('scanConsentTitle')}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t('scanConsentBody')}</p><p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">{t('scanPrivacyNote')}</p><button onClick={() => void scan()} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">{t('scanPage')}</button></section>}<footer>{t('footer')} · <a className="text-indigo-600 hover:underline" href="https://sumei7550.github.io/SEO-Copilot/privacy.html" target="_blank" rel="noreferrer">{t('privacyPolicy')}</a></footer></main>;
}
