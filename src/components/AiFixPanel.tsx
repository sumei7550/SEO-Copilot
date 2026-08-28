import { useEffect, useState } from 'react';
import type { AiFixRequest, AiFixResponse, Recommendation } from '../types/aiFix';
import { generateSeoFix } from '../services/generateSeoFix';
import { AiServiceError } from '../services/generateSeoFix.real';
import type { AiErrorCode } from '../services/generateSeoFix.real';

const labels = ['Recommended', 'Alternative 1', 'Alternative 2'];
const RATE_LIMIT_FALLBACK_SECONDS = 10;

export function getRateLimitCountdownSeconds(error: Pick<AiServiceError, 'retryAfter' | 'retryAfterSeconds'>) {
  return error.retryAfterSeconds ?? error.retryAfter ?? RATE_LIMIT_FALLBACK_SECONDS;
}

export function decrementCountdown(seconds: number) {
  return Math.max(0, seconds - 1);
}

export function getAiFixErrorPresentation(code: AiErrorCode | undefined, countdownSeconds: number) {
  if (code === 'RATE_LIMITED') return {
    lines: ["You're making requests too quickly.", 'Please wait a few seconds and try again.'],
    retry: true,
    retryDisabled: countdownSeconds > 0,
    countdownLabel: countdownSeconds > 0 ? `Try again in ${countdownSeconds}s` : undefined,
  };
  if (code === 'DAILY_QUOTA_EXCEEDED') return {
    lines: ["Today's free AI limit has been reached.", 'Try again tomorrow.'],
    retry: false,
    retryDisabled: true,
    countdownLabel: undefined,
  };
  if (code === 'SERVICE_LIMIT_REACHED') return {
    lines: ['AI service limit has been reached for today.', 'Please try again later.'],
    retry: false,
    retryDisabled: true,
    countdownLabel: undefined,
  };
  return {
    lines: ['AI suggestions unavailable.', 'Please try again.'],
    retry: true,
    retryDisabled: false,
    countdownLabel: undefined,
  };
}

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
  const [generationError, setGenerationError] = useState<AiServiceError | undefined>();
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  const refreshRecommendations = async () => {
    setGenerating(true);
    setGenerationError(undefined);
    setCountdownSeconds(0);
    try {
      const result = await generateSeoFix(request);
      setResponse(result);
      setSelectedId((currentId) => result.recommendations.some((recommendation) => recommendation.id === currentId) ? currentId : result.recommendations[0]?.id ?? '');
    } catch (error) {
      setGenerationError(error instanceof AiServiceError ? error : new AiServiceError('AI suggestions unavailable.'));
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { void refreshRecommendations(); }, [request]);

  useEffect(() => {
    if (generationError?.code !== 'RATE_LIMITED') return;
    const seconds = getRateLimitCountdownSeconds(generationError);
    setCountdownSeconds(seconds);
    if (seconds <= 0) return;
    const timer = window.setInterval(() => {
      setCountdownSeconds(decrementCountdown);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [generationError]);

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
    {response && !generationError ? <><div className="before-after"><div><span>Before</span><code>{beforeMarkup(request)}</code></div><div className="after-preview"><span>After · AI recommendation</span><p>{selected?.content}</p></div></div>
      <div className="suggestion-header"><h4>3 AI recommendations</h4><span>Select one to copy</span></div>
      <div className="suggestion-list">{response.recommendations.map((recommendation, index) => <RecommendationCard key={recommendation.id} recommendation={recommendation} label={labels[index] ?? `Alternative ${index}`} selected={recommendation.id === selectedId} onSelect={() => setSelectedId(recommendation.id)} />)}</div>
      <div className="fix-actions"><button type="button" onClick={() => void refreshRecommendations()} className="secondary-button" disabled={generating}>↻ Generate another</button><button type="button" onClick={() => void copySelected()} className="primary-button">{copyStatus === 'success' ? '✓ Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy selected'}</button></div>
      <p className="copy-feedback" aria-live="polite">{copyStatus === 'success' ? 'Copied — paste this into your page source or CMS.' : copyStatus === 'failed' ? 'Copy failed' : ''}</p>
    </> : generationError ? <ErrorState error={generationError} countdownSeconds={countdownSeconds} onRetry={() => void refreshRecommendations()} generating={generating} /> : <p className="generating">Generating AI recommendations…</p>}
  </div>;
}

function ErrorState({ error, countdownSeconds, onRetry, generating }: { error: AiServiceError; countdownSeconds: number; onRetry: () => void; generating: boolean }) {
  const presentation = getAiFixErrorPresentation(error.code, countdownSeconds);
  return <div className="generating"><p>{presentation.lines.map((line, index) => <span key={line} className={index === 0 ? 'ai-error-primary' : 'ai-error-secondary'}>{index > 0 ? <br /> : null}{line}</span>)}{presentation.countdownLabel ? <><br /><span className="ai-error-countdown">{presentation.countdownLabel}</span></> : null}</p>{presentation.retry ? <button type="button" onClick={onRetry} className="secondary-button" disabled={generating || presentation.retryDisabled}>Retry</button> : null}</div>;
}

function RecommendationCard({ recommendation, label, selected, onSelect }: { recommendation: Recommendation; label: string; selected: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className={`suggestion ${selected ? 'selected' : ''}`}><span className="suggestion-top"><span className="suggestion-number">{label}</span><span className="select-mark">✓ Selected</span></span><span className="suggestion-copy">{recommendation.content}</span><span className="suggestion-reason"><b>Why this works</b>{recommendation.highlights.map((highlight) => <span key={highlight} className="highlight">✓ {highlight}</span>)}<em>{recommendation.rationale}</em></span></button>;
}

export { Sparkles };
