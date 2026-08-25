import { useState } from 'react';
import type { AiFixRequest, AiFixType } from '../types/aiFix';
import type { PageData, PageMetrics, SeoIssue } from '../types/seo';
import { AiFixPanel, Sparkles } from './AiFixPanel';
import { t } from '../utils/i18n';
import { canUseAiFix } from '../utils/aiFix';
import { buildAiFixContext } from '../services/buildAiFixContext';

function getAiFixType(issue: SeoIssue): AiFixType | undefined {
  if (!canUseAiFix(issue)) return undefined;
  if (issue.id.startsWith('TITLE_')) return 'title';
  if (issue.id.startsWith('META_')) return 'metaDescription';
  if (issue.id === 'HEADING_001' || issue.id === 'HEADING_003') return 'h1';
  return undefined;
}

function getCurrentValue(type: AiFixType, page: PageData): string {
  if (type === 'title') return page.title;
  if (type === 'metaDescription') return page.metaDescription;
  return page.headings.filter((heading) => heading.level === 1).map((heading) => heading.text).join(' | ');
}

export function IssueList({ issues, page, metrics, onRescan }: { issues: SeoIssue[]; page: PageData; metrics: PageMetrics; onRescan: () => void }) {
  if (!issues.length) return <><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{t('noIssues')}</div><button className="rescan-button" type="button" onClick={onRescan}>Done editing? Re-scan page <span>→</span></button></>;
  return <><div className="issue-list">{issues.map((issue) => <IssueCard key={issue.id} issue={issue} page={page} metrics={metrics} />)}</div><button className="rescan-button" type="button" onClick={onRescan}>Done editing? Re-scan page <span>→</span></button></>;
}

function IssueCard({ issue, page, metrics }: { issue: SeoIssue; page: PageData; metrics: PageMetrics }) {
  const [open, setOpen] = useState(false);
  const fixType = getAiFixType(issue);
  const issueLabel = t(issue.messageKey);
  const request: AiFixRequest | undefined = fixType ? { type: fixType, issueId: issue.id, issueLabel, currentValue: getCurrentValue(fixType, page), page: { title: page.title, metaDescription: page.metaDescription, h1: getCurrentValue('h1', page) }, context: buildAiFixContext(page, issue, fixType, issueLabel) } : undefined;
  const severityClass = issue.severity === 'critical' ? 'high' : issue.severity;
  const severityLabel = issue.severity === 'critical' ? 'High' : t(`severity${issue.severity[0].toUpperCase()}${issue.severity.slice(1)}`);
  return <article className={`issue-card ${fixType ? '' : 'compact'} ${open ? 'is-open' : ''}`}>
    <div className="issue-topline"><span className={`severity ${severityClass}`}>{severityLabel}</span><span className="impact">{issue.impact} {t('points')}</span></div>
    <h3>{t(issue.messageKey)}</h3>
    {issue.id === 'IMAGE_002' ? <div className="image-alt-summary">
      <p className="issue-context"><b>Auditable</b><span>{metrics.auditableImageCount}</span></p>
      <p className="issue-context"><b>Missing alt</b><span>{metrics.imagesWithoutAlt}</span></p>
      <p className="issue-context"><b>Coverage</b><span>{metrics.altCoverage}%</span></p>
    </div> : null}
    {fixType ? <>
      <p className="issue-context"><b>Current</b><span>{getCurrentValue(fixType, page) || 'Not found'}</span></p>
      <p className="issue-context"><b>Impact</b><span>{t(issue.impactKey)}</span></p>
      <button type="button" onClick={() => setOpen((value) => !value)} className="ai-fix-button"><Sparkles />Improve with AI <span className={`chevron ${open ? 'is-open' : ''}`} aria-hidden="true" /></button>
    </> : <>
      <p className="issue-context"><b>Impact</b><span>{t(issue.impactKey)}</span></p>
      <div className="recommended-action"><span>Recommended Action</span><strong>{t(issue.solutionKey)}</strong></div>
    </>}
    {open && request ? <AiFixPanel request={request} /> : null}
  </article>;
}
