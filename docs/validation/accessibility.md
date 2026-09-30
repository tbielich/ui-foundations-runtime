# Bounded accessibility evidence — Runtime #309

This execution guide consumes the [accepted accessibility ADR](https://github.com/tbielich/ui-foundations-vault/blob/c960b3cbb21ed8c3527e0f21b6cd046c8ca3c802/decisions/component-accessibility-verification.md), published by [Vault PR #48](https://github.com/tbielich/ui-foundations-vault/pull/48). It extends the [bounded browser ADR](https://github.com/tbielich/ui-foundations-vault/blob/376bca99cc9baaa873a7e8a8f3ea855ee763ec5d/decisions/bounded-browser-verification.md) and [Runtime #307](https://github.com/tbielich/ui-foundations-runtime/issues/307), not a general framework permission.

## Reproduce

```sh
npm ci
npx playwright install --with-deps chromium
npm run lint
npm run test:unit
npm run test:a11y
npm run ci:check
git diff --check
```

`test:a11y` builds the real docs surface, runs only the bounded accessibility specs, normalizes one report, then rebuilds evidence-bearing docs. CI already builds the surface and uses `test:a11y:only` once, after preserving the existing Datepicker browser check. No circular build or component repair is involved. Pages tests its own checkout before rendering at its existing destination.

## Inventory and evidence

`accessibility-criteria.json` freezes five Button and six Checkbox criteria at version 1. Scope: existing rendered macro examples on `/patterns/button/` and `/patterns/checkbox/`, Chromium headless, brand A/light. Every axe criterion requires all inventory state scans. Default enabled axe rules are used without rule suppression or component exclusions. The report explicitly excludes docs chrome and includes checkbox labels. Test-only native click observers measure Button activation; checkbox assertions measure actual checked state. Negative controls use isolated test markup, never production replacement markup.

`artifacts/accessibility/result.json` carries criterion outcomes, raw axe results, snapshots, browser/tool provenance, run/revision/content/configuration identity and separate pending independent-verification/merge gates. `playwright.json`, `criteria/`, command logs and retained failure traces supplement it. CI uploads artifacts even on failure. The generated docs expose the same result JSON at `/evidence/accessibility/result.json`.

The canonical ADR supplies the rubric: each inventory item counts once; no raw assertion/rule points. Reports with missing, malformed, stale, mismatched or incomplete passing evidence are rejected, and the docs say Not assessed/BLOCKED rather than reusing a previous PASS. Local dirty content is labelled and cannot substantiate a clean published revision. Results expire after 24 hours. Reviewed N/A requires rationale and reviewer; the initial pilot inventory cannot be removed or reduced without scope review.

## Gates and limitations

Automated PASS does not certify WCAG conformance, screenreader behavior, untested states/variants, other components, brands, modes or browsers. Screenreader remains **not tested**; manual screenreader and keyboard testing before stable status is unchanged. Design/documentation checklist completion is separate from evidence, and lifecycle badges are not changed here.

Confirmed component findings remain FAIL, incomplete/unexecutable checks remain BLOCKED, and raw evidence is retained. Obtain a separate bounded repair decision rather than changing component behavior, disabling checks or updating snapshots to conceal findings. Independent read-only verification is pending until a separate reviewer supplies it; the implementation executor does not self-certify. Human review is the final merge gate. No merge or release is automated.

## Executor findings (2026-09-30)

Cline CLI session `1790743003129_7q0ul`, provider `openai-codex`, configured model
`gpt-6.1-sol`, CLI 3.0.66; Hub preflight succeeded in the authorized checkout.
Accepted Vault main was verified at the exact ADR commit. No agents delegated.

Actual initial validation: dependency/Chromium install, lint, unit and diff checks
passed; `test:a11y` and `ci:check` returned exit 1. Button: 5/5, 100%, PASS.
Checkbox: 4/6, 66%, FAIL. Mixed-state native input is exposed as unchecked in
Chromium despite `aria-checked="mixed"`; axe default rule `aria-conditional-attr`
reports a serious violation for that input. No component repair or baseline
update is authorized here. Request a separate bounded Checkbox repair decision.
Negative controls detect missing names/roles and axe violations. Existing
Datepicker regression passes unchanged. Final clean-commit logs/results remain
in CI artifacts and the implementation PR evidence, not committed generated files.
Independent verification is **pending**; merge readiness is **blocked**.
