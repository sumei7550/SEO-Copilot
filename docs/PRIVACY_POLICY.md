# SEO Copilot Privacy Policy

Effective date: August 8, 2026

SEO Copilot is a Chrome extension that analyzes the active webpage for on-page SEO issues and provides local, actionable recommendations. Basic SEO scanning runs locally in the browser.

## Data processed

When a user explicitly clicks **Analyze this page**, SEO Copilot temporarily reads information from the active tab that is necessary to produce the report:

- the page URL;
- title, meta description, canonical URL, and headings;
- image URLs, dimensions, transfer sizes, and alternative-text attributes;
- JSON-LD structured data;
- visible page text, used only to calculate word count and text ratio.

SEO Copilot does not read cookies, passwords, form entries, authentication information, payment information, browser history, or content from tabs the user has not chosen to analyze.

## How data is used

The information is processed locally in the user's browser to generate the SEO score, category scores, detected issues, impact explanations, and fixes. AI Fix is optional: only when the user actively requests it, the extension sends the necessary page context for a supported title or meta description request through the SEO Copilot backend to DeepSeek. The extension never sends a page to the backend automatically.

## Storage, transmission, and sharing

SEO Copilot V1.1.0:

- sends necessary page context only for an actively requested AI Fix, through the SEO Copilot backend to DeepSeek;
- uses a deviceId kept in `chrome.storage.local` for AI request controls;
- uses Upstash rate limiting. The backend may process the IP address for rate limiting and abuse prevention;
- does not retain raw page content as an application record after the request;
- does not sell, rent, or share user data;
- does not use analytics, advertising trackers, or remote code;
- does not create user profiles or use data for advertising or credit decisions.

## Permissions

- `activeTab`: grants temporary access only to the tab the user chooses to analyze.
- `scripting`: injects the local SEO scanner into that active tab after the user clicks the analysis button.

SEO Copilot requests no browsing-history or cookie permission. `chrome.storage.local` is used for the deviceId needed to protect the optional AI service.

## Limited Use

The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data access is limited to providing the extension's single user-facing purpose: a local SEO audit of the active page.

## Security

Basic SEO scanning runs locally within the Chrome extension and active webpage context. AI Fix is the exception described above: on the user's request, necessary page context travels through the SEO Copilot backend to DeepSeek. IP processing is limited to rate limiting and abuse prevention. We do not sell data or use it for advertising.

## Changes

If a future release changes the data practices described here, this policy and the in-product disclosure will be updated before the changed processing begins. Any newly required permissions will be requested through Chrome's standard permission flow.

## Contact

For privacy questions or requests, open an issue at:

https://github.com/sumei7550/SEO-Copilot/issues

