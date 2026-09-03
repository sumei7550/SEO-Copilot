# SEO Copilot Website IA Freeze

## Scope

This document freezes the initial website information architecture based on the current product facts. It is an implementation decision record, not a source of product capabilities. Product claims must come from [PRODUCT_FACTS.md](../PRODUCT_FACTS.md).

## URL rules

- Default locale: English (`en`). English URLs have no `/en` prefix.
- Enabled additional locales: `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es`, `pt-BR`.
- Additional locales use `/{locale}/` prefixes.
- Trailing slash policy: enabled by the current Next.js export configuration; all generated internal URLs must use the same policy.
- Production origin: configured in the Vercel deployment environment. `NEXT_PUBLIC_SITE_URL` is the only allowed source for canonical, hreflang, Open Graph, sitemap, robots, and JSON-LD URLs.
- The actual production origin is intentionally not hardcoded in the repository; Preview and Production deployments must each inject their own verified environment value.

## Page decision

### Required

| Page | URL | Main task | Navigation | SEO |
|---|---|---|---|---|
| Home | `/` | Understand the product and install the extension | Header | index |
| Features | `/features/` | Understand verified capabilities | Header | index |
| Support | `/support/` | Resolve installation and usage questions | Footer / Header | index |
| Privacy | `/privacy/` | Understand data and permission handling | Footer | index |

### Conditional, currently implemented

| Page | URL | Launch decision |
|---|---|---|
| SEO Checker | `/seo-checker/` | Keep if the page receives unique checker search intent content. |
| SEO Audit | `/seo-audit/` | Keep if positioned as active-page audit, not a full crawler. |
| Title Tag Checker | `/title-tag-checker/` | Conditional; requires unique keyword mapping and evidence-backed content. |
| Meta Description Checker | `/meta-description-checker/` | Conditional; requires unique keyword mapping and evidence-backed content. |
| On-page SEO Checker | `/on-page-seo-checker/` | Conditional; assess cannibalization against SEO Checker and SEO Audit. |
| Localized equivalents | `/{locale}/.../` | Keep only for enabled locales with reviewed copy and matching page intent. |

### Deferred / not to create yet

- `/pricing/`
- `/about/`
- `/changelog/`
- `/blog/`
- `/use-cases/`
- `/templates/` unless a real template or workflow library exists.
- `/platforms/` unless platform compatibility is tested and documented.
- `/faq/` as a standalone page; FAQ may remain on Home and Support until unique content justifies a separate URL.
- `/welcome/` until the extension onboarding trigger and installation flow are defined. If created, use `noindex` and exclude it from sitemap.

## Navigation freeze for the next implementation phase

- Primary navigation: Features, SEO Audit, Support.
- Primary CTA: `Add to Chrome` once the final CTA copy and Chrome icon treatment are approved.
- Secondary actions: See how it works, View Features, Read Privacy, Get Support.
- Do not link to deferred pages or empty placeholder pages.
- The language switcher preserves the current page path. If a translated page is not enabled, hide that locale entry for the page or apply an explicit fallback rule before launch.

## Home information order

1. Header and install CTA.
2. Hero: what SEO Copilot is, who it helps, and the active-page workflow.
3. Three core values: score, issue explanations, optional AI suggestions.
4. Real product screenshot showing a differentiated result state.
5. How it works: scan, review, understand, request help when needed, re-scan.
6. Feature details organized by user task.
7. Compatibility and supported-page scope.
8. Privacy and trust facts.
9. Final CTA with one install action and one secondary action.
10. Footer with only live links.

## SEO landing-page gate

No new SEO landing page is considered frozen until its primary keyword, search intent, unique value, internal links, canonical, locale variants, and evidence in `PRODUCT_FACTS.md` are recorded. Existing checker pages are therefore “conditional” rather than automatically required for launch.

## Current audit follow-up (2026-09-04)

The conditional checker pages were reviewed during the pre-launch Website Audit. The current implementation now records the following intent separation and internal-link model:

| Page | Primary intent | Supporting path |
|---|---|---|
| `/seo-checker/` | Quick page-level SEO check | SEO Audit, On-page SEO Checker |
| `/seo-audit/` | Structured audit of the active page | SEO Checker, On-page SEO Checker |
| `/on-page-seo-checker/` | On-page signals across metadata, headings, images and related markup | SEO Audit, SEO Checker |
| `/title-tag-checker/` | Title tag problems and improvement candidates | Meta Description Checker |
| `/meta-description-checker/` | Meta description problems and improvement candidates | Title Tag Checker |

Each page now has unique task-oriented detail content and related links. This satisfies the local implementation portion of the landing-page gate; it does not replace production crawl validation or post-launch search data. Keep the pages under review until the production URL is verified and real search intent confirms that the pages are not cannibalizing one another.

The detailed findings, code-file mapping, validation evidence, and remaining work are recorded in [WEBSITE_AUDIT_2026-09-04.md](WEBSITE_AUDIT_2026-09-04.md).
