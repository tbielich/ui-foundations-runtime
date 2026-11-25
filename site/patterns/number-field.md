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
{% from "macros/component-docs.njk" import preview %}

<div class="docs-hero">{% call preview(scale=true) %}{{ uif.numberField(label="Holiday budget", id="budget-doc", value=500, min=0, max=5000, step=50) }}{% endcall %}<div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

<script type="module" src="/vendor/ui-foundations/components/input-controls.js"></script>

## Behavior

`<uif-number-field>` uses `input type="number"`; Arrow keys, validity and mobile numeric entry remain browser-owned. Step buttons call `stepUp()` or `stepDown()`, clamp to `min` and `max`, and emit native `input` and `change` plus `uif-change`. `readonly` leaves the value focusable while disabling both steppers. `invalid` and `error` connect visible error text with `aria-describedby`. Macro output gets the same stepping and formatting behavior from `ui-foundations/behaviors/input-controls`.

`format="currency"` uses `Intl.NumberFormat` with `currency` and `locale`. `format="percent"` displays an editable value of `25` as a locale-formatted 25%. Formatting is output text and `aria-valuetext`; it never replaces the numeric value used by min, max, step or form submission. The Custom Element and Nunjucks macro both default to `value=0`, `step=1`, `format="decimal"`, `currency="EUR"`, and `locale="en"`. Empty or malformed locales also fall back to `en` without interrupting rendering. Numeric strings are normalized. An invalid value leaves the input empty and displays “No value”; invalid `min` or `max` values are omitted, and an invalid or non-positive `step` falls back to `1`.

## Accessibility

The visible label names the native input. Stepper names include that label. Error state has a border change and text, so color is not the only cue. Controls retain keyboard, pointer and touch parity, system-color borders and a minimum target size.

## API

Attributes: `label`, `name`, `value`, `min`, `max`, `step`, `disabled`, `readonly`, `invalid`, `error`, `format="decimal|currency|percent"`, `currency`, and `locale`. `valueAsNumber` exposes the current numeric value.

The `uif.numberField` Nunjucks macro requires a non-empty, caller-owned `id` as its first argument. Give every rendered instance a unique ID. Calls that relied on the former `number-field` default must pass an explicit value, for example `uif.numberField("booking-budget", label="Budget")`; missing or empty IDs emit no control.

Live Figma component/token reconciliation and Code Connect publication for issue #49 are deferred. No Figma identifier is recorded by this technical implementation.
