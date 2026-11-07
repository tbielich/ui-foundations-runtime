---
layout: layouts/docs.njk
title: Getting Started
description: How to install and use UI Foundations in your project.
navTitle: Getting Started
order: 1
permalink: /getting-started/
---

UI Foundations is a token-first design system that provides CSS custom properties,
HTML component patterns, Nunjucks macros, and light-DOM Web Components. Tokens are
authored in Figma and generated into CSS, JSON, and TypeScript.

## Install

```bash
npm install ui-foundations
```

**Resources**

- [ui-foundations on npm](https://www.npmjs.com/package/ui-foundations)
- [Figma library](https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UI-Foundations)
- [Starter template](https://github.com/tbielich/ui-foundations-starter)

## CSS Setup

Import the full bundle for all tokens and components:

```css
@import "ui-foundations/core.css";
@import "ui-foundations/ui.css";
```

For individual token imports, use the exported package paths. Include the
styles and context variants your application needs; this subset alone does not
include the full pattern CSS or every brand and scheme:

```css
@import "ui-foundations/tokens/primitives.css";
@import "ui-foundations/tokens/brand-a.css";
@import "ui-foundations/tokens/color-light.css";
@import "ui-foundations/tokens/semantic.css";
@import "ui-foundations/tokens/components.css";
```

## Brand and Mode Switching

Set `data-brand` and `data-mode` on the root element to control theming at
runtime:

```html
<html data-brand="a" data-mode="light">
```

```js
const root = document.documentElement;
root.dataset.brand = "a"; // "a" | "b" | "c"
root.dataset.mode = "light"; // "light" | "dark"
```

## Using Components

Components are available as plain HTML classes, Nunjucks macros for static site
generation, and framework-agnostic Custom Elements.

### HTML

```html
<button class="uif-button solid" type="button">Label</button>
<label for="email">Email</label>
<input class="uif-input" id="email" name="email" type="email" autocomplete="email" />
<a href="/page" class="uif-link">Go to page</a>
```

### Nunjucks Macros

{% raw %}
```njk
{% import "macros/ui.njk" as uif %}

{{ uif.button("Label") }}
{{ uif.input(type="text", placeholder="Email") }}
{{ uif.link("Go to page", href="/page") }}
{{ uif.icon("search") }}
{{ uif.checkbox("Accept terms") }}
{{ uif.switch("Notifications") }}
```
{% endraw %}

### Web Components

```js
import "ui-foundations/elements/ui-button";
import "ui-foundations/elements/ui-input";
import "ui-foundations/elements/ui-icon";
```

```html
<uif-button>Label</uif-button>
<uif-input aria-label="Email" placeholder="Email"></uif-input>
<uif-icon name="search" decorative></uif-icon>
```

Custom Elements render into light DOM, so the package CSS, tokens, native
events, and form controls remain visible to consuming frameworks.

## Macro Reference

| Macro | Description |
|---|---|
| `uif.button(label, variant, disabled)` | Button — solid, outline, or ghost variant |
| `uif.buttonGroup(attached, orientation, justify, ariaLabel)` | Groups related buttons |
| `uif.input(type, placeholder, value, state, disabled)` | Text input field |
| `uif.checkbox(label, checked, disabled)` | Checkbox with visible label |
| `uif.radio(label, name, value, checked, disabled)` | Radio button with visible label |
| `uif.switch(label, checked, disabled)` | Toggle switch with visible label |
| `uif.icon(name, label)` | Icon rendered via CSS mask |
| `uif.labelContent(text, startIcon, endIcon, iconOnly)` | Label primitive with optional icons |
| `uif.fieldLabel(text, htmlFor, required, startIcon)` | Form field label with required indicator |
| `uif.link(text, href, startIcon, endIcon, state, disabled)` | Link with optional start and end icons |
| `uif.badge(text, variant, size, startIcon)` | Status badge with optional icon |

## Token Architecture

The token model follows **Core → Appearance → Semantics → Patterns**:

- Core holds reusable values such as palette steps and spacing.
- Appearance applies Brand, Scheme (light/dark), and Scale.
- Semantics names UI roles such as action surface and text content.
- Patterns apply those roles to individual controls.

See [Design Tokens](/foundations/design-tokens/) for the model and reference,
and [Theming](/foundations/theming/) for switching and customisation.

## Next steps

- Choose a [pattern](/patterns/) and follow its markup and API examples.
- Use [examples](/examples/) to compose controls into a flow.
- Read the [accessibility guidance](/foundations/accessibility/) before shipping.
- Review the [license](/license/) before adopting the package.
