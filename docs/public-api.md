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

## Read-only content and code

Import `renderContent` from `ui-foundations/behaviors/content` and call it with a target element, an untrusted string and optional `{ headingLevel: 2, format: "markdown", copy: false }`. `format: "text"` retains the original source as preformatted text. The renderer creates semantic DOM without HTML sinks; raw HTML is disabled and link protocols are restricted. See [Content](https://ui-foundations.com/patterns/content/) for the supported subset, size limits, localization, optional clipboard feedback and fallbacks. Set `copy: true` to compose a Copy action with fenced code. The default renders content without actions.

`ui.css` includes `.uif-content`, `.uif-code` and `.uif-code-grid`. Apply `class="uif-textarea uif-code" wrap="off"` for code output, adding `uif-code-grid` for contiguous Unicode rows. Mono consumes the existing `--uif-semantic-scale-font-family-mono` role, with generic monospace fallbacks. No font is automatically loaded. Layout and Unicode glyph metrics remain font-dependent.

### Older WebViews

`ui-foundations/legacy.css` is an opt-in flat CSS bundle for the bounded BOOX Chrome 88 target. It contains the same tokens and patterns in reset → base → tokens → context → components order, without CSS layers. Do not load it alongside the layered entry on browsers that support layers. It does not polyfill JavaScript, fonts or other CSS features, and flattening does not preserve every layer-specific cascade interaction with consumer styles. In particular, normal selector specificity applies and important declarations no longer have reversed layer priority. Test the actual consumer before adoption.

Fonts remain consumer-owned. The Content docs load unmodified DejaVu Sans Mono 2.37, including its licence and source hash, as their reference for code and the tested Unicode drawing repertoire. This does not replace Figma's SF Mono primitive or introduce a new Runtime token. Generic monospace fallback does not guarantee Unicode drawing fidelity. A one-em row step does not imply square glyph cells.
