# Product Facts

> 官网唯一事实来源。任何官网文案、页面状态、隐私说明、FAQ、Schema 和截图说明都必须能回溯到本文件或其明确引用的项目文档。

## Product identity

- Product name: SEO Copilot
- Product type: Chrome Manifest V3 extension
- Current product stage: 1.1.0 Alpha
- Primary user: site owners, writers, marketers, and developers who need a quick page-level SEO check while viewing a page in Chrome.
- Primary conversion: install the extension from the Chrome Web Store.
- Chrome Web Store URL: `https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?utm_source=website` — configured in the extension and website code; verify that it is the final public listing before production deploy.

## Verified capabilities

- Analyze the active page after the user explicitly starts a scan.
- Produce a 0–100 page-level SEO score.
- Detect issues covering title, meta description, headings, images and alt text, URL, canonical, structured data, and visible-content signals.
- Explain detected issues with impact and practical recommendations.
- Allow the user to re-scan after making changes manually.
- Generate up to three candidate title or meta description suggestions through AI Fix when the user explicitly requests a supported suggestion.
- Let the user choose and copy an AI suggestion; the extension does not apply website changes automatically.
- Basic scanning, parsing, rule evaluation, and scoring run locally in the browser.

## Supported platforms

- Chrome desktop extensions — Verified by the Manifest V3 implementation and local build workflow.
- HTTP and HTTPS pages that can be accessed through the active tab — Configured; verify against representative sites during release QA.
- Other browsers — Not verified. Do not claim Firefox, Edge, Safari, or universal browser support.
- Multi-site compatibility — Not certified as “all platforms”; describe the product as an active-page checker until compatibility testing is recorded.

## Storage and data handling

- Basic scan data is held in memory while the report is produced; raw page content is not stored as a page record.
- The extension stores a `deviceId` in `chrome.storage.local` for AI request quota and abuse controls.
- Basic scanning does not transmit page content off-device.
- AI Fix sends only the necessary page context after the user explicitly requests a supported title or meta description suggestion.
- AI Fix uses the SEO Copilot backend and DeepSeek; the extension does not store an API key.
- The backend uses Upstash rate limiting. IP address processing is limited to rate limiting and abuse prevention.
- The backend is designed not to retain raw page content.
- The extension does not sell data or use it for advertising.

Source: [docs/PRIVACY_DATA_MAP.md](docs/PRIVACY_DATA_MAP.md)

## Permissions

- `activeTab` — read the user-selected active page after an explicit scan action.
- `scripting` — inject the scanner into an eligible active page when required.
- `storage` — store the local `deviceId` used for AI request limits.
- Host permission `https://seo-copilot-seven.vercel.app/*` — configured for the current backend deployment; verify whether this remains the production backend origin before release.

## Not supported / not verified

- No automatic website or CMS editing.
- No full-site crawler.
- No ranking-tracking platform or ranking guarantee.
- No account is required for the basic audit.
- AI Fix Alpha currently supports title and meta description suggestions only; do not claim H1 rewriting or general AI SEO fixes.
- No browsing-history collection, cookie/password access, form-input collection, financial-data collection, geolocation collection, or access to unrelated tabs.
- No verified pricing, paid plan, testimonials, review score, user count, download count, or organization claim.

## Prohibited claims

- Do not write “100% private”, “100% offline”, or “never accesses the network”.
- Do not write “best”, “#1”, “all platforms”, “millions of users”, or ranking guarantees.
- Do not claim that AI suggestions are automatic edits.
- Do not claim that basic scanning sends page content to the backend.
- Do not publish an unverified platform, compatibility, pricing, rating, or performance claim.

## Open product decisions before production

- Final production website origin and deployment owner.
- Whether `seo-copilot-seven.vercel.app` is the final AI backend origin.
- Final Chrome Web Store listing URL and public listing status.
- Final logo, favicon, OG image, typography, and brand color tokens.
- Whether the current eight non-English locales remain enabled for the first public release.
- Whether `/title-tag-checker`, `/meta-description-checker`, and `/on-page-seo-checker` are real SEO landing pages for launch or should be deferred until unique content and keyword mappings are approved.
