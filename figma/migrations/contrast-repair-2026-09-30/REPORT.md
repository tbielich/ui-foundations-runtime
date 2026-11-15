# UIF contrast repair — 2026-09-30

Mode: REPAIR. Owner request: correct the demonstrated contrast failures before
merging Runtime PR #313. Scope and exact permitted mutations are recorded in
`execution-contract.json`. Figma branch: `3G6kkLVF0AKQO2BeCpixiN`.

## Result

PASS: all 29 previously persisted failing token cases are repaired. Chromium
additionally exposed light Outline/Ghost overlay failures; those are repaired
using darker existing brand shades. Ten existing Appearance variables change
in 16 Brand/Mode slots. No new variables or palette primitives were introduced.
IDs, names, collection membership, scopes and WEB syntax are unchanged.

- Dark Action Surface uses the existing dark brand primary.
- Light Action Foreground uses dark brand primary; dark Foreground uses Strong
  light text. Brand B dark primary now selects existing Purple/900 so text on
  the light Active overlay also passes while preserving the brand hue.
- Subtle Surface uses Strong dark Content in both schemes.
- Bright Brand B Danger and Brand B/C Success/Selection use dark Content.

Runtime's two compatible Brand/Scheme exports are synchronized by ID from the
independent Figma readback. Generated artifacts are produced by the existing
pipeline. The Figma README now distinguishes the value-preserving architecture
migration from this subsequently authorized color repair.

## Verification

- `python3 scripts/verify-token-projection.py --repair-dir figma/migrations/contrast-repair-2026-09-30`: PASS for structure, mutation allowlist, export/alias/CSS parity and all contrast categories. All 765 IDs remain; 9,180 context comparisons include 8,842 unchanged and 338 authorized dependent values.
- Surface/Content: 72 PASS, 6 disabled EXEMPT, zero FAIL.
- Action Foreground: 24 PASS, zero FAIL.
- Composited solid action overlays: 12 PASS, zero FAIL.
- `npx playwright test tests/browser/token-contrast.spec.mjs --reporter=json`: 6 PASS; 72 enabled Solid/Outline/Ghost × Default/Hover/Active/Focus × Brand/Scheme cases pass in Chromium. Minimum rendered ratio: 4.505319:1, above 4.5:1.
- `npm run lint`: PASS.
- `npm run test:unit`: PASS, 182 tests.
- `npm run ci:check`: PASS, including all 7 Chromium tests.

`before.json` is a fresh Figma snapshot checked against the previous migration
readback. `after.json` is independently read after writes; `state-readback.json`
records the additional rendered-state corrections. `browser-before.log` retains
the demonstrated Chromium failures. `verification.json` and
`browser-verification.json` contain final per-context ratios. Validation logs
retain the host npm/Node compatibility warning; commands completed successfully.

The verifier now exits unsuccessfully for any Surface/Content, Foreground or
overlay failure; historical failing migration evidence is not overwritten.
The browser regression runs in regular CI. These checks cover declared token
pairs and enabled Button text, not complete WCAG or focus-visibility certification.
