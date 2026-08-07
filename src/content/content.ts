import { scanPage } from '../analyzer/scanner';
import { evaluateRules } from '../rules/seoRules';
import { calculateScore } from '../scoring/score';
import type { ScanResponse } from '../types/seo';

chrome.runtime.onMessage.addListener((message: { type?: string }, _sender, sendResponse: (response: ScanResponse) => void) => {
  if (message.type !== 'SCAN_PAGE') return;
  const page = scanPage();
  const issues = evaluateRules(page);
  sendResponse({ ok: true, result: { page, issues, score: calculateScore(issues), scannedAt: Date.now() } });
  return true;
});
