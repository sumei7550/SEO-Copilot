# SEO Copilot Privacy Policy

Last updated: October 20, 2026

SEO Copilot is a Chrome extension that analyzes the active webpage for on-page SEO issues and provides local, actionable recommendations. Basic SEO scanning runs locally in the browser.

## Data processed

When the Side Panel opens, the active tab changes, or its URL changes, SEO Copilot reads the active tab's ID and URL to identify the page and match any report held in Side Panel memory. Chrome's tab object may also contain a title and favicon URL; this flow does not use or send those fields. Reading tab metadata does not read the page body or start a scan.

Only after the user clicks **Scan current page** and grants site access if requested does the local scanner read the following information from that page:

- the page URL;
- title, meta description, canonical URL, and headings;
- image URLs, dimensions, transfer sizes, and alternative-text attributes;
- JSON-LD structured data;
- visible page text, used only to calculate word count and text ratio.

The scanner does not use form-value, cookie, password, or browser-history APIs, and it does not scan the body of unrelated tabs. Its visible-text calculation reads page text nodes locally, which may include text displayed within a form. It returns derived counts, not the full visible text.

## How data is used

The basic scan is processed locally in the browser to generate the SEO score, detected issues, explanations, and recommendations. It does not send the report or page body to the backend. AI Fix is optional: only when the user requests a supported title or meta description suggestion does the extension send the page URL, current title and meta description, H1 text, selected issue details, inferred page type/brand, language, and related context to the SEO Copilot backend. The backend includes that context in a prompt sent to DeepSeek. This is not an upload of the full page body.

## Storage, transmission, and sharing

- The active tab URL, scan status, and report are held in Side Panel memory per tab, not in `chrome.storage.local` as browsing history. They are not maintained as a persistent scan history.
- `chrome.storage.local` holds a deviceId for AI request limits and timestamps for installation, first Welcome view, and first successful scan. These timestamps are not page content.
- For an AI Fix request, the extension sends the context described above and the deviceId to the backend. The backend processes the IP address and uses Upstash counters keyed by deviceId and a hash of the IP for rate limiting. The reviewed backend code does not write raw page context to its database or production application log; hosting logs and DeepSeek retention must be confirmed separately.
- The website and extension use Mixpanel for usage analytics. Extension code sends action names, version, scan type, authorization outcomes, score, issue counts, and issue identifiers where relevant; it does not put the scanned site's URL or page text in custom event properties. The Mixpanel browser SDK also attaches default properties such as the *current analytics page URL* and browser/referrer information. For the extension this is an internal `chrome-extension://` page, not the scanned website. Website analytics includes the website URL/path and referrer. Mixpanel uses a browser-local analytics identifier; it is separate from the AI deviceId.
- The application code does not send data to advertising networks or use it for advertising. Mixpanel, DeepSeek, Upstash, and the backend host are external processors for the purposes described above; their own storage settings and retention require separate confirmation.

## Permissions

- `tabs`: reads the active tab's ID and URL when the Side Panel opens or the active page changes, for page identification and per-tab report handling.
- `sidePanel`: opens the Side Panel from the toolbar.
- `activeTab`: provides temporary access to a user-invoked tab; site content scanning follows the permission flow below.
- `scripting`: injects the packaged local scanner into the selected tab when needed after the user clicks Scan.
- `storage`: stores the local deviceId and activation timestamps described above.
- `http://*/*` and `https://*/*` are **optional host permission patterns**, not automatic access to every site at install time. On Scan, the extension checks the current site's permission and calls `chrome.permissions.request()` for that site if needed. Approval continues the scan; rejection prevents it. Previously granted access can be reused; after revocation, the next scan requests access again.
- Fixed host permissions allow the optional AI backend and Mixpanel analytics endpoints.

SEO Copilot does not request Chrome's browsing-history or cookie permission. The `tabs` permission does allow reading the active tab URL before a scan; this is not the same as reading or storing a history of visited pages.

## Limited Use

The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data access supports the user-facing page audit, optional AI suggestions requested by the user, and related operational analytics.

## Security

Basic SEO scanning runs locally within the Chrome extension and active webpage context. AI Fix is the exception described above: on the user's request, relevant page context travels over HTTPS through the SEO Copilot backend to DeepSeek. The backend uses the request IP for rate limiting and abuse prevention. This repository cannot establish the retention behavior of the hosting provider, Mixpanel, or DeepSeek.

## Changes

If a future release changes the data practices described here, this policy and the in-product disclosure will be updated before the changed processing begins. Any newly required permissions will be requested through Chrome's standard permission flow.

## Contact

For privacy questions or requests, open an issue at:

https://github.com/sumei7550/SEO-Copilot/issues

