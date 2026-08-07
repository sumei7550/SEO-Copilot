import type { SeoResult } from '../types/seo';
import { t } from '../utils/i18n';

export function ScoreCard({ result }: { result: SeoResult }) {
  const tone = result.score >= 80 ? 'text-emerald-600' : result.score >= 50 ? 'text-amber-600' : 'text-rose-600';
  return <section className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-slate-400">{t('scoreLabel')}</p><p className={`mt-1 text-5xl font-bold ${tone}`}>{result.score}</p></div><div className="text-right"><p className="text-xs text-slate-400">{t('issuesLabel')}</p><p className="mt-1 text-3xl font-semibold">{result.issues.length}</p></div></div><p className="mt-4 text-sm text-slate-300">{result.page.url}</p></section>;
}
