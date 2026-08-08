# Project Instructions

This is a Chrome Extension MV3 project named SEO Copilot.

## Current Goal

Prepare a stable V1.0.0 release for the Chrome Web Store.

## Working Rules

* Preserve existing functionality.
* Avoid unnecessary refactoring.
* Prefer minimal, low-risk changes.
* Run tests after meaningful code changes.
* Do not invent features that are not implemented.
* Do not change permissions unless required and justified.
* Treat Chrome Web Store compliance as a release priority.
* Keep release artifacts reproducible.

## Product Principles

* The extension analyzes the current page for SEO issues.
* Prefer clear, actionable recommendations over excessive metrics.
* Keep user interaction simple and fast.
* Privacy and local processing are important product qualities.
* Do not add data collection unless explicitly requested.

## Release Rules

Before considering V1.0.0 complete:

* Tests must pass.
* Production build must pass.
* Manifest version and package version must match.
* Release ZIP must contain manifest.json at the ZIP root.
* Store assets and listing copy must reflect actual functionality.
* Do not claim unsupported capabilities.

## Existing Project Context

Read HANDOFF.md for current implementation and release progress.

If ASO_AUDIT.md exists, treat it as recommendations, not mandatory requirements.
Do not implement every ASO suggestion automatically; prioritize P0 items and avoid feature creep.

## Testing Rules

- Do not create temporary test files, screenshots, logs, or reports in the project root.
- Put temporary test files in `tmp/` or the system temp directory.
- Put test screenshots in `docs/screenshots/`.
- Put test reports in `docs/testing/`.
- Remove unnecessary temporary files after testing.
- Do not modify production code during validation unless explicitly requested.
- Do not create demo, mock, fixture, or scratch files in the project root for convenience.
- After testing, run `git status` and confirm there are no unrelated files left behind.
- Permanent test fixtures should go under the existing test fixture directory, such as `tests/fixtures/`.