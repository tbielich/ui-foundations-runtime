# Public API Surface (v1)

## Purpose

Provide the canonical Runtime-facing public API summary for v1 and link to the
full migration guidance.

## Canonical v1 usage

- CSS classes: `.uif-*`
- Component token slots: `--uif-component-*`
- Nunjucks usage examples: `uif.*` alias
- Custom Element tags: `<uif-*>`

## Compatibility context

Legacy names are migration/compatibility context only and are not canonical
usage for new authored examples:

- bare classes such as `.button` and `.input`
- legacy tags such as `<ui-*>`
- legacy token prefixes such as `--component-*`

## Stable package/module surfaces

Some package/module surfaces intentionally remain stable in v1, including
`ui-foundations/elements/ui-*` subpaths and `ui-*.js` module filenames.
This is a package compatibility boundary, not a public authored-tag namespace.

## Canonical sources

- `docs/adr/adr-public-api-documentation-contract.md`
- `docs/adr/adr-uif-public-api-namespace.md`
- `docs/migrations/public-api-namespace-v1.md`
- `MIGRATION.md`

## Indicator elements and macros

Import `ui-foundations/elements/ui-status-light`, `ui-foundations/elements/ui-meter` or `ui-foundations/elements/ui-progress-bar` individually, or use the aggregate `ui-foundations/elements` entry. Their tags are `<uif-status-light>`, `<uif-meter>` and `<uif-progress-bar>`.

The corresponding macros in `ui-foundations/macros/ui.njk` are `uif.statusLight`, `uif.meter` and `uif.progressBar`. The macros emit static semantic HTML without requiring Custom Elements. Usage and numeric input contracts are documented in the respective pattern pages.

## Feedback overlay elements and macros

Import `ui-foundations/elements/ui-toast` for `<uif-toast-region>` and `<uif-toast>`, or `ui-foundations/elements/ui-popover` for `<uif-popover>`. Both modules are also included by the aggregate `ui-foundations/elements` entry.

The static macro surface provides `uif.toastRegion`, `uif.toast` and `uif.popover`. Toast actions dispatch `uif-action`; dismissals dispatch `uif-dismiss`. Popover triggers are bound by ID and synchronize `aria-expanded`, `aria-controls` and `aria-haspopup="dialog"`. See the Toast and Popover pattern pages for timing, urgency, focus and placement contracts.

Figma identity, token reconciliation and Code Connect publication remain deferred for these feedback overlays.

## Content and navigation primitives

Import `ui-foundations/elements/ui-breadcrumbs`, `/ui-card`, `/ui-tag` or `/ui-skeleton`, or use the aggregate elements entry. The registered tags are `<uif-breadcrumbs>`, `<uif-card>`, `<uif-tag-group>` with `<uif-tag>`, and `<uif-skeleton>`.

The static macros are `uif.breadcrumbs`, `uif.card`, `uif.tagGroup`, `uif.tag` and `uif.skeleton`. Breadcrumbs emit a labelled navigation list with a native disclosure for collapsed middle items. Card exposes media/header/body/footer light-DOM regions and one explicit link or selectable button. TagGroup provides roving focus and stable focus after `uif-remove`; selectable Card dispatches `uif-select`. Skeleton placeholders stay hidden from assistive technology while their containing region owns `aria-busy` and its loading label.

Live Figma component/token reconciliation and Code Connect publication remain deferred for these four primitives.

## Native input-control components

Import `ui-foundations/elements/ui-search-field`, `/ui-number-field`, `/ui-segmented-control` or `/ui-range-slider`, or use the aggregate elements entry. The registered tags are `<uif-search-field>`, `<uif-number-field>`, `<uif-segmented-control>` and `<uif-range-slider>`.

