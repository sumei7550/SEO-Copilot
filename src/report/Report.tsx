import type { SeoResult } from '../types/seo';
import { IssueList } from '../components/IssueList';
import { t } from '../utils/i18n';

export function Report({ result, onRescan }: { result: SeoResult; onRescan: () => void }) {
  return <section className="report-view"><div className="section-heading"><div><h2>{t('reportTitle')}</h2><p>Prioritized by SEO impact</p></div><span className="issue-count">{result.issues.length}</span></div><div className="severity-summary"><span><b>{result.issues.filter((issue) => issue.severity === 'critical').length}</b>{t('severityCritical')}</span><span><b>{result.issues.filter((issue) => issue.severity === 'warning').length}</b>{t('severityWarning')}</span><span><b>{result.issues.filter((issue) => issue.severity === 'info').length}</b>{t('severityInfo')}</span></div><IssueList issues={result.issues} page={result.page} metrics={result.metrics} onRescan={onRescan} /></section>;
}
