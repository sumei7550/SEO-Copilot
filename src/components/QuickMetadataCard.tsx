import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MetadataState } from '../popup/perTabMetadataState';
import { METADATA_LENGTH_LIMITS, metadataLengthStatus, type MetadataLengthField } from '../rules/metadataLength';

type Field = 'title' | 'metaDescription' | 'url';
const fieldLabels: Record<Field, string> = { title: 'Title', metaDescription: 'Meta description', url: 'URL' };
const lengthLabels = { missing: 'Missing', short: 'Short', 'in-range': 'In range', long: 'Long' } as const;

function LengthIndicator({ field, value }: { field: MetadataLengthField; value: string }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const status = metadataLengthStatus(field, value);
  const { max } = METADATA_LENGTH_LIMITS[field];
  const warning = status === 'short' || status === 'long';
  const tipId = `metadata-${field}-length-tip`;
  const tip = field === 'title' && status === 'short'
    ? "The title may be too short. Short titles may not clearly communicate the page's main topic to Google."
    : field === 'title' && status === 'long'
    ? 'The title may be too long. Lengthy page titles risk being truncated when presented in Google search results. The recommended maximum title length is ~60 characters.'
    : field === 'metaDescription' && status === 'short'
    ? "The meta description may be too short. It is recommended to write longer descriptions as they provide an explanation of the page's content to Google."
    : 'The meta description may be too long. Lengthy descriptions risk being truncated when presented in Google search results. The recommended maximum length is ~160 characters.';
  const showTip = warning && (hovered || focused);
  return <span className={`metadata-length is-${status}`} tabIndex={warning ? 0 : undefined}
    title={status === 'missing' ? `Missing ${fieldLabels[field].toLowerCase()}` : undefined}
    aria-label={`${fieldLabels[field]}: ${value.length} of ${max} characters; ${lengthLabels[status]}${status === 'long' ? `. Suggested maximum: ${max} characters` : ''}`}
    aria-describedby={showTip ? tipId : undefined}
    onMouseEnter={warning ? () => setHovered(true) : undefined} onMouseLeave={warning ? () => setHovered(false) : undefined}
    onFocus={warning ? () => setFocused(true) : undefined} onBlur={warning ? () => setFocused(false) : undefined}>
    {value.length}/{max}
    {showTip ? <span id={tipId} className="metadata-length-tooltip" role="tooltip">{tip}</span> : null}
  </span>;
}

function CopyIcon({ copied }: { copied: boolean }) {
  return copied
    ? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg>
    : <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></svg>;
}

function MissingDescriptionHelp({ onOpenAudit }: { onOpenAudit: () => void }) {
  const [position, setPosition] = useState<{ top: number; left: number }>();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelHide = () => { clearTimeout(hideTimer.current); hideTimer.current = undefined; };
  const hideSoon = () => { cancelHide(); hideTimer.current = setTimeout(() => setPosition(undefined), 150); };
  const show = (button: HTMLButtonElement) => {
    cancelHide();
    const bounds = button.getBoundingClientRect();
    const width = Math.min(240, window.innerWidth - 16);
    const left = Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8));
    const top = bounds.bottom + 110 <= window.innerHeight ? bounds.bottom + 4 : Math.max(8, bounds.top - 110);
    setPosition({ top, left });
  };
  useEffect(() => {
    if (!position) return;
    const hide = () => setPosition(undefined);
    const panel = document.querySelector('.inspector-tool-panel');
    panel?.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
    return () => { panel?.removeEventListener('scroll', hide); window.removeEventListener('resize', hide); };
  }, [position]);
  useEffect(() => () => clearTimeout(hideTimer.current), []);
  return <span className="metadata-missing-inline"><span className="metadata-missing-icon" aria-hidden="true">i</span><span>Missing</span><button type="button" className="metadata-missing-help-trigger" aria-label="How to fix missing meta description; open content audit" aria-describedby={position ? 'metadata-missing-help-description' : undefined} onMouseEnter={(event) => show(event.currentTarget)} onMouseLeave={hideSoon} onFocus={(event) => show(event.currentTarget)} onBlur={(event) => { if (!document.getElementById('metadata-missing-help-tooltip')?.contains(event.relatedTarget as Node)) hideSoon(); }} onClick={onOpenAudit}>How to fix →</button>{position ? createPortal(<div id="metadata-missing-help-tooltip" className="inspector-image-help-tooltip" role="group" aria-label="Meta description guidance" style={position} onMouseEnter={cancelHide} onMouseLeave={() => setPosition(undefined)}><p id="metadata-missing-help-description">Meta description not found. Run an SEO Audit for a recommended action.</p><button type="button" className="inspector-image-help-audit" onClick={onOpenAudit}>Open content audit →</button></div>, document.body) : null}</span>;
}

