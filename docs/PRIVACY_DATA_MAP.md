# SEO Copilot V1.0.0 Privacy Data Map

|Data|Source|Purpose|Persistence|Transmission|Sharing|
|---|---|---|---|---|---|
|Active page URL|`activeTab` page context|URL structure and canonical checks|Memory during report only|None|None|
|Title/meta/canonical|Active page DOM|On-page SEO rules|Memory during report only|None|None|
|H1/H2/H3 text|Active page DOM|Heading structure rules|Memory during report only|None|None|
|Image URL, alt, dimensions, resource size|Active page DOM and Performance API|Image SEO and size rules|Memory during report only|None|None|
|JSON-LD|Active page DOM|Schema presence and validity rules|Memory during report only|None|None|
|Visible text|Active page DOM|Word count and text-ratio calculations|Only derived counts are returned|None|None|

Excluded from collection: browsing history, cookies, form input, passwords, authentication data, financial information, health data, personal communications, geolocation, and content from non-active tabs.

## Chrome Web Store privacy answers

- Single purpose: Analyze the user-selected active webpage locally for on-page SEO issues and display actionable recommendations.
- Handles website content: Yes, locally and only after explicit user action.
- Handles web browsing activity: The active page URL is accessed only as required for the user-requested audit; it is not collected, stored, or transmitted.
- Data sold or shared: No.
- Data used for advertising: No.
- Data transmitted off-device: No.
- Remote code: No.
- Limited Use certification: Yes.

