# SEO keyword map

> Status: implementation hypothesis. Validate demand, wording, and ranking opportunity with Google Search Console and live SERP research after the production domain is indexed. Do not treat unverified search-volume estimates as facts.

## Strategy

SEO Copilot should not depend on winning the broad `seo checker` or `seo audit` head terms. The initial acquisition strategy is to own narrower jobs that match the verified product: checking one active browser page, understanding page-level issues, requesting title or meta-description candidates, and re-scanning after a manual change.

Every indexable landing page must have one primary job. Closely related phrases belong on the same page unless the search results, user task, and page value are materially different.

## Current page mapping

| URL | Primary query hypothesis | Search intent | Distinct user job | Supporting phrases | Must not target |
|---|---|---|---|---|---|
| `/` | AI SEO checker Chrome extension | Product discovery | Decide whether to install a page-level Chrome checker | SEO browser extension; check SEO while browsing; page SEO assistant | Generic SEO platform; rank tracker |
| `/seo-checker/` | single page SEO checker | Quick tool evaluation | Check one open page and see a score plus prioritized issues | webpage SEO checker; quick SEO check; check SEO of current page | Full-site audit; detailed signal reference |
| `/seo-audit/` | page-level SEO audit | Workflow evaluation | Run a structured scan → prioritize → understand → update → re-scan workflow | audit one webpage; SEO audit without crawler; active-page SEO audit | Quick score only; full-site crawler |
| `/on-page-seo-checker/` | on-page SEO checker | Scope evaluation | Review which on-page elements are present or weak | metadata checker; heading checker; image alt checker; canonical checker; schema check | Full-site audit; ranking tracker |
| `/title-tag-checker/` | title tag checker | Specific problem solving | Find missing, short, long, or multiple title tags and request candidates | page title checker; SEO title length; improve title tag | General SEO audit; automatic publishing |
| `/meta-description-checker/` | meta description checker | Specific problem solving | Find missing, short, or long descriptions and request candidates | meta description length; improve meta description; description preview copy | General SEO audit; guaranteed CTR improvement |

## Cannibalization rules

1. `/seo-checker/` owns speed, one-page scope, score, and prioritized findings.
2. `/seo-audit/` owns the repeatable audit workflow and prioritization process.
3. `/on-page-seo-checker/` owns breadth of supported on-page signals.
4. Title and meta-description pages own their respective element-specific problems and AI candidate workflow.
5. A supporting phrase may appear naturally on another page, but its page title, H1, opening paragraph, and primary CTA must reinforce the assigned job.
6. Do not create a new landing page when an existing page can satisfy the same intent. Require a distinct SERP pattern, user job, example, and internal-link role first.

## Opportunity score for future topics

Score candidates from 0–5 on each input:

```text
Opportunity = (intent fit × product fit × business value × evidence gap)
              / (ranking competition × content cost)
```

Use the score as a prioritization aid, not as a promise. Reject topics that need unsupported features, invented compatibility, ranking guarantees, or thin template-swapped copy.

## Next content candidates

These are research candidates, not approved URLs:

| Candidate cluster | Why it may fit | Evidence required before publishing |
|---|---|---|
| check SEO before publishing a page | Strong pre-publish workflow and product fit | SERP intent, query impressions, unique checklist/example |
| SEO checker Chrome extension | Exact platform and install intent | Chrome Web Store availability and competitor SERP review |
| check SEO of a single webpage | Strong product differentiation from crawlers | Distinct demand and wording in GSC/live SERPs |
| how to check a canonical tag | Matches a verified detection capability | Useful walkthrough, real examples, and route differentiation |
| how to find missing image alt text | Matches a verified detection capability | Useful examples and no overlap with the on-page checker page |

## Measurement loop

After launch, review every 28 days:

- impressions, clicks, CTR, and average position by page and query;
- queries ranking in positions 8–20;
- two or more pages receiving impressions for the same query;
- high-impression queries whose landing page does not match the task;
- installs or outbound Chrome Web Store clicks by landing page;
- pages with no impressions after sufficient crawl and index time.

Merge, redirect, rewrite, or defer pages based on search evidence. Do not keep a page solely because a keyword tool reports volume.