function MetadataField({ field, value, available = true, copied, onCopy, onOpenContentAudit }: {
  field: Field;
  value: string;
  available?: boolean;
  copied: boolean;
  onCopy: (field: Field, value: string) => void;
  onOpenContentAudit?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const empty = available && !value;
  const inlineMissing = field === 'metaDescription' && empty && Boolean(onOpenContentAudit);
  const valueId = `metadata-${field}`;

  useEffect(() => setExpanded(false), [value]);

  useLayoutEffect(() => {
    if (!available || !value) {
      setHasOverflow(false);
      return;
    }
    const measure = () => {
      const element = valueRef.current;
      if (!element) return;
      const wasCollapsed = element.classList.contains('is-collapsed');
      element.classList.remove('is-collapsed');
      const style = getComputedStyle(element);
      const lineHeight = Number.parseFloat(style.lineHeight) || 16.3;
      const overflows = element.scrollHeight > Math.ceil(lineHeight * 2) + 1;
      if (wasCollapsed) element.classList.add('is-collapsed');
      setHasOverflow(overflows);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    if (fieldRef.current) observer?.observe(fieldRef.current);
    return () => observer?.disconnect();
  }, [available, value]);

  return <div className={`metadata-field metadata-field-${field}`} ref={fieldRef}>
    <div className="metadata-field-head">
      <span className="metadata-field-label">{field === 'metaDescription' ? 'Description' : fieldLabels[field]}</span>
      {!inlineMissing ? <div className="metadata-field-actions">
        {available && field !== 'url' ? <LengthIndicator field={field} value={value} /> : null}
        <button type="button" className={`metadata-copy ${copied ? 'is-copied' : ''}`} aria-label={copied ? `${fieldLabels[field]} copied` : `Copy ${fieldLabels[field]}`} title={copied ? 'Copied' : `Copy ${fieldLabels[field]}`} disabled={!available || empty} onClick={() => onCopy(field, value)}><CopyIcon copied={copied} /></button>
      </div> : null}
    </div>
    <p id={valueId} ref={valueRef} className={`metadata-value ${field === 'url' ? 'metadata-url' : ''} ${hasOverflow && !expanded ? 'is-collapsed' : ''} ${!available || empty ? 'is-empty' : ''} ${inlineMissing ? 'has-missing-help' : ''}`}>
      {inlineMissing && onOpenContentAudit ? <MissingDescriptionHelp onOpenAudit={onOpenContentAudit} /> : available ? empty ? 'Not found' : value : 'Unavailable'}
    </p>
    {hasOverflow ? <button type="button" className="metadata-expand" aria-expanded={expanded} aria-controls={valueId} onClick={() => setExpanded((current) => !current)}>{expanded ? 'Show less' : 'Show more'}</button> : null}
  </div>;
}

export function QuickMetadataCard({ state, onRequestAccess, onOpenContentAudit, sectionTitle = 'Page metadata' }: { state: MetadataState; onRequestAccess?: () => Promise<void>; onOpenContentAudit?: () => void; sectionTitle?: string }) {
  const [feedback, setFeedback] = useState<{ message: string; failed: boolean }>({ message: '', failed: false });
  const [copiedField, setCopiedField] = useState<Field | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [accessPending, setAccessPending] = useState(false);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    clearTimeout(copyTimer.current);
    setCopiedField(null);
    setFeedback({ message: '', failed: false });
  }, [state.url, state.generation]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const copy = async (field: Field, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      clearTimeout(copyTimer.current);
      setCopiedField(field);
      copyTimer.current = setTimeout(() => setCopiedField(null), 1800);
      setFeedback({ message: `${fieldLabels[field]} copied`, failed: false });
    } catch {
      clearTimeout(copyTimer.current);
      setCopiedField(null);
      setFeedback({ message: 'Copy failed. Select the text and copy it manually.', failed: true });
    }
  };

  const requestAccess = async () => {
    if (!onRequestAccess) return;
    setAccessPending(true);
    setAccessError('');
    try {
      await onRequestAccess();
    } catch {
      setAccessError('Page access was not granted. You can try again or use Scan current page.');
    } finally {
      setAccessPending(false);
    }
  };

  const loading = state.status === 'idle' || state.status === 'reading';
  const ready = state.status === 'ready';
  const kind = state.status === 'error' ? state.kind : undefined;
  const labels = { idle: 'Reading…', reading: 'Reading…', ready: 'Current page', error: kind === 'access-needed' ? 'Access needed' : 'Unavailable' };
  const data = ready ? state.data : { title: '', metaDescription: '', url: state.url };

  return <section className="metadata-card" aria-labelledby="metadata-heading">
    <div className="metadata-heading"><h2 id="metadata-heading">{sectionTitle}</h2><span>{labels[state.status]}</span></div>
    <p className="metadata-hint">Read and copy this page's metadata.</p>
    {loading ? <div className="metadata-skeleton" role="status" aria-label="Reading page metadata"><span /><span /><span /><span /><span /><span /></div> : <>
      <MetadataField field="title" value={data.title} available={ready} copied={copiedField === 'title'} onCopy={copy} />
      <MetadataField field="metaDescription" value={data.metaDescription} available={ready} copied={copiedField === 'metaDescription'} onCopy={copy} onOpenContentAudit={onOpenContentAudit} />
      <MetadataField field="url" value={data.url} available={Boolean(data.url)} copied={copiedField === 'url'} onCopy={copy} />
    </>}
    {kind === 'access-needed' ? <div className="metadata-message is-warning"><strong>Page access needed</strong><p>Allow access to read metadata without running an audit. You can also click the toolbar icon on this tab.</p>{onRequestAccess ? <button type="button" className="metadata-access-button" disabled={accessPending} onClick={() => void requestAccess()}>{accessPending ? 'Requesting access…' : 'Allow access to this site'}</button> : null}{accessError ? <p role="alert">{accessError}</p> : null}</div> : null}
    {kind === 'restricted' ? <div className="metadata-message is-error"><strong>This Chrome page cannot be read</strong><p>Open a regular website to view its metadata or run an SEO Audit.</p></div> : null}
    {kind === 'read-failed' ? <div className="metadata-message is-error"><strong>Could not read this page</strong><p>Reload the page or open SEO Copilot again.</p></div> : null}
    {ready && (!data.title || (!data.metaDescription && !onOpenContentAudit)) ? <div className="metadata-message"><strong>{!data.title ? 'Title' : 'Meta description'} not found</strong><p>Run an SEO Audit for a recommended action.</p></div> : null}
    <p className={`metadata-feedback ${feedback.failed ? 'is-failure' : ''}`} role="status" aria-live="polite">{feedback.message}</p>
  </section>;
}
