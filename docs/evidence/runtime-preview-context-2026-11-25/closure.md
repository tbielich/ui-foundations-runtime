# Preview context workflow closure

Date: 2026-11-25. Branch: `feat/runtime-preview-context-contract`.
Base: `feat/runtime-tree-view` (`16a298f`). PR: #367.

## Interrupted check and corrections

The pasted Kiro command exited with `toast: overview overflows at 320px/200%`.
The first independent reproduction measured a 642px page at a 320px viewport.
The Toast options table caused that overflow; the preview itself fit.
Checking all 12 overview pages also exposed long headings and inline code,
Popover content rendered before Custom Element registration, and Breadcrumbs
disclosure geometry. These are now corrected:

- Toast and Popover options keep native table semantics in named, focusable
  scrolling regions. Only those tables scroll horizontally.
- Documentation prose wraps long words; hero grid/flex items can shrink.
- The Popover overview loads its existing Custom Element module. Enter opens
  the named dialog; Escape closes it and restores trigger focus.
- Closed Breadcrumbs disclosures explicitly hide their lists. Narrow-screen
  expanded lists participate in layout and retain keyboard access to links.

No token source, dependency, Figma artifact, or earlier stacked PR was changed.
The previously local DropZone upgrade correction `f0bf454` remains included.

## Verification

Targeted command: `npx playwright test tests/browser/preview-context-contract.spec.mjs`.
Result: 32/32 passed. This includes all 432 Brand × Scheme × Scale combinations
(12 overview pages and 12 playgrounds), overview reflow at 320px/200% text,
expanded disclosure/dialog behavior and keyboard scrolling of option tables.
Existing tests cover URL hydration/reset, code generation, local-size isolation,
forced colors, target floors and reduced motion.

The first `npm run ci:check` attempt used the shell's Node 22.0.0 and failed
because it interpreted `color-conversion.js` as CommonJS. This was an environment
failure, not a generated-token failure. The complete gate is run with the
already installed Node 22.22.1; no dependency or environment configuration is
changed.

Final command: `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run ci:check`.
Result: PASS, exit 0; 348/348 unit, 216/216 Chromium, 12/12 accessibility tests.
Lint, documentation drift, naming, build, smoke, token/DTCG validation, asset
references, font packaging and rule-pipeline checks also passed.
`git diff --check` passed. The verified source starts at `f7d66bc` plus the
reflow corrections and regression tests committed with this report.
Local full logs are preserved under `artifacts/accessibility/workflow-closure/`.

## Independent accessibility and semantic review

A separate review agent approved the implementation and final test diff with
no findings. Its own Chromium checks confirmed native table semantics, visible
focus and ArrowRight scrolling in the two option regions; Breadcrumbs Enter/Tab
behavior and 320px page width when closed and expanded; Popover dialog naming,
initial link focus, Escape restoration and viewport containment. Source review
also covered the existing DropZone correction: in-place native-input upgrade,
pre-upgrade selection, form participation and enhancement-only instructions.

This is bounded Chromium evidence. Manual screen-reader certification,
cross-browser certification, Figma integration and Code Connect publication
are not claimed. No merge or issue closure is part of this workflow closure.

A further isolated independent Chromium run reproduced the interrupted command's
final context (Brand C, dark Scheme, large Scale, 320px viewport, 200% text).
All twelve overview pages had `document.documentElement.scrollWidth = 320`;
all preview stages confirmed `c / dark / large`.
