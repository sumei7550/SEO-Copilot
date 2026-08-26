# SEO Copilot V1.2 — 20-Site Regression Test

**Date:** 2026-08-08
**Extension version:** 1.0.0
**Test method:** Static HTML regression (Node fetch + `curl` fallback) that runs the extension's real rule set (`src/rules/seoRules.ts`) and scoring (`src/scoring/score.ts`) against each site's initial HTML.
**Goal:** Verify scanner stability, parser crash-safety, and rule sanity — **not** absolute SEO score.

---

## Scope and honesty note

This session cannot drive a real Chrome instance, so full live-DOM testing (SPA post-hydration, image transfer sizes from `performance.getEntriesByType('resource')`, extension injection into `chrome-extension://` protocols, popup UI) is **not covered here**. What this run does cover:

* Initial-HTML parsing does not throw on any of the 20 targets.
* Every rule in `seoRules.ts` produces the expected verdict against real-world HTML.
* JSON-LD parsing handles 0, 1, and multi-block cases without unhandled exceptions.
* Score aggregation stays within `[0, 100]` on every input.

Sites where server-rendered HTML is a shell and content only appears after JS (TikTok, Amazon anti-bot, Reddit) are flagged as **needs live-Chrome verification**. Their static score is not a defect of the scanner; the scanner reads the *live DOM* at scan time, which will look very different from the raw HTML the server returns to a headless client.

---

## Result matrix

Legend: ✅ scan completed without throwing · ⚠️ requires live-Chrome follow-up · Bytes = raw HTML fetched · ms = fetch+parse elapsed.

### 1. Static sites (HTML/CSS)

| # | Site | Scan | Score gen | Console | Schema | Perf | Title len | H1 | Words | Score/Grade | Notes |
|---|------|------|-----------|---------|--------|------|-----------|----|-------|-------------|-------|
| 1 | GitHub Pages (pages.github.com) | ✅ | ✅ | ✅ (n/a static) | ✅ 1 WebSite | ✅ 921ms | 139 | 3 | 701 | 93 / excellent | TITLE_003 (>60 chars) fires — expected |
| 2 | Bootstrap Docs (getbootstrap.com) | ✅ | ✅ | ✅ | ➖ 0 | ✅ 1105ms | 68 | 1 | 1525 | 91 / excellent | `<title>` count = 6 (multiple in-page samples); TITLE_004 fires — cosmetic, not a bug |
| 3 | MDN Web Docs | ✅ | ✅ | ✅ | ➖ 0 | ✅ 812ms | 12 | 1 | 1195 | 89 / good | Very short title "MDN Web Docs" triggers TITLE_002 |

### 2. CMS platforms

| # | Site | Scan | Score gen | Schema | Perf | Title len | H1 | Words | Score | Notes |
|---|------|------|-----------|--------|------|-----------|----|-------|-------|-------|
| 4 | WordPress.org | ✅ | ✅ | ✅ 1 | ✅ 1618ms | 61 | 1 | 525 | 93 / excellent | Clean run |
| 5 | TechCrunch | ✅ | ✅ | ✅ 1 | ✅ 1371ms | 40 | 0 | 2102 | 84 / good | H1 = 0 in shell HTML — likely rendered by React later; **needs live Chrome check** |
| 6 | White House (Drupal) | ✅ | ✅ | ✅ 2 WebPage | ✅ 1232ms | 15 | 1 | 693 | 89 / good | Meta description 251 chars → META_003 fires as expected |

### 3. Next.js sites

| # | Site | Scan | Score gen | Schema | Perf | Title len | H1 | Words | Score | Notes |
|---|------|------|-----------|--------|------|-----------|----|-------|-------|-------|
| 7 | Next.js | ✅ | ✅ | ➖ 0 | ✅ 417ms | 39 | 1 | 1091 | 85 / good | No canonical in initial HTML |
| 8 | Vercel | ✅ | ✅ | ✅ 1 SoftwareApplication | ✅ 363ms | 31 | 1 | 547 | 92 / excellent | Fastest fetch |
| 9 | TikTok | ✅ (no crash) | ⚠️ | ➖ 0 | ⚠️ 4049ms | 22 | 0 | 0 | 62 / needsImprovement | Server returns app shell; content injected client-side. **Needs live-Chrome test** to confirm scanner reads post-hydration DOM correctly. |

### 4. SPA frameworks

