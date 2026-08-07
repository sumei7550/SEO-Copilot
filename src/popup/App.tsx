import { useCallback, useEffect, useState } from 'react';
import { ScoreCard } from '../components/ScoreCard';
import { Report } from '../report/Report';
import type { ScanResponse, SeoResult } from '../types/seo';
import { t } from '../utils/i18n';

function getActiveTab(): Promise<chrome.tabs.Tab> { return chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => tabs[0]); }

export function App() {
  const [result, setResult] = useState<SeoResult>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const scan = useCallback(async () => { setLoading(true); setError(''); try { const tab = await getActiveTab(); if (!tab.id) throw new Error('no-tab'); const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_PAGE' }) as ScanResponse; if (!response.ok || !response.result) throw new Error(response.errorKey ?? 'scanFailed'); setResult(response.result); } catch { setError(t('scanUnavailable')); } finally { setLoading(false); } }, []);
  useEffect(() => { void scan(); }, [scan]);
  return <main className="min-h-[560px] w-[380px] bg-slate-50 p-5"><header className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{t('eyebrow')}</p><h1 className="text-2xl font-bold text-slate-950">{t('extensionName')}</h1></header>{loading ? <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">{t('scanning')}</div> : error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><p>{error}</p><button onClick={() => void scan()} className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white">{t('retry')}</button></div> : result ? <><ScoreCard result={result} /><Report result={result} /></> : null}<footer className="mt-5 text-center text-xs text-slate-400">{t('footer')}</footer></main>;
}
