# Local documentation preview context

Date: 2026-11-16
Repository: ui-foundations-runtime
Branch: fix/docs-brand-preview-scope
Mode: IMPLEMENT after a bounded read-only investigation.
Intake: directly requested by the owner during local preview review.

## Investigation

The initial Chromium sweep clicked Brand B controls on 60 rendered documentation pages. One persistent context leak was observed: `/primitives/color/` changed `document.documentElement.dataset.brand` from `a` to `b`; the computed font of Brand Color Mapping changed from Roboto Slab/Rokkitt/serif to Orbitron/Inter/sans-serif. The other 59 tested pages did not retain a changed root Brand/Mode or outside heading font after that click. This sweep covered Brand B, not every browser, interaction, or transient mutation. Raw observations are in `initial-brand-b-audit.json`.

## Local implementation

- Scope the Color brand switch to its own mapping panels; swatches use each token's existing value/reference rather than relying on the document Brand.
- Add Typefaces A/B/C selection. Derive each brand's active families from the existing Brand font tokens, Core catalogue, and legacy compatibility projection. Preserve the complete Core catalogue in a disclosure.
- Render the Examples overview with the existing component preview/grid/card conventions and non-interactive Login Form/Pricing thumbnails. Scope thumbnail colors and fonts to the preview's semantic context for both schemes.
- Restore preview `brand` and `mode` from valid URL parameters before local storage/defaults. User selection updates both URL parameters while retaining unrelated parameters and the fragment. Loading a default URL does not rewrite it. Storage failure does not prevent URL restoration.
- Provide explicit visible focus styling for the new documentation switch buttons. No Runtime component, token, Figma binding, or governance changes.

## Validation

Node 22.23.2. `npm run ci:check` passed with 260 unit tests, 100 browser tests, and 12 bounded accessibility tests. The Button/Checkbox evidence validator reports PASS for both pilots. `git diff --check` passed.

Eight new browser regressions cover color/typeface isolation, selected families and keyboard focus, linked responsive overview cards, all three brands in light/dark, refresh and cross-page restoration, URL precedence, preservation of unrelated parameters/fragments, invalid values, and unavailable storage.

Rendered Examples cards were visually inspected in desktop Chromium. Actual Fire TV acceptance remains with the owner; no Fire TV browser session was controlled or independently verified.

## Brand C border finding

Desktop Chromium showed the solid Brand C button with background `rgb(12, 75, 243)` and a 1px border `rgb(27, 17, 92)`. Its token chain is `--uif-button-solid-border-color-default` → `--uif-semantic-color-border-brand-default` → `--color-border-brand` → `--brand-color-primary-dark` → `--color-brand-c-blue-900`. An additional black outline on Fire TV was not independently reproduced. Runtime border/focus behavior remains unchanged.

## State

Available locally through the running documentation development server. The owner subsequently requested a PR and merge for this bounded batch; GitHub records the resulting transport and merge state.

## Subsequent Solid Button repair

After the initial preview work, the owner explicitly requested changing Solid Button borders to match their fills. The separate bounded local token repair is recorded in `figma/migrations/solid-border-surface-parity-2026-11-16/REPORT.md`; it supersedes the earlier statement that Runtime border bindings remain unchanged. Live Figma synchronization remains pending.


## Figma follow-up

The active desktop file was identified as UIF Library `uqMsy8fV1fPbQdAzgwlmBA`. Access to that file succeeded; the four Solid border aliases were synchronized and independently read back. See the migration report and its mutation/readback evidence. The earlier access failure concerned a historical file key. No library publication was performed.
