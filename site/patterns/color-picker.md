---
layout: layouts/docs.njk
title: ColorPicker
description: A synchronized, dependency-free family of color selection controls.
navTitle: ColorPicker
order: 105
permalink: /patterns/color-picker/
playgroundUrl: /patterns/color-picker-playground/
playgroundLabel: Open ColorPicker Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import preview %}

<div class="docs-hero">{% call preview(scale=true) %}{{ uif.colorPicker(id="brand-color", label="Brand color", name="brandColor", value="#0066CC") }}{% endcall %}<div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

<script type="module" src="/vendor/ui-foundations/elements/ui-color-picker.js"></script>

## Behavior

`<uif-color-picker>` keeps one canonical RGBA value synchronized across separate saturation and brightness range controls in a shared visual area, hue and alpha sliders, a hue wheel, a named preview, Hex/RGB/HSL fields, and a swatch grid. The reflected `value` and optional named hidden input use uppercase Hex, including alpha when opacity is below 100%. Native form reset restores the initial value and its hue, saturation, and brightness axes.

Pointer interaction updates both area axes and the wheel continuously. The separate saturation and brightness controls use native range keyboard behavior, including Arrow keys, Page Up/Page Down, Home, and End. The wheel provides the same keys for hue, while the labelled hue and opacity ranges provide familiar alternative paths. The swatch grid uses roving focus with Arrow keys, Home, and End. Selection is shown with a check mark and `aria-selected`, not color alone.

Hue remains available when saturation is zero, while hue and saturation remain available when brightness is zero. This latent HSVA state lets later saturation or brightness changes continue from the user's last meaningful axes even though Hex and RGB correctly represent the visible gray or black. Chromatic text, property, and swatch values establish new axes; achromatic external values preserve axes that the resulting RGB color cannot define. Alpha remains independent, and form reset restores the initial axes.

Valid text edits clamp RGB channels, HSL percentages, and alpha while wrapping hue. Invalid text stays in the edited field, preserves the last valid color, sets `aria-invalid`, and shows a format-specific error. A valid edit clears the error and synchronizes every representation. User changes emit bubbling `input` and `change` events from the ColorPicker without feeding the generated field updates back into the model.

## Accessibility

Every interactive surface has an explicit label and current value. Saturation and brightness are exposed as two separately labelled native range controls within the shared visual area; the wheel and labelled hue and opacity ranges expose their own numeric values. The preview is named with the current Hex value and opacity. Error text is visible and programmatically associated with every control. `disabled`, `readonly`, and `invalid` states are exposed without removing the visible explanation. Touch targets are at least the semantic target size, the layout reflows at 320px and 200% text, forced-colors mode preserves borders, focus markers, and the non-color selection check, and motion is not required.

Automated browser and axe checks cover implemented keyboard, pointer, state, zoom, forced-colors, and semantic behavior. They do not constitute manual screen-reader certification.

## API

Attributes: `label`, `name`, `value`, `swatches`, `disabled`, `readonly`, `invalid`, and `error`. Property: `value`; `color` returns a copy of canonical `{ r, g, b, a }`; `swatches` accepts `{ value, label }` objects. The `uif.colorPicker` Nunjucks macro requires a unique caller-owned `id`.

Live Figma component/token reconciliation and Code Connect publication for issue #56 are deferred. No Figma identifier is recorded by this technical implementation.
