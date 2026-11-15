# Tabs follow-ups — 2026-11-15

Issue: https://github.com/tbielich/ui-foundations-runtime/issues/36
State fix: merged in PR #343, `920dc327627e95d61e4335e13872edb7c374deff`.
Follow-up branch: `feat/36-tabs-followups`.
Scope: [contract.json](contract.json); file identities: [source-manifest.json](source-manifest.json).

## Runtime result

Bounded Runtime validation **PASS**: 244 unit and 68 Chromium tests, no skips.
This is deterministic local evidence collected by the implementing assistant,
not a separate UIF-INT acceptance or manual screenreader review.

- Roving focus and automatic selection verified horizontally and vertically:
  arrows, wrapping, Home, End, Enter, Space, disabled skipping and Tab to panel.
- Controlled panels synchronize selected/hidden state and retain user data.
  Panels now receive an accessible name from their associated tab button.
  Nested list events stay within the owning list.
- Tab lists scroll locally at narrow widths. The first new overflow test failed
  because the Custom Element host expanded to content width; bounding the host
  and wrapper repaired the demonstrated defect. Prior failure log is retained.
- Owner correction replaces the old Compact/Default task with inherited
  container S/M/L: existing `data-scale="small|medium|large"`, no local size API.
  Font size, line height and padding scale; border widths stay fixed. Tests cover
  nearest-context replacement, unknown inheritance, Medium reset, no DOM rebuild
  and all three Brand × two Scheme contexts.
- Docs and Playground use the actual Custom Elements. Playground controls,
  working panel switching, generated HTML/Nunjucks/WC examples and Scale switch
  preserve the current context/orientation. Narrow layouts also pass at 320px
  with root text enlarged to 200%; this is not real browser zoom certification.
- Static macros retain their existing semantic contract; container scaling
  applies through their shared CSS. No macro-local size API was introduced.

## Code Connect and Figma boundary

The existing `schemas/web-tab.figma.ts` parses successfully using installed
Code Connect 1.4.7. Live readback confirms component set `2535:286`, Selected
false/true and Label text. [code-connect.json](code-connect.json) retains the
parsed mapping; [figma-readback.json](figma-readback.json) retains source evidence.
This confirms source coverage, not live mapping publication.

Read-only comparison of all nine existing variable IDs/names/WEB values passes.
Seven aliases match, including both padding slots. Two pre-existing color alias
differences remain: Active border export → `3173:34`, live → `3173:75`; Active
text export → `3173:34`, live → `3173:83`. Full Figma parity is therefore **FAIL**,
separate from the passing Runtime gate. See [figma-export-comparison.json](figma-export-comparison.json).
No Figma, token, dependency or consumed-governance changes were made. These
color differences are not silently resolved as part of container sizing.

## Foundation

The prior Runtime guide had no corresponding canonical Vault foundation. The
owner requested recording it. Vault PR #77 adds `foundations/container-scale.md`
in review. Runtime Foundations and the consumer guide link to that source;
no accepted/stable status or governance-pack publication is claimed.

## Commands and delivery

Node 22.23.2, existing lockfile, headless Chromium.
- `npm run lint`: exit 0 ([lint.log](lint.log)).
- `npm run test:unit`: exit 0, 244 pass ([unit.log](unit.log)).
- `npm run ci:check`: exit 0, 244 unit/68 browser pass ([ci.log](ci.log)).
- `npx playwright test tests/browser/tabs-state.spec.mjs tests/browser/tabs-followups.spec.mjs`: seven targeted cases passed before the final added nested-event case; final full suite includes all eight ([browser.log](browser.log)).
- `npx figma connect parse --file schemas/web-tab.figma.ts --outFile /tmp/uif-tab-code-connect.json --exit-on-unreadable-files`: exit 0 ([code-connect-parse.log](code-connect-parse.log)).
- `git diff --check`: exit 0.

The earlier state-fix Qwen review is separate evidence. No additional model
executor was used for this follow-up. Required hosted checks and human review
remain delivery gates. Issue #36 stays open until integration and outstanding
Figma/mapping acceptance are reconciled; no full accessibility conformance,
manual screenreader result, release or Figma publication is asserted.
