# Shared overviews and documentation search

Date: 2026-11-17
Repository: ui-foundations-runtime
Branch: feat/shared-overviews-and-search
Mode: IMPLEMENT
Intake: owner-requested follow-up after merging PR #348; separate from preview context and Solid border repairs.

## Implementation

Patterns, Components, and Examples use `site/_includes/layouts/overview.njk`, chained through the existing documentation shell. This layout owns the shared preview controls, grid, card links, preview wrappers, headings, and descriptions. Each page selects its existing collection. Titles and descriptions come from the owning documentation pages; `site/_data/overviewPreviews.json` maps the preserved 20-card inventory to content-only Nunjucks snippets (16 patterns, two components, two examples). ProgressCircle is now inside the shared grid instead of outside the preview stage.

The former Examples-only semantic preview styling applies to all three overview grids. Card and thumbnail surfaces, text, fonts, borders, and native color schemes follow the local Brand/Scheme snapshot. Descriptions use the semantic default text role because the prior subtle role produced poor dark-scheme contrast. This selects an existing role without changing token definitions or Runtime components. Preview contents are inert and hidden from assistive technology; the containing card remains the navigation target.

The input is labeled “Search UI Foundations”. The existing title/description index covers public Markdown documentation, including primitives, components, examples, and guides; playground/noindex pages remain excluded. Result category badges now distinguish foundation, token, pattern, component, example, and guide.

## Validation

Node 22.23.2; existing lockfile and dependencies.

- `npm run ci:check` — PASS: lint, 260 unit tests, documentation/naming/build/token/asset/font/rule checks, 113 browser tests, and 12 bounded accessibility tests.
- `npx playwright test tests/browser/docs-overviews.spec.mjs tests/browser/docs-token-preview-scope.spec.mjs` — PASS, 21 targeted tests.
- `git diff --check` — PASS.

The 13 new overview/search browser tests cover the shared grid and complete preserved card inventory, live card destinations, inert preview wrappers, mobile containment, keyboard navigation, all three Brands in both Schemes for each overview, stable surrounding docs, and search hits across tokens/patterns/components/examples/guides with keyboard selection.

Desktop Chromium screenshots were inspected for Patterns and Components in Brand C/Dark. A final Components screenshot confirmed readable dark-mode thumbnail and description text after the semantic role adjustment. These are bounded browser and visual checks, not full WCAG certification or real Fire TV acceptance.

The running local development server was restarted to reload the changed Eleventy configuration. The refreshed generated index contains 49 entries and includes the previously missing primitive and component pages.

## Boundaries

No Figma assets, Runtime pattern implementations, token values, namespaces, dependencies, or governance changed. No merge or production deployment is performed by this task. Local development preview remains available on port 8080.
