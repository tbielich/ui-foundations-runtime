---
layout: layouts/docs.njk
title: Range Slider
description: Two labelled native range inputs for a bounded interval.
navTitle: Range Slider
order: 101
permalink: /patterns/range-slider/
playgroundUrl: /patterns/range-slider-playground/
playgroundLabel: Open Range Slider Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import preview %}

<div class="docs-hero">{% call preview(scale=true) %}{{ uif.rangeSlider(label="Price range", id="price-doc", min=0, max=2000, step=50, lower=300, upper=1200) }}{% endcall %}<div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

<script type="module" src="/vendor/ui-foundations/components/input-controls.js"></script>

## Behavior

`<uif-range-slider>` renders two native `type="range"` inputs over one visual track. `min`, `max` and `step` apply to both controls and default to `0`, `100`, and `1`. Missing, empty, invalid, and non-finite numeric attributes use their documented defaults; a non-positive step also falls back to `1`. The lower value cannot move above the upper value, and the upper value cannot move below the lower value. Native Arrow, Page Up/Down, Home and End behavior remains available. Native `input` and `change` events bubble; `uif-change` reports `{ lower, upper }`. Macro output gets the same constraint, visible-value, and fill synchronization from `ui-foundations/behaviors/input-controls`.

## Accessibility

A fieldset legend names the interval, while visible Minimum and Maximum labels name each thumb. Current numbers appear next to those labels and in `aria-valuetext`. Invalid state combines a thicker border with connected error text. The track, fill, thumbs and focus indicator remain visible in forced colors. Active and value-aware stacking keeps overlapping thumbs reachable by pointer; either visible label can focus and raise its corresponding thumb before dragging. Keyboard order remains Minimum, then Maximum. Both controls remain keyboard-operable at 200% text and narrow widths.

## API

Attributes: `label`, `min-label`, `max-label`, `min`, `max`, `step`, `lower`, `upper`, `lower-name`, `upper-name`, `disabled`, `invalid`, and `error`. The `value` property returns `{ lower, upper }`.

The `uif.rangeSlider` Nunjucks macro requires a non-empty, caller-owned `id` as its first argument. Give every rendered instance a unique ID. Calls that relied on the former `range-slider` default must pass an explicit value, for example `uif.rangeSlider("price-range", label="Price range")`; missing or empty IDs emit no control.

Live Figma component/token reconciliation and Code Connect publication for issue #63 are deferred. No Figma identifier is recorded by this technical implementation.
