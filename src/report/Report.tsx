import type { SeoResult } from '../types/seo';
import { IssueList } from '../components/IssueList';
import { t } from '../utils/i18n';
export function Report({ result }: { result: SeoResult }) { return <section className="mt-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">{t('reportTitle')}</h2><span className="text-sm text-slate-500">{new Date(result.scannedAt).toLocaleTimeString()}</span></div><IssueList issues={result.issues} /></section>; }
