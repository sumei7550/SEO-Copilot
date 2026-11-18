import { useEffect, useRef, useState } from 'react';
import type { SeoResult } from '../types/seo';
import { IssueList } from '../components/IssueList';
import { t } from '../utils/i18n';
import { auditCategories, issuesForCategory, type AuditCategoryId } from './auditCategories';

export function Report({ result, onRescan, initialCategory = 'all', targetIssueId, targetNonce }: { result: SeoResult; onRescan: () => void; initialCategory?: AuditCategoryId | 'all'; targetIssueId?: string; targetNonce?: string }) {
  const [category, setCategory] = useState<AuditCategoryId | 'all'>(initialCategory);
  const issueListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategory(initialCategory);
    if (initialCategory !== 'all') issueListRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [result.scannedAt, initialCategory]);

  useEffect(() => {
    if (!targetIssueId) return;
    const issue = result.issues.find((item) => item.id === targetIssueId);
    const targetCategory = issue && auditCategories.find((item) => item.ruleCategories.some((ruleCategory) => ruleCategory === issue.category))?.id;
    if (targetCategory) setCategory(targetCategory);
  }, [result.scannedAt, result.issues, targetIssueId, targetNonce]);

  const visibleIssues = issuesForCategory(result.issues, category);
  const selectedLabel = auditCategories.find((item) => item.id === category)?.label ?? 'All issues';

  function selectCategory(next: AuditCategoryId) {
    setCategory(next);
    issueListRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }

  return <section className="report-view">
      <div className="section-heading"><div><h2>{t('reportTitle')}</h2><p>Issues found on this page</p></div><span className="issue-count">{result.issues.length}</span></div>
      <div className="severity-summary"><span className="critical"><b>{result.issues.filter((issue) => issue.severity === 'critical').length}</b>{t('severityCritical')}</span><span className="warning"><b>{result.issues.filter((issue) => issue.severity === 'warning').length}</b>{t('severityWarning')}</span><span className="info"><b>{result.issues.filter((issue) => issue.severity === 'info').length}</b>{t('severityInfo')}</span></div>
      <div className="audit-category-heading"><h3>Audit categories</h3><span>Issue counts</span></div>
      <div className="audit-category-grid" aria-label="Filter issues by category">{auditCategories.map((item) => <button type="button" className="audit-category-card" key={item.id} aria-pressed={category === item.id} onClick={() => selectCategory(item.id)}><span>{item.label}</span><b>{issuesForCategory(result.issues, item.id).length}</b></button>)}</div>
      <div className="audit-list-heading" ref={issueListRef}><h3>{selectedLabel}</h3>{category !== 'all' ? <button type="button" onClick={() => setCategory('all')}>Show all issues</button> : null}</div>
      {category !== 'all' && !visibleIssues.length ? <><div className="audit-category-empty"><strong>No issues in this category</strong><p>Choose another category or show all issues.</p><button type="button" onClick={() => setCategory('all')}>Show all issues</button></div><button className="rescan-button" type="button" onClick={onRescan}>Done editing? Re-scan page <span>→</span></button></> : <IssueList issues={visibleIssues} page={result.page} metrics={result.metrics} onRescan={onRescan} targetIssueId={targetIssueId} targetNonce={targetNonce} />}
  </section>;
}
