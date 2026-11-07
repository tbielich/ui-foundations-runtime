---
layout: layouts/docs.njk
title: Class Naming
description: CSS class naming convention for ui-foundations components and patterns.
navTitle: Class Naming
order: 13
permalink: /foundations/class-naming/
---
{% import "macros/foundation-docs.njk" as foundation %}


{% call foundation.feature("Anatomy", "A name you can read.", "The root identifies the pattern. A separate class describes its state.") %}
<div class="foundation-selector" aria-label="Selector: uif calendar cell, is selected"><span>.uif-calendar-cell</span><span>.is-selected</span></div>
<dl class="foundation-key"><div><dt>Pattern</dt><dd>calendar</dd></div><div><dt>Part</dt><dd>cell</dd></div><div><dt>State</dt><dd>selected</dd></div></dl>
<p class="foundation-caption">Keep structure and state separate so each can be reused.</p>
{% endcall %}


## Convention

UI Foundations uses the `uif-` prefix for public pattern classes. Parts,
variants, and states follow the conventions below.

## Structure

```
.uif-component                 → root element
.uif-component-part            → structural child (compound with hyphen)
.uif-component-part.variant    → variant as modifier class
.uif-component.variant         → root-level variant
.uif-component.is-state        → state class (always .is- prefix)
```

## Rules

1. **Root class = `uif-` + component name**: `.uif-calendar`, `.uif-button`, `.uif-checkbox`
2. **Parts use hyphen-compound**: `.uif-calendar-header`, `.uif-calendar-cell`, `.uif-input-field`
3. **Variants are additional classes**: `.uif-button.ghost`, `.uif-badge.brand`, `.uif-divider.subtle`
4. **States use `.is-` prefix**: `.is-hover`, `.is-selected`, `.is-disabled`, `.is-today`
5. **No double-underscores** (`__`): use hyphen-compound instead
6. **No alternative namespace prefixes**: never `.ui-calendar`
7. **No BEM modifiers** (`--`): use multi-class instead (`.uif-button.ghost` not `.uif-button--ghost`)

## Examples

```css
/* Example: canonical */
.uif-calendar { }
.uif-calendar-header { }
.uif-calendar-cell { }
.uif-calendar-cell.is-selected { }
.uif-button.ghost { }
.uif-input-field { }

/* Example: invalid */
.uif-calendar__header { }        /* no double-underscore */
.uif-calendar-cell--selected { } /* no BEM modifier */
.ui-calendar { }             /* no alternative namespace */
.uif-button--ghost { }       /* use multi-class */
```

## Why This Convention

- **Readability**: `.uif-calendar-cell.is-selected` reads as plain English
- **Flat specificity**: all selectors stay at one or two class levels
- **Composable**: `.uif-button.ghost.uif-calendar-cell` — stack classes freely
- **Scannable**: in DevTools you see the full state without decoding
- **Aligned with tokens**: tokens use the same public prefix (`--uif-calendar-cell-background-hover`)

{{ foundation.next("/patterns/button/", "See it on Button", "Explore parts, variants, and states in a real pattern.") }}
