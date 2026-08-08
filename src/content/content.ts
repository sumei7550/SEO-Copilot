import { scanPage } from '../analyzer/scanner';
import { analyzePage } from '../analyzer/pageAnalyzer';
import { evaluateRules } from '../rules/seoRules';
import { calculateScore } from '../scoring/score';
import type { ScanResponse } from '../types/seo';

chrome.runtime.onMessage.addListener((message: { type?: string }, _sender, sendResponse: (response: ScanResponse) => void) => {
  if (message.type !== 'SCAN_PAGE') return;
  try {
    const page = scanPage();
    const metrics = analyzePage(page);
    const issues = evaluateRules(page, metrics);
    const scoreResult = calculateScore(issues);
    sendResponse({ ok: true, result: { page, metrics, issues, ...scoreResult, scannedAt: Date.now() } });
  } catch {
    sendResponse({ ok: false, errorKey: 'scanFailed' });
  }
});