The static macros are `uif.searchField`, `uif.numberField`, `uif.segmentedControl` and `uif.rangeSlider`. Each surface keeps native input, radio or range semantics. Search Field adds clear and `uif-search` behavior without replacing form submission. Number Field keeps formatting in output text and `aria-valuetext`. Segmented Control is a labelled radio group. Range Slider uses two labelled non-crossing range inputs. Enhanced controls dispatch `uif-change` where a component-level value event is useful; native `input` and `change` events continue to bubble.

`uif.searchField`, `uif.numberField` and `uif.rangeSlider` require a non-empty, caller-owned `id` as their first macro argument. The macro uses it as the base for every `id`, `for` and ARIA reference; every instance on a page therefore needs a unique value. Migrate calls that omitted `id` or relied on the former fixed defaults by passing an explicit ID, such as `uif.numberField("booking-budget", label="Budget")`. Missing or empty IDs emit no control.

Live Figma component/token reconciliation and Code Connect publication remain deferred for issues #48, #49, #60 and #63.

## Container scale

`data-scale="small|medium|large"` on a container sets the inherited scale for StatusLight, Meter and ProgressBar. Local `size` stays relative to that context. The supported scaled properties are font size, line height, spacing and radii. See [Container scaling](container-scale.md) for nesting, source derivation and the current adoption boundary.


## Font loading ownership

The optional `ui-foundations/base.css` entry provides native presentation without
a Brand palette or font loading. It shares the reset and Brand A sizing with
`system-ui, sans-serif`. Use it instead of the branded
CSS entries. Existing enhancement modules are available under
`ui-foundations/behaviors/calendar`, `/date-input`, `/input-field` and `/table`.
See [Base usage](base.md) for the code-only boundary and examples.

The Runtime npm package contains no font binaries or `@font-face` declarations
and makes no automatic requests to a font service. Applications choose and load
their own licensed fonts. Existing A/B/C family roles, weights and fallback
stacks remain unchanged.

Define the faces used by your selected brand in your application's stylesheet.
For example, an application-owned variable Inter face can use:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-variable.woff2") format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
```

Use the family name expected by the tokens, the weight range supported by your
file, and your own asset URL. Add the other families used by your chosen brand.
When a face is unavailable, the declared Basic and generic fallbacks apply.

The repository's documentation and playgrounds explicitly load
[`site/assets/brand-fonts.css`](../site/assets/brand-fonts.css), with their local
licensed assets under `site/assets/fonts/brand/`. These documentation assets are
excluded from the npm package; the stylesheet is a loader example for consumers.

Applications upgrading from development builds that loaded fonts automatically
must add an application-owned font stylesheet. CSS entry points, component
classes, family tokens and fallback roles retain their existing purpose. Font
loading is independent of choosing the native Base or enhanced UIF experience.

Repository validation checks the actual package with
`node scripts/check-font-packaging.mjs`: no packed font binaries and no font-face
loader in its CSS. Browser checks load the docs stylesheet explicitly and also
verify that Runtime CSS alone makes no font requests.

### Pattern typography token names

Use stable Pattern names for typography overrides:

| Current token | Deprecated override input |
| --- | --- |
| `--uif-button-font-family` | `--uif-button-compat-font-family` |
| `--uif-button-font-weight` | `--uif-button-compat-font-weight` |
| `--uif-field-label-font-family` | `--uif-field-label-compat-font-family` |
| `--uif-field-label-font-weight` | `--uif-field-label-compat-font-weight` |
| `--uif-badge-font-family` | `--uif-badge-compat-text-font-family` |
| `--uif-badge-font-weight` | `--uif-badge-compat-text-font-weight` |
| `--uif-illustrated-message-heading-font-weight` | `--uif-illustrated-message-compat-heading-font-weight` |

Brand contexts set the current tokens from the existing semantic roles. The old
names are supported only as deprecated override inputs, not generated defaults.
If both old and current names are explicitly set, the old input retains priority
for backward compatibility; remove it when migrating to the current name.
All other Pattern typography tokens already use names without `compat`.
