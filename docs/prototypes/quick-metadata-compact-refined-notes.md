# Quick Metadata Compact Card · UI design notes

Prototype: [quick-metadata-compact-refined.html](quick-metadata-compact-refined.html). This is a standalone sample-data prototype. It does not read a tab, request Chrome permission, run an audit, or call AI.

## Order and behavior

1. Existing Side Panel header.
2. Compact Page metadata card: Title, Meta description, URL. Each row has a character count and a nearby Copy button. Missing or inaccessible values disable Copy. Counts follow the current JavaScript `.length` rule; the displayed label says `chars`.
3. SEO Audit entry with the existing primary `Scan current page` action. Metadata reading does not start this audit.
4. After a manual Scan: existing SEO Score, report heading, severity counts, Issues with Recommended Actions and on-demand AI Fix, then Rescan. The entire Side Panel scrolls; Metadata is not sticky, so it does not consume the viewport while reviewing a long report.

Long values are clamped to two lines by default. `Show more` expands only that field, and `Show less` restores the clamp. Copy always targets the full value and stays next to the field label. Empty values are shown as `Not found` and are never copied. The prototype's A10 states demonstrate success and failure feedback; ordinary clicks try the browser clipboard API, which can be unavailable in a local HTML preview.

## State coverage

| State | Prototype result |
|---|---|
| A1 | Metadata available; SEO Audit has not run. |
| A2 | Metadata remains visible; scanning indicator replaces the Scan entry; no Score is shown yet. |
| A3 | Metadata, Score, severity counts, three Issues, actions, AI entry, and Rescan appear in one scroll. |
| A4 | The relevant Issue expands to show sample AI Fix details, recommendations, selection, and copy controls. |
| A5 | Metadata skeleton and reading message; the separate Audit entry remains. |
| A6 | URL remains available; Title and Description say unavailable. Existing `Scan current page` can request site access in the product. The prototype never grants access. |
| A7 | Separate restricted-page and read-failure previews. Restricted pages have no Scan action; a read failure still leaves the manual Audit entry. |
| A8 | Separate missing-Title and missing-Description previews with disabled Copy for the absent field. |
| A9 | All three fields are long; expand/collapse and full-value Copy can be inspected. |
| A10 | Separate success and failure feedback previews. |

## Relationship to the current Side Panel

| Current component | Proposed treatment for implementation review |
|---|---|
| `App` header and manual Scan entry | Reuse visual style and manual Audit trigger. Add Metadata states independently of the Audit state. |
| `ScoreCard` | Reuse Score and Grade layout. Remove its truncated URL row when Metadata provides the full URL above; this is the one proposed deduplication. |
| `Report` and `IssueList` | Keep severity counts, issue cards, `Current` values needed to understand a problem, Recommended Actions, and Rescan. The prototype uses `Issues found on this page` because the current list is not actually sorted by impact. |
| `AiFixPanel` | Keep the on-demand entry, suggestions, selection, copy, and Generate another. A4 shows sample content only. |
| New Metadata card | Add the three field rows, counts, Copy feedback, long-text disclosure, and loading/access/error/empty states. |

The existing report shows `Current` inside Title and Description issues. That contextual value remains useful at the point of diagnosis even when the same full value appears in Metadata. The URL row in `ScoreCard` is a pure repeat and can be removed in the later implementation if this prototype is approved.
