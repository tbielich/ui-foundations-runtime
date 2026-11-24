---
layout: layouts/docs.njk
title: Number Field
description: A native numeric input with clamped step controls and formatted output.
navTitle: Number Field
order: 97
permalink: /patterns/number-field/
playgroundUrl: /patterns/number-field-playground/
playgroundLabel: Open Number Field Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.numberField(label="Holiday budget", id="budget-doc", value=500, min=0, max=5000, step=50) }}</div></div><div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

## Behavior

`<uif-number-field>` uses `input type="number"`; Arrow keys, validity and mobile numeric entry remain browser-owned. Step buttons call `stepUp()` or `stepDown()`, clamp to `min` and `max`, and emit native `input` and `change` plus `uif-change`. `readonly` leaves the value focusable while disabling both steppers. `invalid` and `error` connect visible error text with `aria-describedby`.

`format="currency"` uses `Intl.NumberFormat` with `currency` and `locale`. `format="percent"` displays an editable value of `25` as a locale-formatted 25%. Formatting is output text and `aria-valuetext`; it never replaces the numeric value used by min, max, step or form submission. The Custom Element and Nunjucks macro both default to `value=0`, `step=1`, `format="decimal"`, `currency="EUR"`, and `locale="en"`. Numeric strings are normalized. An invalid value leaves the input empty and displays “No value”; invalid `min` or `max` values are omitted, and an invalid or non-positive `step` falls back to `1`.

## Accessibility

The visible label names the native input. Stepper names include that label. Error state has a border change and text, so color is not the only cue. Controls retain keyboard, pointer and touch parity, system-color borders and a minimum target size.

## API

Attributes: `label`, `name`, `value`, `min`, `max`, `step`, `disabled`, `readonly`, `invalid`, `error`, `format="decimal|currency|percent"`, `currency`, and `locale`. `valueAsNumber` exposes the current numeric value.

Live Figma component/token reconciliation and Code Connect publication for issue #49 are deferred. No Figma identifier is recorded by this technical implementation.
