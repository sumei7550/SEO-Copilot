import type { ScoreCategory, SeoResult } from '../types/seo';
import { IssueList } from '../components/IssueList';
import { t } from '../utils/i18n';

export function Report({ result }: { result: SeoResult }) {
  const categories = Object.keys(result.categoryScores) as ScoreCategory[];
  return <section className="mt-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">{t('reportTitle')}</h2><span className="text-sm text-slate-500">{new Date(result.scannedAt).toLocaleTimeString()}</span></div><div className="mb-5 rounded-xl border border-slate-200 bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-900">{t('categoryScores')}</h3><div className="grid grid-cols-2 gap-3">{categories.map((category) => <div key={category}><div className="mb-1 flex justify-between text-xs text-slate-600"><span>{t(`category${category[0].toUpperCase()}${category.slice(1)}`)}</span><span>{result.categoryScores[category]}/{result.categoryWeights[category]}</span></div><div className="h-1.5 overflow-hidden rounded bg-slate-100"><div className="h-full rounded bg-indigo-500" style={{ width: `${(result.categoryScores[category] / result.categoryWeights[category]) * 100}%` }} /></div></div>)}</div></div><IssueList issues={result.issues} /></section>;
}
