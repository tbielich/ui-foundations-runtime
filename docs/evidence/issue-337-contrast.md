# Issue 337 — IllustratedMessage description contrast repair

## Scope and baseline

This is executor evidence for the bounded Runtime repair in issue 337. The
independent baseline at commit `43e0c4db236bbd7096af9b7d857229867db489da`
measured the 16 px / 400 description at 3.949439648049115:1 in Light and
1.6620953314177012:1 in Dark on the default surface. All three brands failed in
both the real docs hero and actual Custom Element playground. Heading and solid
action text passed. That baseline is external evidence supplied with the job;
it is not reproduced executor acceptance.

## Token-first comparison and decision

The failing chain was:

`Illustrated Message/Description/Text Color` →
`Semantics/Color/Foreground/Subtle` → `Color/Text/Subtle` → brand subtle.

Three options were compared:

1. Correct the shared subtle source. Rejected because the source is used by
   nine pattern slots (including placeholders, helper text and the illustration)
   plus legacy direct consumers. Changing it would exceed the demonstrated
   IllustratedMessage defect and could erase intended low-emphasis semantics.
2. Add a description-specific or secondary-content semantic token. Rejected as
   an implementation choice because `Semantics/Color/Content/Default` already
   represents readable ordinary content on the default surface. A new shared
   semantic would duplicate that purpose and require separate design/Figma
   authority.
3. Correct the IllustratedMessage description pattern alias to
   `Semantics/Color/Content/Default`. Chosen because description prose is
   ordinary content, not placeholder or disabled text. This existing governed
   role already supplies readable body text across Input, Checkbox, Radio,
   Switch, Select and Inline Alert. It preserves Core → Appearance → Semantics
   → Patterns and limits the value change to one pattern slot.

The description now resolves like the heading for color while retaining its
separate 16 px / 400 typography. Hierarchy therefore remains expressed through
type size, weight and spacing rather than inaccessible low-contrast color. The
illustration stays subtle. No CSS override, primitive/palette change, new token,
Vault change or claimed live-Figma update is included.

## Affected consumers

The changed public slot is
`--uif-illustrated-message-description-text-color`. Consumers of the
IllustratedMessage pattern, macro and Custom Element receive the corrected
value. Other `Foreground/Subtle` consumers are unchanged.

## Regression and verification boundary

`tests/browser/illustrated-message-contrast.spec.mjs` exercises Brand A/B/C in
Light/Dark on both `/patterns/illustrated-message/` and
`/patterns/illustrated-message-playground/`. It measures computed heading,
description and solid-action foregrounds against composed ancestor backgrounds,
rejects background images or group opacity, and compares the unrounded WCAG
ratio with 4.5:1. The source-level unit assertion fixes the intended alias and
token generation verifies source/output consistency.

Executor check results are recorded after execution. Passing executor checks
are implementation evidence only; independent verification and acceptance are
still required.

## Executor results on this iMac

- `npm run tokens:generate`: passed. The extract report contained zero missing
  WEB syntax entries, zero unparseable entries and zero duplicate CSS variable
  names. Generated
  `--uif-illustrated-message-description-text-color` resolves to
  `var(--uif-semantic-color-content-default)`.
- `node --test tests/illustrated-message-naming-migration.test.mjs`: passed,
  8/8 tests.
- `npm run docs:site`: passed; the package build reported `BUILD OK` and
  Eleventy wrote 81 pages.
- Focused Chromium regression: infrastructure failure before any assertion.
  Playwright's configured server command failed with
  `listen EPERM: operation not permitted 0.0.0.0:8099`. The repository server
  has no supported host override. Assertions were not skipped or weakened and
  dependencies were not changed. This result is neither a contrast pass nor an
  assertion failure.

The corrected description now uses the same semantic color role whose computed
colors the supplied baseline measured on the heading as `#333333` on `#ffffff`
(12.63465434445799:1) in Light and `#cccccc` on `#000000`
(13.076546777106756:1) in Dark. That supports the source-level decision but is
an inference from supplied measurements, not replacement real-browser evidence
for the patched build.

Required full-command outcomes:

- `npm run lint`: passed; JS syntax lint checked 82 files.
- `npm run test:unit`: passed; 232 tests passed, 0 failed.
- `npm run ci:check`: did not complete. Lint, 232 unit tests, docs drift,
  naming, build, smoke, token validation, token usage, DTCG validation, asset
  references, rule-pipeline validation and docs build all passed. The final
  `test:browser:only` stage failed before test execution because its web server
  hit `listen EPERM: operation not permitted 0.0.0.0:8099`. This is the same
  infrastructure failure as the focused browser attempt; it is not an assertion
  failure and does not establish browser acceptance.

## Repair iteration 2 of 2

Independent rendered verification supplied after iteration 1 confirmed that
the unchanged token patch passes all 36 text/background pairs in all 12
contexts. Description contrast is 12.634654:1 in Light and 13.076547:1 in Dark.
That verification found a defect only in the newly added regression: composing
two fully transparent layers divided by combined alpha zero, producing `NaN`.
The regression also sampled immediately after theme-control clicks. In the
operator's first full CI run, 232 unit tests and 36 existing browser tests
passed; this new regression alone failed. This history is retained rather than
reclassified as an infrastructure result.

Iteration 2 changes only the regression and this evidence. The compositor now
keeps a zero-alpha intermediate transparent without division, rejects any
non-finite parsed/composited color or contrast result, and requires the complete
ancestor background chain to resolve to an opaque color. Existing fail-closed
checks for background images and element opacity remain. After each brand/mode
selection, the test awaits finite document animations and two rendering frames
before measuring. It still requires exactly 36 rows across both surfaces and
all A/B/C × Light/Dark contexts, explicitly asserts numeric finite ratios, and
retains the unrounded `>= 4.5` threshold.

The operator separately confirmed that the current Playwright Chromium does
not support macOS 12. Dependencies are not downgraded, and browser assertions
are not weakened; independent browser and CI execution will be repeated on the
operator Mac.

Iteration-2 executor checks on this iMac:

- `node --check tests/browser/illustrated-message-contrast.spec.mjs`: passed.
- `npm run lint`: passed; JS syntax lint checked 82 files.
- `npm run test:unit`: passed; 232 tests passed, 0 failed.
- `npm run docs:lint`: passed; 91 documentation files scanned.
- `npm run docs:site`: passed; token/build integrity was clean and Eleventy
  wrote 81 pages.
- Focused revised browser test: not executed because the configured web server
  again failed first with `listen EPERM: operation not permitted
  0.0.0.0:8099`.
- `npm run ci:check`: all stages through docs build passed, including lint,
  232 unit tests, naming, smoke, token validation/usage, DTCG, assets and rules.
  The final browser stage encountered the same pre-test server-bind `EPERM`.
  Therefore the revised regression has local syntax/build coverage but no
  executor browser result; operator-side independent browser/CI reruns remain
  necessary.
