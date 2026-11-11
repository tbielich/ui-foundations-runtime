# Base/native implementation

Mode: IMPLEMENT followed by bounded VERIFY. Repository: `tbielich/ui-foundations-runtime`, branch `feat/339-brand-a-typography`, starting commit `129c8a1df58f63cf9300f8644f4de6b727f5d355`. Owner explicitly authorized a code-only Base version with native UI and minimal functional CSS, and consumer-owned fonts. **Gate: PASS for the bounded implementation and sizing refinement.** Changes in this phase are local; no commit, push, PR, merge, release, Figma edit or Vault/governance edit.

## Public entry and native boundary

```js
import "ui-foundations/base.css";
import "ui-foundations/elements";
```

Base is an alternative presentation entry, not an additional Brand or a stylesheet for undoing an already loaded branded bundle. Following the owner’s sizing/Sans Serif correction, it imports the shared reset, Brand A numerical typography and component sizing with `system-ui, sans-serif`. `scripts/base-geometry.mjs` generates a dependency closure from existing tokens, rejecting font families and visual palette/radius/shadow dependencies. No separate token source or Figma IDs were introduced. Native form-control appearance remains in charge.

Its minimal CSS preserves existing behavior: hidden tabs/alerts, tooltip and date-popup visibility/anchoring, icons, disabled-input auxiliary controls, selected calendar/table states and sort/resize affordances. Overlay/selection/disabled colors use CSS system keywords. Functional sizes use relative units. These are explicit owner-authorized native adapter exceptions, not a second design-token system. Native `<details>`, `<dialog>`, `<meter>` and `<progress>` provide their browser visuals. Switch semantics retain the native checkbox visual rather than a custom pill.

ProgressBar emits an additional native visual in the existing element and macro. It is aria-hidden because the existing root owns progress semantics; branded CSS hides this native visual, Base hides the custom track. Existing A/B/C token definitions and family/weight choices are unchanged.

Existing progressive-enhancement modules are additively exported as `ui-foundations/behaviors/calendar`, `/date-input`, `/input-field`, `/table`. No new behavior framework was introduced. Table sorting continues to emit a request event; consumer application data ordering is not silently implemented by Base.

## Necessary existing-module repairs

The current Calendar macro uses month/year selects while its enhancement module unconditionally dereferenced a removed title node. The same module now supports both headers, synchronizes selects/grid labels, preserves local-date serialization, and marks initialization. DateInput also marks explicit initialization. A demonstrated keyboard defect lost focus to BODY after Enter because the grid was replaced. Focus/date and a single grid tab stop now survive selection, arrow movement and month rerender. Earlier independent FAIL evidence is retained; affected Light/Dark repair verification passes.

## Package and documentation separation

All seven font assets, licences and provenance records were moved from Runtime source to `site/assets/fonts/brand/`. The documentation explicitly loads `site/assets/brand-fonts.css`; its consumer loader is outside the package. Runtime entries do not emit `@font-face` or automatically contact a font service. Applications load their own licensed faces; missing faces fall through the unchanged Basic/generic stacks.

The actual npm dry-run package has zero font binaries and zero automatic font loaders. `fonts:pack-check` is part of `ci:check`, after the asset build. README/public API document the migration. The packaged guide `docs/base.md` is reused by the `/base/` documentation page, with an isolated native preview at `/base/preview/`.

## Checks

- `npm run ci:check`, Node22.23.2: exit0, **244 unit and 59 Chromium tests passed**. Includes lint, docs/naming, token/DTCG/asset/rule checks, package-font check, build and browser tests. Log: `ci-check.log`.
- Base browser tests compare native Button/Input appearance, border style/radius and colors against raw HTML in Light/Dark. Sizing tests compare heading1–6, Button, Select padding/font size, Textarea, Tab and Input against Brand A at320/1200px with root16/20px. Native Select line-height/minimums are deliberately excluded because Chromium’s native picker ignores CSS line-height. System Sans Serif and zero body margins are asserted.
- Keyboard tabs/hidden panels, native details and modal Escape/focus restoration, tooltip focus visibility, input clear, alert dismissal, DateInput selection, local timezone dates, month navigation and native progress/meter were exercised.
- Earlier independent verification covered the pre-sizing Base state, documentation A/B/C actual fonts, package boundaries and Calendar repair. It is historical evidence, not fresh independent verification of this sizing refinement. See `verification/summary.json` (historical defect) and `verification/repair-summary.json` (PASS).
- `git diff --check`: PASS. Font files/licences were moved, not rewritten or deleted from the repository.
- `package-check.json`, `final-source-manifest.json` and `native-preview.png` record package output, final hashes and the rendered native page.

## Limits

This is browser-native presentation, not pixel-identical OS rendering of every custom composition. Calendar/table/tooltips remain UIF-enhanced HTML. The host owns color-scheme. Base intentionally sets `system-ui, sans-serif` and shares Brand A numerical sizes; text widths still vary by platform. Native Select line-height/minimums and meter/progress artwork remain platform-specific. A narrow calendar scrolls locally without shrinking its cell sizes. Custom state colors use system keywords; no complete accessibility or cross-browser certification is claimed. Verification used Chromium/macOS and Europe/Berlin date tests; native rendering intentionally varies by platform. Existing component limitations outside the exercised contract remain, including keyboard-disabled semantics of the custom Accordion flag (its existing pointer suppression is retained). Consumer deployments must provide their own font stylesheet for A/B/C and their existing icon asset routing. No Figma Base approximation is maintained.

Final source aggregate: `e57c6a650886396063f8bb114998dcbb132aabdaea29836b3b1500f6b25bf787`. The sizing refinement was checked by the root executor; no fresh independent-agent gate is claimed.
