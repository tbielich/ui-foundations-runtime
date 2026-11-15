---
layout: layouts/docs.njk
title: Design Tokens
description: The layered token architecture that connects Figma designs to production code.
navTitle: Design Tokens
order: 4
permalink: /foundations/design-tokens/
---
{% import "macros/foundation-docs.njk" as foundation %}


Design tokens connect visual decisions in Figma to CSS and other generated
outputs. UI Foundations organises them into layers so patterns can adapt to
different brands and schemes without changing their markup.

{% call foundation.feature("Token layers", "One decision, a clear role.", "Each layer adds context or intent. Patterns use semantic roles to stay adaptable across brands and schemes.") %}
<ol class="foundation-stack"><li><span>01</span><div><strong>Core</strong><small>Reusable raw values</small></div></li><li><span>02</span><div><strong>Appearance</strong><small>Brand · Scheme · Scale</small></div></li><li><span>03</span><div><strong>Semantics</strong><small>Action / Surface / Hover</small></div></li><li><span>04</span><div><strong>Patterns</strong><small>Button hover background</small></div></li></ol>
{% endcall %}


## Token layers

The system separates four responsibilities so a token name can explain what it
means without also encoding a specific brand or theme.



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

## Applying tokens

Use the CSS custom properties listed in the [token reference](/foundations/design-tokens/all/).
Prefer semantic roles for application UI and pattern tokens for a specific control.

See [Theming](/foundations/theming/) for brand, scheme, and scoped overrides.

## Rules

- Use semantic roles for patterns so their intent stays consistent across brands and schemes.
- Brand, Scheme, and Scale belong to Appearance, not to semantic token names.
- Never hardcode color values in pattern CSS.
- Use `var(--...)` for token-driven visual properties.

## Reference

- [All Tokens](/foundations/design-tokens/all/) — complete tabular index of all generated tokens

{{ foundation.next("/foundations/design-tokens/all/", "Find a token", "Browse the generated names and values.") }}
