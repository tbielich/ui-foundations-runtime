# Documentation navigation verification

Date: 2026-11-16
Repository: ui-foundations-runtime
Branch: docs/simplify-documentation-navigation
Mode: IMPLEMENT
Selection: directly requested by the owner; no issue selected autonomously.

## Scope

- Remove the Writing Contract Proof example and its collection-generated links.
- Consolidate Vanilla Starter into Getting Started and configure a permanent redirect to its Vite subsection.
- Reduce Foundations to System Overview, Design Tokens, Theming, and Guidelines. Group Accessibility, Content Standards, and Internationalization under Guidelines; link Class Naming from Getting Started and System Overview.
- Nest Base under Theming and add the matching breadcrumb and content link.
- Permit same-origin embedding only for `/base/preview/*`; keep the default framing prohibition and all other declared headers.
- Add explicit section anchors to Foundations content and the shared Base guide so the existing desktop/mobile table of contents works.

## Verification

Node: 22.23.2. Existing dependency lockfile used; no dependency changes.

- `npm run ci:check` — PASS: lint, 260 unit tests, documentation/naming/build/token/asset/font/rule checks, 92 browser tests, and 12 bounded accessibility tests.
- `git diff --check` — PASS.
- `npm run docs:build -- --output=/tmp/uif-docs-navigation-final-site` — PASS. Checked the fresh output: neither removed example exists, generated HTML/text/JSON/XML contain no links to either old example route, the Vite redirect target anchor exists, and the generated `_headers` matches its source.
- `tests/browser/docs-foundations.spec.mjs` adds 10 regression tests: same-origin iframe loading and cross-origin rejection under the declared preview headers, four-entry navigation, and working desktop/mobile section links on seven Foundations pages plus Base.

## Boundaries

The local static test server does not implement Netlify header rules. The iframe regression injects the declared path-specific response headers and verifies Chromium behavior. Production header selection and the HTTP 301 redirect still require verification after merge and Netlify deployment. No merge or production deployment is performed here.

The accessibility suite is the repository's bounded pilot, not a claim of full WCAG conformance. Historical evidence logs are preserved.
