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
  return <main className="min-h-[560px] w-[400px] bg-slate-50 p-5"><header className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{t('eyebrow')}</p><h1 className="text-2xl font-bold text-slate-950">{t('extensionName')}</h1></header>{loading ? <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">{t('scanning')}</div> : error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><p>{error}</p><button onClick={() => void scan()} className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white">{t('retry')}</button></div> : result ? <><ScoreCard result={result} /><div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs"><div><strong className="block text-base text-rose-600">{result.issues.filter((issue) => issue.severity === 'critical').length}</strong>{t('severityCritical')}</div><div><strong className="block text-base text-amber-600">{result.issues.filter((issue) => issue.severity === 'warning').length}</strong>{t('severityWarning')}</div><div><strong className="block text-base text-sky-600">{result.issues.filter((issue) => issue.severity === 'info').length}</strong>{t('severityInfo')}</div></div><button onClick={() => setShowReport((value) => !value)} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">{t(showReport ? 'hideReport' : 'viewReport')}</button>{showReport ? <Report result={result} /> : null}</> : <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">{t('scanConsentTitle')}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t('scanConsentBody')}</p><p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">{t('scanPrivacyNote')}</p><button onClick={() => void scan()} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">{t('scanPage')}</button></section>}<footer className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><span>{t('footer')}</span><span aria-hidden="true">·</span><a className="text-indigo-600 hover:underline" href="https://sumei7550.github.io/SEO-Copilot/privacy.html" target="_blank" rel="noreferrer">{t('privacyPolicy')}</a></footer></main>;
}
