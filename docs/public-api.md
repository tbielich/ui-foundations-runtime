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
