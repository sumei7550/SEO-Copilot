import { useEffect, useState } from 'react';
import type { AiFixRequest, AiFixResponse, Recommendation } from '../types/aiFix';
import { generateSeoFix } from '../services/generateSeoFix';

const labels = ['Recommended', 'Alternative 1', 'Alternative 2'];

function Sparkles({ large = false }: { large?: boolean }) {
  return <svg className={large ? 'h-7 w-7 shrink-0 rounded-lg bg-violet-100 p-1.5 fill-violet-700' : 'h-4 w-4 shrink-0 fill-violet-700'} viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 9.2 6.8 14.5 8l-5.3 1.2L8 14.5 6.8 9.2 1.5 8l5.3-1.2L8 1.5Z" /><path d="m13 1 .45 1.55L15 3l-1.55.45L13 5l-.45-1.55L11 3l1.55-.45L13 1Z" /></svg>;
}

function beforeMarkup(request: AiFixRequest) {
  if (request.type === 'title') return `<title>${request.currentValue}</title>`;
  if (request.type === 'metaDescription') return `<meta name="description" content="${request.currentValue}">`;
  return `<h1>${request.currentValue}</h1>`;
}

export function AiFixPanel({ request }: { request: AiFixRequest }) {
  const [response, setResponse] = useState<AiFixResponse>();
  const [selectedId, setSelectedId] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [generating, setGenerating] = useState(false);

  const refreshRecommendations = async () => {
    setGenerating(true);
    try {
      const result = await generateSeoFix(request);
      setResponse(result);
      setSelectedId((currentId) => result.recommendations.some((recommendation) => recommendation.id === currentId) ? currentId : result.recommendations[0]?.id ?? '');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { void refreshRecommendations(); }, [request]);

  const selected = response?.recommendations.find((recommendation) => recommendation.id === selectedId);

  const fallbackCopy = (text: string): boolean => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let copiedByFallback = false;
    try {
      copiedByFallback = document.execCommand('copy');
    } catch {
      copiedByFallback = false;
    } finally {
      document.body.removeChild(textarea);
    }
    return copiedByFallback;
  };

  const copySelected = async () => {
    if (!selected) return;
    setCopyStatus('idle');
    let copiedSuccessfully = false;
    try {
      await navigator.clipboard.writeText(selected.content);
      copiedSuccessfully = true;
    } catch {
      copiedSuccessfully = fallbackCopy(selected.content);
    }
    setCopyStatus(copiedSuccessfully ? 'success' : 'failed');
    window.setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return <div className="fix-panel">
    <div className="fix-intro"><Sparkles large /><div><h4>AI SEO Fix</h4><p>Generate a better {request.type === 'metaDescription' ? 'meta description' : request.type === 'h1' ? 'H1 heading' : 'SEO title'} for this page.</p></div></div>
    <div className="fix-detail-grid"><div><span>Issue</span><strong>{request.issueLabel}</strong></div><div><span>Current</span><strong>{request.currentValue || 'Not found'}</strong></div></div>
    {response ? <><div className="before-after"><div><span>Before</span><code>{beforeMarkup(request)}</code></div><div className="after-preview"><span>After · AI recommendation</span><p>{selected?.content}</p></div></div>
      <div className="suggestion-header"><h4>3 AI recommendations</h4><span>Select one to copy</span></div>
      <div className="suggestion-list">{response.recommendations.map((recommendation, index) => <RecommendationCard key={recommendation.id} recommendation={recommendation} label={labels[index] ?? `Alternative ${index}`} selected={recommendation.id === selectedId} onSelect={() => setSelectedId(recommendation.id)} />)}</div>
      <div className="fix-actions"><button type="button" onClick={() => void refreshRecommendations()} className="secondary-button" disabled={generating}>↻ Generate another</button><button type="button" onClick={() => void copySelected()} className="primary-button">{copyStatus === 'success' ? '✓ Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy selected'}</button></div>
      <p className="copy-feedback" aria-live="polite">{copyStatus === 'success' ? 'Copied — paste this into your page source or CMS.' : copyStatus === 'failed' ? 'Copy failed' : ''}</p>
    </> : <p className="generating">Generating AI recommendations…</p>}
  </div>;
}

function RecommendationCard({ recommendation, label, selected, onSelect }: { recommendation: Recommendation; label: string; selected: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className={`suggestion ${selected ? 'selected' : ''}`}><span className="suggestion-top"><span className="suggestion-number">{label}</span><span className="select-mark">✓ Selected</span></span><span className="suggestion-copy">{recommendation.content}</span><span className="suggestion-reason"><b>Why this works</b>{recommendation.highlights.map((highlight) => <span key={highlight} className="highlight">✓ {highlight}</span>)}<em>{recommendation.rationale}</em></span></button>;
}

export { Sparkles };
