---
layout: layouts/docs.njk
title: Design Tokens
description: The layered token architecture that connects Figma designs to production code.
navTitle: Design Tokens
order: 4
permalink: /foundations/design-tokens/
---

Design tokens provide a shared contract for visual decisions across UIF. UIF-VLT
defines the durable architecture and contracts; Figma is the design-authoring
projection, and UIF-RUN turns the model into consumable CSS and other runtime
artifacts.

## Token layers

The system separates four responsibilities so a token name can explain what it
means without also encoding a specific brand or theme.

```text
Core
  ↓
Appearance
  ├─ Brand
  ├─ Scheme
  └─ Scale
  ↓
Semantics
  ↓
Patterns
```

<table class="docs-options-table">
  <thead><tr><th>Responsibility</th><th>What it controls</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td>Core</td><td>Reusable primitives such as palette steps, spacing, radii, and type values</td><td><code>--size-spacing-200</code></td></tr>
    <tr><td>Appearance / Brand</td><td>Brand-specific visual identity</td><td>Brand A, Brand B, Brand C</td></tr>
    <tr><td>Appearance / Scheme</td><td>Light/dark realization</td><td>Light, Dark</td></tr>
    <tr><td>Appearance / Scale</td><td>Fluid or scalar endpoints</td><td>Min, Max</td></tr>
    <tr><td>Semantics</td><td>Stable UI purpose, independent of brand and scheme</td><td><code>Color/Action/Surface/Hover</code></td></tr>
    <tr><td>Patterns</td><td>Where a semantic role is used in a UI pattern</td><td><code>Button/…/Background/Hover</code></td></tr>
  </tbody>
</table>

A useful mental model is: **Core provides values, Appearance resolves context,
Semantics names intent, and Patterns apply that intent.**

### Surface, Content, and Foreground

- **Surface** is a filled region.
- **Content** is text or an icon placed on that Surface.
- **Foreground** is standalone action/status text, icon, stroke, or outline on a surrounding surface.

Surface and Content are paired per interaction state so accessibility can be
verified for the actual state rather than inferred from a default color.

## Naming convention

New semantic color roles use `Color/<Purpose>/<Role>/<State>` (or
`Color/<Role>/<State>` for the default canvas pair).

Pattern names follow `<Family>/<Variant?>/<Part?>/<Property>/<State?>`.

Interaction state is always the final segment. UIF keeps `Active` as the
existing Runtime name for the pressed interaction; do not introduce
`Pressed` as a second vocabulary.

## Pipeline

Figma exports JSON token files to `figma/exports/`. The build step
`npm run tokens:generate` transforms them into CSS custom properties in `dist/tokens/css/`.

Generated files in `dist/` are never edited directly.

## Brand and mode

Brand and appearance mode are orthogonal concerns controlled by `data-brand`
and `data-mode` attributes on the root element. Switching either attribute swaps
the active token values without changing component markup.

## Rules

- Patterns consume Semantics by default; direct Appearance/Core dependencies are documented compatibility exceptions.
- Brand, Scheme, and Scale belong to Appearance, not to semantic token names.
- Never hardcode color values in pattern CSS.
- Use `var(--...)` for token-driven visual properties.
- Generated compatibility filenames do not define architectural ownership.

## Reference

- [All Tokens](/foundations/design-tokens/all/) — complete tabular index of all generated tokens
