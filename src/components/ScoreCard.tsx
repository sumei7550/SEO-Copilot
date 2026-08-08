import type { SeoResult } from '../types/seo';
import { t } from '../utils/i18n';

export function ScoreCard({ result }: { result: SeoResult }) {
  const tone = result.score >= 90 ? 'text-emerald-400' : result.score >= 70 ? 'text-lime-400' : result.score >= 50 ? 'text-amber-400' : 'text-rose-400';
  return <section className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-slate-400">{t('scoreLabel')}</p><p className={`mt-1 text-5xl font-bold ${tone}`}>{result.score}<span className="text-lg text-slate-500">/100</span></p></div><div className="text-right"><p className="text-xs text-slate-400">{t('gradeLabel')}</p><p className="mt-1 font-semibold">{t(`grade${result.grade[0].toUpperCase()}${result.grade.slice(1)}`)}</p><p className="mt-2 text-xs text-slate-400">{t('issuesFound', String(result.issues.length))}</p></div></div><p className="mt-4 truncate text-sm text-slate-300" title={result.page.url}>{result.page.url}</p></section>;
}