| # | Site | Scan | Score gen | Schema | Perf | Title len | H1 | Words | Score | Notes |
|---|------|------|-----------|--------|------|-----------|----|-------|-------|-------|
| 10 | React.dev | ✅ | ✅ | ➖ 0 | ✅ 491ms | 5 | 2 | 1310 | 83 / good | Title "React" is 5 chars → TITLE_002 fires. Two H1s in doc — HEADING_002 fires. Expected. |
| 11 | Vue.js | ✅ | ✅ | ➖ 0 | ✅ 228ms | 54 | 1 | 310 | 84 / good | Fastest static fetch |
| 12 | Angular.dev | ✅ | ✅ | ➖ 0 | ✅ 737ms | 14 | 1 | 347 | 85 / good | Title "Home • Angular" is short — expected |

### 5. E-commerce

| # | Site | Scan | Score gen | Schema | Perf | Title len | H1 | Words | Score | Notes |
|---|------|------|-----------|--------|------|-----------|----|-------|-------|-------|
| 13 | Amazon.com | ✅ (no crash) | ⚠️ | ➖ 0 | ⚠️ 1363ms | 6 | 0 | 0 | 62 / needsImprovement | Amazon returned a 2.2 KB anti-bot page to headless client. **Live-Chrome test required** on a real product page for Product Schema validation. |
| 14 | eBay.com | ✅ | ✅ | ➖ 0 | ⚠️ 2428ms | 58 | 1 | 1038 | 81 / good | 2 title tags in doc — TITLE_004 fires; expected |
| 15 | Shopify.com | ✅ | ✅ | ✅ 1 Corporation | ✅ 1178ms | 66 | 1 | 1222 | 94 / excellent | Title 66 chars → TITLE_003 fires; expected |

### 6. News media

| # | Site | Scan | Score gen | Schema | Perf | Title len | H1 | Words | Score | Notes |
|---|------|------|-----------|--------|------|-----------|----|-------|-------|-------|
| 16 | CNN.com | ✅ | ✅ | ✅ 1 WebPage | ⚠️ 8976ms | 43 | 1 | 2378 | 91 / excellent | 5.4 MB HTML — largest payload in matrix. Parser did not stall or throw. Text-ratio = 0.003 (huge inline JSON) triggers CONTENT_002 (info). **Recommend live-Chrome perf test** to confirm scan time < 5s on this page. |
| 17 | BBC News | ✅ | ✅ | ✅ 1 WebPage | ✅ 2541ms | 93 | 1 | 1898 | 85 / good | Title 93 chars → TITLE_003; expected |

### 7. Big DOM / dynamic

| # | Site | Scan | Score gen | Schema | Perf | Title len | H1 | Words | Score | Notes |
|---|------|------|-----------|--------|------|-----------|----|-------|-------|-------|
| 18 | Reddit | ✅ (no crash) | ⚠️ | ➖ 0 | ⚠️ 827ms | 6 | 0 | 0 | 62 / needsImprovement | Reddit returns 8 KB SPA shell to non-authenticated headless. **Live-Chrome test required**. |
| 19 | YouTube | ✅ | ⚠️ | ➖ 0 | ⚠️ 2934ms | 7 | 0 | 26 | 77 / good | Title "YouTube" is short, content mostly in JS. **Live-Chrome test required**. |
| 20 | Wikipedia | ✅ | ✅ | ✅ 1 Article | ✅ 2446ms | 32 | 2 | 1890 | 83 / good | 2 H1s (page title + language switcher). HEADING_002 fires; expected on Wikipedia layout. |

---

## Summary statistics

| Metric | Value |
|--------|-------|
| Sites reached HTTP 200 | 20 / 20 |
| Sites where parser threw an exception | 0 / 20 |
| Sites where scoring produced a valid `0–100` number | 20 / 20 |
| Sites where JSON-LD parsing recovered from invalid JSON | 0 invalid blocks encountered across corpus |
| Sites flagged for live-Chrome follow-up (SPA / anti-bot shell) | 5: TikTok, Amazon, Reddit, YouTube (partial), TechCrunch H1 |
| Slowest fetch+parse | CNN (8976 ms, 5.4 MB HTML) |
| Fastest fetch+parse | Vue.js (228 ms) |

### Rule-fire distribution across corpus

```
TITLE_002 (title <30):   8   TITLE_003 (title >60):   5
TITLE_004 (multi <title>): 7   META_001 (missing):     4
META_002 (short desc):   4   META_003 (long desc):   5
HEADING_001 (no H1):     5   HEADING_002 (multi H1): 3
IMAGE_001 (missing alt): 4   IMAGE_002 (>50% no alt): 1
TECH_001 (no canonical): 5   TECH_002 (no schema):  11
CONTENT_001 (<300 words):4   CONTENT_002 (low ratio):18
```

