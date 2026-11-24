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

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.rangeSlider(label="Price range", id="price-doc", min=0, max=2000, step=50, lower=300, upper=1200) }}</div></div><div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

## Behavior

`<uif-range-slider>` renders two native `type="range"` inputs over one visual track. `min`, `max` and `step` apply to both controls. The lower value cannot move above the upper value, and the upper value cannot move below the lower value. Native Arrow, Page Up/Down, Home and End behavior remains available. Native `input` and `change` events bubble; `uif-change` reports `{ lower, upper }`.

## Accessibility

A fieldset legend names the interval, while visible Minimum and Maximum labels name each thumb. Current numbers appear next to those labels and in `aria-valuetext`. Invalid state combines a thicker border with connected error text. The track, fill, thumbs and focus indicator remain visible in forced colors. Both controls remain keyboard-operable at 200% text and narrow widths.

## API

Attributes: `label`, `min-label`, `max-label`, `min`, `max`, `step`, `lower`, `upper`, `lower-name`, `upper-name`, `disabled`, `invalid`, and `error`. The `value` property returns `{ lower, upper }`.

Live Figma component/token reconciliation and Code Connect publication for issue #63 are deferred. No Figma identifier is recorded by this technical implementation.
