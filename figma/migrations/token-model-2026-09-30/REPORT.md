# UIF token migration evidence — 2026-09-30

Mode: IMPLEMENT. Repositories: `tbielich/ui-foundations-vault` (ADR) and
`tbielich/ui-foundations-runtime` (projection). Branch:
`agent/uif-token-projection-migration`. Owner scope is persisted in
`execution-contract.json`; Figma branch: `3G6kkLVF0AKQO2BeCpixiN`.

Core → Appearance {Brand, Scheme, Scale} → Semantics → Patterns is projected
in Figma. 99 Roles and 25 Appearance bridges were added; 296 Pattern alias
connections now consume Roles. All 641 original IDs, WEB syntax and resolved
Figma values are preserved across 7,692 context checks. Four prototype helper
variables are excluded; 761 variables have ID-based Runtime projections.

The Figma README follow-up replaces the visible incomplete documentation with
14 editable sections on the same page (`2004:103`, current frame `3185:2`).
It covers all collections including Scale, dependency direction, state-last
naming, Surface/Content and Foreground, brand shape, scopes, checked Button
aliases, Runtime compatibility, and separate structural/accessibility outcomes.
Previous documentation frames and the historical widget remain hidden on that
page. The cover is updated. The new frame uses existing Inter/SF Mono fonts and
bound UIF surface/content/spacing variables with explicit Brand A / Light Mode.
`readme-followup.json` persists all write IDs and independent readback: 14 frames,
37 text nodes, zero images, zero text sizing defects, zero overlapping sections.
The composition screenshot passed visual review. Component geometry was not changed.

Runtime keeps public CSS/package paths and legacy export paths through
`figma/token-projection.json`. New role exports are qualified by Semantics to
avoid name collisions with Scheme. Partial sync is ID-aware and retains color
alpha and recorded code-only sibling projections.

The conflicting old code-only Liquid scale was replaced by actual Figma
endpoints. For example lg changes from the prior 18–20px curve to Figma's
20–36px curve. This is intentional parity correction, and can affect responsive
text size. The old curve is preserved in `retired-runtime-scale.json`.

## Verification

- `npm run lint`: PASS.
- `npm run test:unit`: PASS, 182 tests.
- `npm run ci:check`: PASS, including the bounded Chromium test (1 passed).
- `python3 scripts/verify-token-projection.py`: structural/projection PASS;
  independently checks aliases, layer direction, names, scopes, unchanged
  resolved values, export metadata and generated CSS aliases/global Scale.
- `git diff --check`: PASS in both repositories.

## Accessibility result: FAIL

Declared Surface/Content pairs: {'PASS': 58, 'EXEMPT': 6, 'FAIL': 14}.
Action Foreground on canvas: {'PASS': 12, 'FAIL': 12}.
Composited action-state overlays: {'PASS': 9, 'FAIL': 3}.

Existing failures include Brand B status/subtle/selection pairs, dark action
Foreground (Brand A reaches 1:1), and dark Hover/Active overlays. Base Action
Surface/Content pairs pass across all three brands and both schemes. The
original Figma color values were preserved, so these are persisted pre-existing
palette/state defects, not repaired or certified by this architecture migration.
All ratios and declared surfaces are in `verification.json`. Disabled pairs are
explicitly exempt. Rendered component accessibility still requires its own gate.

## Review and publication boundary

ADR remains review; this owner's bounded instruction authorizes the slice.
Consumed governance packs are untouched. No merge, package release, Figma main
branch merge or published library update is part of this execution. UIF/UILib
separation is preserved; no UILib-specific brand values were imported.