All rules fired at least once against real-world HTML → rule set is exercised end-to-end.

---

## Findings

### No blocking bugs found in scanner logic

* Parser did not throw on any of the 20 targets, including the 5.4 MB CNN page.
* JSON-LD extraction correctly handled sites with 0, 1, and 2+ script blocks.
* Score always stayed in `[0, 100]` (`math.max(0, ...)` in `scoreCategory` holds).
* URL parsing (`hasPoorUrlStructure`) did not throw on any URL.

### Sites that need live-Chrome verification before launch

These are not scanner bugs — they are limitations of static HTML testing:

1. **TikTok** — Server returns SPA shell; real content injected by client JS. In a real Chrome tab the scanner will see the hydrated DOM, which should produce a normal report. Need to confirm.
2. **Amazon** — Anti-bot returns a 2 KB placeholder to headless. In a logged-in Chrome tab on a real product page the DOM will contain Product schema, headings, etc. Need to confirm the scanner handles Amazon's Product JSON-LD without invalid-schema false positives.
3. **Reddit** — Returns 8 KB SPA shell. Same category as TikTok.
4. **YouTube** — Static HTML has `<title>YouTube</title>` and 26 words; the real watch/home page has much more DOM content. Need live check.
5. **TechCrunch H1 count** — Shell HTML has H1 = 0; article template likely renders H1 during hydration. Live check.

### Behavioural observations (not bugs)

* **CNN 5.4 MB HTML**: parser handled it cleanly in ~9s of *fetch+parse*. In a real Chrome tab the fetch is already done (the DOM exists) and the scanner only walks it — expect faster. Still worth timing in a live Chrome test.
* **Bootstrap Docs `titleTagCount = 6`**: caused by demo snippets that include `<title>` tags inside code examples. The rule fires (TITLE_004, severity info) — a technically correct verdict, but users may find it noisy on docs sites. Consider narrowing the rule to `<title>` inside `<head>` in a future release. **Not a V1 blocker.**

### Console errors

No JS console output is measurable from static HTML fetches. This dimension requires live-Chrome testing.

---

## Historical static regression conclusion

**Blocking issues: none found in the static regression.**

The scanner and rule engine are stable against a wide range of real-world HTML — including 5 MB pages, SPA shells, and empty-content anti-bot responses. All 20 sites produced a valid score without throwing.

Remaining verification that still requires a human with real Chrome:

* Load the packaged extension in a clean profile.
* Visit each of the 20 URLs in a normal browser session (logged-in Amazon, real Reddit, etc.).
* Confirm popup opens, scan completes, no red errors in DevTools console.
* Time the scan on CNN and YouTube (expect <3s on a modern laptop).
* Verify chrome:// and file:// pages show the `scanUnavailable` fallback (not a crash).

Historical recommendation: **proceed to live-Chrome pass** on the same 20 URLs before shipping. The v1.2 Chrome QA update below records the newly completed screenshot evidence and remaining scope boundaries.

---

## Reproduction

Raw JSON results: `tmp/regression-results.json` (not checked in).
Harness scripts (kept for future runs, not shipped):
* `tmp/regression-runner.mjs` — parallel fetch pass
* `tmp/regression-retry.mjs` — sequential UA-fallback retry
* `tmp/regression-curl.mjs` — `curl`-based retry for sites Node fetch can't reach

## v1.2 Chrome QA 更新（2026-08-26）

本轮已补充真实 Chrome Popup 截图证据，确认以下页面完成 `Scan complete` 并显示 Report：

| 页面 | Score | Issues | AI Fix | 结果 |
|---|---:|---:|---|---|
| Amazon 首页 | 87 / Good | 3 | ✅ | Popup 链路通过；截图不是 Product Page |
| Apple iPhone 16 | 97 / Excellent | 1 | — | `IMAGE_003` 正常触发 |
| Shopify 首页 | 97 / Excellent | 1 | ✅ | `TITLE_003` 与 AI Fix 正常 |

产品/性能 DOM 采样结果已保存到 `docs/testing/results/v1.2/`。DOM 采样确认 Amazon、eBay、Shopify、Apple 页面可读取，CNN、YouTube、Wikipedia 页面未发生 DOM 读取超时；这些耗时不等同于 Popup 的完整 Extension scan time。

当前结论：静态回归稳定，Popup/Report/AI Fix MVP 已获得真实截图验证；Amazon Product Schema、真实 transfer size 数值和 CNN/YouTube/Wikipedia Popup 扫描耗时仍属于后续补充项。
