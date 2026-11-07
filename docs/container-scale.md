# Container scaling in Runtime

`data-scale="small|medium|large"` sets the scale context for participating descendants. The initial adopters are StatusLight, Meter and ProgressBar. Other existing Runtime components retain their current sizing until explicitly adapted; this feature does not claim an ecosystem-wide migration.

```html
<div data-scale="large">
  <uif-status-light variant="positive">Online</uif-status-light>
  <uif-meter size="sm" label="Storage used" value="72"></uif-meter>
  <uif-progress-bar label="Uploading" value="60" show-value></uif-progress-bar>
</div>
```

The small Meter remains smaller relative to the large container context. Its local size does not replace the context. Both the container context and the local size contribute to the typography, line height, spacing and radii. Local geometry choices remain: for example, the small Meter still uses its existing small track height, and context changes do not multiply that height or its border width.

## Context resolution

- No scale container: medium behavior.
- A recognized scale container: its descendants inherit that context.
- A nearer recognized container: replaces the inherited context; factors do not compound across containers.
- An unrecognized value: introduces no context and leaves inheritance intact.
- Local component size: applies additionally inside the inherited context.

```html
<div data-scale="large">
  <uif-meter size="sm" label="Locally small" value="72"></uif-meter>
  <div data-scale="medium">
    <uif-meter label="Medium context" value="72"></uif-meter>
  </div>
</div>
```

CSS inheritance updates the participating components without DOM rebuilding or a JavaScript context provider. Brand and Scheme remain independent. Existing viewport-fluid typography is not replaced, and no device breakpoints or `data-mode="min|max"` are introduced.

## Source and projection

The implementation uses the existing Core typography anchors Font/Size xs, sm and md as small, medium and large references. The common denominator is sm, the current 14-unit baseline of these indicators. `scripts/scale-context.mjs` derives unitless ratios during the normal CSS build; current references are 12/14, 14/14 and 16/14. Changing the source anchors changes the ratios on rebuild. Invalid or unordered anchors fail the build.

These ratios are implementation helpers in generated `dist/core/context/scale.css`, consumed through `ui-foundations/core.css`. They are not additional public design-token slots or invented Figma identities. `data-scale` is the public context API. Internal `--_uif-*` properties are not customization contracts. Existing medium typography slots now alias the matching Semantic font-size/line-height roles instead of retaining historical literals. Small typography slots remain exported for compatibility, but local small typography is derived from the common factor; those old slots no longer set independent dimensions. Track/indicator size slots retain their current behavior.

The CSS uses ordinary multiplication by unitless factors; it does not require CSS typed division, CSS zoom or transform scaling. Font sizes, line heights, gaps and length-based radii use the same proportional factors. Descendant labels inherit their component's typography rather than reapplying an unscaled body role. Circles retain their percentage-based shape. Widths, track/indicator dimensions, hidden semantic markup and outlines retain their existing behavior. Scaled values can be fractional; base token values are not rewritten or rounded again.

## Macros and plain HTML

The same context applies to the static Nunjucks macros and their emitted CSS pattern classes:

```njk
{% import "macros/ui.njk" as uif %}
<div data-scale="large">
  {{ uif.meter(label="Storage used", value=72, size="sm") }}
  {{ uif.progressBar(label="Uploading", value=60, showValue=true) }}
</div>
```

The three component previews and playgrounds expose Scale (S/M/L) next to the Light/Dark switch. Local Size remains in the playground properties panel. Generated HTML, Nunjucks and Custom Element examples include the container. The scale selection survives a copied URL and resets to medium with Reset. A scale context is not a `scale` attribute on a component.

## Acceptance boundary

This is the owner-authorized Runtime implementation of the requested container behavior, bounded to the three reintegrated components. It does not change the consumed governance pack or assert that Figma already has corresponding modes. Live Figma parity and active Code Connect mappings remain blocked as recorded in the component reintegration evidence.
