import type { SeoFixRequest } from './types.js';

export function buildSeoFixPrompt(request: SeoFixRequest): string {
  const target = request.issueType === 'title' ? 'title' : 'meta description';
  return [
    'You are an SEO editor. Generate useful, factual candidates for the requested page element.',
    `Target issue type: ${request.issueType} (${target})`,
    'Return ONLY valid JSON in this exact shape: {"recommendations":[{"content":"...","rationale":"..."}]}.' ,
    'Return 1 to 3 recommendations. Content must be plain text, non-empty, and ready to copy.',
    'Preserve the page topic, main entities, and language. Do not invent facts, prices, features, customers, data, or certifications.',
    'Do not return Markdown, HTML, explanations outside the JSON, or recommendations for another element.',
    `Current value: ${request.currentValue}`,
    `Title: ${request.title}`,
    `Meta description: ${request.meta}`,
    `H1: ${request.h1}`,
    `URL: ${request.url}`,
    `Brand: ${request.brand ?? ''}`,
    `Page context: ${JSON.stringify(request.pageContext)}`,
  ].join('\n');
}
