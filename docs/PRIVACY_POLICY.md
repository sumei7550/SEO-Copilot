# SEO Copilot Privacy Policy

Effective date: August 8, 2026

SEO Copilot is a Chrome extension that analyzes the active webpage for on-page SEO issues and provides local, actionable recommendations.

## Data processed

When a user explicitly clicks **Analyze this page**, SEO Copilot temporarily reads information from the active tab that is necessary to produce the report:

- the page URL;
- title, meta description, canonical URL, and headings;
- image URLs, dimensions, transfer sizes, and alternative-text attributes;
- JSON-LD structured data;
- visible page text, used only to calculate word count and text ratio.

SEO Copilot does not read cookies, passwords, form entries, authentication information, payment information, browser history, or content from tabs the user has not chosen to analyze.

## How data is used

The information is processed locally in the user's browser solely to generate the SEO score, category scores, detected issues, impact explanations, and suggested fixes requested by the user.

## Storage, transmission, and sharing

SEO Copilot V1.0.0:

- does not transmit webpage data to the developer or any external server;
- does not store scanned webpage data after the report is generated;
- does not sell, rent, or share user data;
- does not use analytics, advertising trackers, or remote code;
- does not create user profiles or use data for advertising or credit decisions.

## Permissions

- `activeTab`: grants temporary access only to the tab the user chooses to analyze.
- `scripting`: injects the local SEO scanner into that active tab after the user clicks the analysis button.

SEO Copilot requests no host permissions, browsing-history permission, cookie permission, or persistent storage permission.

## Limited Use

The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data access is limited to providing the extension's single user-facing purpose: a local SEO audit of the active page.

## Security

All analysis runs locally within the Chrome extension and active webpage context. Because V1.0.0 does not transmit or retain analyzed page data, no scanned webpage content is stored on developer-controlled infrastructure.

## Changes

If a future release changes the data practices described here, this policy and the in-product disclosure will be updated before the changed processing begins. Any newly required permissions will be requested through Chrome's standard permission flow.

## Contact

For privacy questions or requests, open an issue at:

https://github.com/sumei7550/SEO-Copilot/issues

