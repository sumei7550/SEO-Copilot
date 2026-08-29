# SEO Copilot Privacy Policy

Version: V1.1.0 Alpha
Effective date: August 30, 2026

SEO Copilot is a Chrome extension that analyzes a page for on-page SEO issues and, when requested, generates title or meta description suggestions. This policy describes the current Alpha Real AI behavior.

## Local SEO scanning

Only when the user actively starts an analysis, SEO Copilot reads the current active tab. The basic SEO scan runs primarily on the user's device and may inspect:

- the page URL;
- the title, meta description, and canonical URL;
- H1, H2, and H3 headings;
- image URLs, alternative text, dimensions, and related SEO attributes;
- structured data and JSON-LD;
- visible page text and related SEO elements needed for the report.

The extension does not automatically modify the website. The user remains responsible for deciding whether to apply or copy any recommendation.

## AI Fix

Only when the user actively requests an AI title or meta description suggestion, the necessary page context is sent over HTTPS to the SEO Copilot backend. The request currently includes the issue type, current value, URL, title, meta description, H1, page language, page type, inferred brand, issue context/diagnosis, and a randomly generated device ID used for service protection.

The backend then sends the context needed to generate the result to the configured DeepSeek API. The extension does not call DeepSeek directly and does not contain the DeepSeek API key.

Do not use AI Fix on pages containing passwords, authentication information, payment information, health information, private communications, or other sensitive content. SEO Copilot does not actively read passwords, cookies, authentication credentials, payment form values, or private messages, but a page URL, title, meta description, H1, or visible page content can itself contain sensitive information.

## Services and providers

The current production architecture involves:

1. **SEO Copilot backend** — currently deployed on Vercel. It receives user-requested AI Fix requests, calls the AI provider, and applies service limits.
2. **DeepSeek** — generates AI title and meta description suggestions.
3. **Upstash Redis** — supports AI usage quotas, IP rate limiting, device cooldowns, and the global limit. It is not used to analyze webpage content.

Retention and processing by third-party service providers are governed by their applicable service terms and privacy policies. This policy does not make an absolute retention-period promise for those providers.

## Storage and device ID

The extension uses `chrome.storage.local`. It stores a randomly generated `deviceId` for AI quota, cooldown, and abuse prevention. The device ID does not contain a name, email address, or other direct identity information. The extension may also store `lastInstalled` and other data required for extension operation. The device ID is sent to the SEO Copilot backend with AI Fix requests for service protection.

The basic scan is not sent off the device. AI Fix is an explicit exception: necessary page context is transmitted to the SEO Copilot backend and its configured AI provider.

## IP rate limiting

The backend uses the request IP for rate limiting and abuse prevention. The IP is hashed for the rate-limit key and the complete IP is not written to SEO Copilot business logs. The IP is not used for advertising, profiling, or marketing. Platform-level access or infrastructure logs may still exist and are governed by the applicable platform terms; this policy does not claim that none exist.

## Things SEO Copilot does not do

SEO Copilot does not:

- sell user data;
- use data for advertising;
- build advertising profiles;
- use data for purposes unrelated to SEO Copilot's single purpose;
- automatically modify websites; or
- guarantee ranking or traffic improvements.

## Permissions

The extension currently requests:

- `activeTab` — access to the current tab when the user actively analyzes it;
- `scripting` — inject the packaged local scanning script;
- `storage` — save the device ID, installation time, and other local extension data;
- `host_permissions: https://seo-copilot-seven.vercel.app/*` — connect to the SEO Copilot backend for user-requested AI Fix processing.

## Limited Use

The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including its Limited Use requirements. Data access is limited to the extension's single user-facing purpose: local SEO auditing and the explicitly requested AI title or meta description suggestions.

## Changes

If a future release changes the data practices described here, this policy and the in-product disclosure will be updated before the changed processing begins. Any newly required permissions will be requested through Chrome's standard permission flow.

## Contact

For privacy questions or requests, open an issue at:

https://github.com/sumei7550/SEO-Copilot/issues
