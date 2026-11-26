---
layout: layouts/docs.njk
title: Symbol
description: Experimental decorative motifs with contextual sizing and adjustable SVG stroke.
navTitle: Symbol
order: 22
permalink: /patterns/symbol/
playgroundUrl: /patterns/symbol-playground/
playgroundLabel: Open Symbol Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero">
  <div class="docs-hero-preview">
    <div class="docs-hero-preview-stage">
      <span>{{ uif.symbol('checkmark') }} Saved</span>
      <button type="button">{{ uif.symbol('plus') }} Add item</button>
      <a href="/patterns/symbol-playground/">Continue {{ uif.symbol('chevron') }}</a>
    </div>
  </div>
  <div class="docs-hero-meta">
    <span class="docs-status" data-status="experimental">Experimental</span>
    <a href="/patterns/symbol-playground/">Open Symbol Playground</a>
    <a href="https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UI-Foundations?node-id=3336-3818">View Figma source</a>
  </div>
</div>

Symbol renders one trusted path inside a native inline SVG with a 24 × 24 viewBox.
The five motifs preserve the source SVG geometry and round caps and joins:
`checkmark`, `dash`, `chevron`, `plus`, and `cross`. Chevron points right; this
slice has no rotation property. Unknown names render empty.

Symbol is decorative only. The SVG has `aria-hidden="true"` and
`focusable="false"`. Its parent owns the visible label, meaning, keyboard
interaction, and any accessible name. There is no Symbol label or image-role API.

### Native markup

<button type="button"><svg xmlns="http://www.w3.org/2000/svg" class="uif-symbol" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12H18M12 6V18"></path></svg> Add item</button>

```html
<button type="button">
  <svg xmlns="http://www.w3.org/2000/svg" class="uif-symbol"
       viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M6 12H18M12 6V18"></path>
  </svg>
  Add item
</button>
```

### Macro and Custom Element

{% raw %}
```njk
{% import "macros/ui.njk" as uif %}
<button type="button">{{ uif.symbol('plus', weight=500) }} Add item</button>
```
{% endraw %}

```html
<script type="module">
  import 'ui-foundations/elements/ui-symbol';
</script>
<button type="button"><uif-symbol name="plus" weight="500"></uif-symbol> Add item</button>
```

The macro emits SVG directly. The optional light-DOM Custom Element adds its
own host around the same SVG. No React wrapper is provided. Helpers accept only
fixed motif names and normalized weight; arbitrary SVG paths and attributes are
not forwarded. The macro's optional `className` is escaped.

### Styling contract

The square uses the parent's line height (`1lh`, with a `1em` fallback) and
inherits `currentColor`. Stroke scales with SVG size; there is no
`non-scaling-stroke`. The approved
`--uif-symbol-default-glyph-stroke-width-default` token aliases Semantic
Size/Border/Default. At reference weight 400 the multiplier is 1.

`--uif-symbol-weight` is an experimental stroke multiplier divided by 400.
Emitters default to 400, clamp finite decimal numbers and numeric strings to
100–900, and default invalid or nonfinite input to 400. Direct CSS authors must
keep the same bounds. This control is separate from `font-weight` and introduces
no typography scale, font-size, color, or size token.

### Symbol and Icon

Icon uses an SVG asset as a CSS mask with the asset's fixed stroke geometry.
Symbol uses parametrically styled trusted inline SVG geometry, so CSS can vary
its stroke. Both already inherit color; color inheritance is not a new Symbol
capability. Symbol costs an SVG root plus a path per occurrence; the optional
Custom Element adds another host. This trade-off makes no global performance
claim. Existing SVG assets, Checkbox, and Select remain unchanged.

### Review status

This first slice is experimental. Code Connect is pending component publication
and separate mapping confirmation; the schema reference is not a connection.
Screenreader, E-Ink, browser behavior, contrast, and WCAG checklist acceptance
are not established by this implementation. Review the actual parent context.
