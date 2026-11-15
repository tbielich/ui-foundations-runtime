# CI

## Purpose

Explain what the current CI path actually runs and where the configuration
lives.

## Accessibility principle entry

- `docs/principles/accessibility.md` (principles)
- `docs/accessibility-audit-interactive-components.md` (audit workflow)

## Canonical rules

- `package.json`
- `.github/workflows/ci.yml`

Current pipeline:

- `npm run lint`
- `npm run test:unit`
- `npm run build:all`
- `npm run smoke:check`
- `npm run tokens:validate`
- `npm run dtcg:validate`
- `npm run assets:check`
- `npm run rules:validate`
- `npm run docs:build`

## Related docs

- `docs/validation/README.md`
- `docs/agentic/rule-pipeline-audit.md`

## Bounded browser/accessibility path

`ci:check` retains docs/naming/token checks and the existing Datepicker browser
regression unchanged, then runs `test:a11y:only` exactly once on the built surface
and renders evidence-bearing docs. Both Node matrix jobs install Chromium and
upload accessibility reports, raw findings, rendered pilot checklists and failure
traces with `if: always()`. Pages generates its own same-revision evidence before
deployment at the existing destination; a failing gate prevents deployment.

See [accessibility execution and evidence](accessibility.md) and the
[accepted ADR](https://github.com/tbielich/ui-foundations-vault/blob/c960b3cbb21ed8c3527e0f21b6cd046c8ca3c802/decisions/component-accessibility-verification.md).
Missing/stale results render Not assessed/BLOCKED, never an old PASS.
