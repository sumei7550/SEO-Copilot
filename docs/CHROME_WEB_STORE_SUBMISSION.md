# SEO Copilot V1.0.0 Chrome Web Store Submission

## Listing identity

- Name: SEO Copilot
- Version: 1.0.0
- Category: Developer Tools
- Primary language: English
- Single purpose: Analyze the user-selected active webpage locally for on-page SEO issues and display actionable recommendations.

## URLs

- Homepage: https://github.com/sumei7550/SEO-Copilot
- Support: https://github.com/sumei7550/SEO-Copilot/issues
- Privacy policy after GitHub Pages is enabled: https://sumei7550.github.io/SEO-Copilot/privacy.html

The privacy URL becomes public after GitHub Pages is configured to publish the repository's `/docs` directory from the release branch. Verify the live URL before submitting.

## Permission justifications

### activeTab

SEO Copilot uses `activeTab` to read only the webpage the user explicitly chooses to analyze. Access begins after the user opens the extension and clicks **Analyze this page**. It is required to inspect the page's on-page SEO elements and is not used for background browsing activity.

### scripting

SEO Copilot uses `scripting` to inject its packaged, self-contained scanner into the user-selected active tab after explicit confirmation. The script performs the local audit and returns only the report to the popup. No remote code is executed.

## Data-use disclosure

SEO Copilot processes the active page's URL, metadata, headings, image SEO attributes, JSON-LD, and visible text locally to generate the user-requested report. It does not transmit, persist, sell, or share this data. Full details are in `PRIVACY_POLICY.md` and `PRIVACY_DATA_MAP.md`.

## Required dashboard selections

1. Declare the single purpose verbatim from this document.
2. Justify `activeTab` and `scripting` using the text above.
3. Declare website content and active-page browsing activity because the scanner processes them locally.
4. Declare that data is not sold, used for advertising, or transmitted off-device.
5. Certify compliance with Limited Use requirements.
6. Add the live privacy-policy URL.
7. Select public distribution and desired regions.
8. Upload the release ZIP from `release/seo-copilot-v1.0.0.zip`.

## Store assets

- Store icon: `public/icons/icon128.png`
- Small promo tile: `store-assets/seo-copilot-small-promo-440x280.png`
- Screenshots: `store-assets/screenshots/*.png`
- Optional marquee: `store-assets/seo-copilot-marquee-1400x560.png`

