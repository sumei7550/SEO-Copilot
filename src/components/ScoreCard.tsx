import type { SeoResult } from '../types/seo';
import { t } from '../utils/i18n';

export function ScoreCard({ result }: { result: SeoResult }) {
  const tone = result.score >= 90 ? 'text-emerald-400' : result.score >= 70 ? 'text-lime-400' : result.score >= 50 ? 'text-amber-400' : 'text-rose-400';
  return <section className="score-card"><div><p className="label">{t('scoreLabel')}</p><p className={`score ${tone}`}>{result.score}<small>/100</small></p></div><div className="score-side"><p className="label">{t('gradeLabel')}</p><strong>{t(`grade${result.grade[0].toUpperCase()}${result.grade.slice(1)}`)}</strong><p>{t('issuesFound', String(result.issues.length))}</p></div><p className="page-url" title={result.page.url}>{result.page.url}</p></section>;
}
