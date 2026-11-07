---
layout: layouts/docs.njk
title: Theming
description: Select a brand and color scheme, and customise individual patterns.
navTitle: Theming
order: 4
permalink: /foundations/theming/
---
{% import "macros/foundation-docs.njk" as foundation %}


{% call foundation.feature("Try it", "Same pattern. Different context.", "Change the brand or scheme to see the same Button use a different set of token values.") %}
<div class="docs-hero-preview foundation-theme-preview"><div class="docs-hero-preview-controls"><span class="docs-hero-switch" role="group" aria-label="Preview brand"><button type="button" data-hero-brand="a" aria-pressed="true">A</button><button type="button" data-hero-brand="b" aria-pressed="false">B</button><button type="button" data-hero-brand="c" aria-pressed="false">C</button></span><span class="docs-hero-switch" role="group" aria-label="Preview scheme"><button type="button" data-hero-mode="light" aria-pressed="true">Light</button><button type="button" data-hero-mode="dark" aria-pressed="false">Dark</button></span></div><div class="docs-hero-preview-stage"><span class="uif-button solid">Explore journeys</span></div></div><p class="foundation-caption">Preview only. The surrounding documentation keeps its own appearance.</p>
{% endcall %}


## Select a brand and scheme

Load the package styles described in [Getting Started](/getting-started/), then
set the context on the root element:

```html
<html data-brand="a" data-mode="light">
```

`data-brand` accepts `a`, `b`, or `c`. `data-mode` accepts `light` or `dark`.
Change either independently:

```js
document.documentElement.dataset.brand = "b";
document.documentElement.dataset.mode = "dark";
```

The bundled brands are available contexts; adding another brand requires its
own token definitions. Setting an arbitrary attribute value does not create a theme.

## Customise a pattern

Use a documented pattern token to scope an override. For example:

```css
.booking-action {
  --uif-button-solid-container-background-default: var(--booking-action-background);
}
```

Define `--booking-action-background` in your application. Check the pattern's
token table for supported properties and set the related content and interaction
state tokens as needed. Check contrast in each brand and scheme you support.

## Scale

Typography uses fluid values generated from Scale endpoints. It responds to
viewport size; there is no `data-mode="min"` or `data-mode="max"` switch.

{{ foundation.next("/patterns/button/", "Explore Button tokens", "Find the properties for each variant and state.") }}
