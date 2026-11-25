---
layout: layouts/docs.njk
title: Segmented Control
description: A compact native radio group for one selection.
navTitle: Segmented Control
order: 99
permalink: /patterns/segmented-control/
playgroundUrl: /patterns/segmented-control-playground/
playgroundLabel: Open Segmented Control Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import preview %}
{% set viewOptions = [{ value: "list", label: "List", icon: "list" }, { value: "grid", label: "Grid", icon: "view" }, { value: "map", label: "Map", icon: "location" }] %}

<div class="docs-hero">{% call preview(scale=true) %}{{ uif.segmentedControl(label="Results view", name="view-doc", value="list", options=viewOptions) }}{% endcall %}<div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

## Behavior

`<uif-segmented-control>` renders a labelled `fieldset` of same-name native radio inputs. Browser radio behavior provides one selection and Arrow-key navigation. Options are authored as direct children with `data-value`, `data-label`, optional `data-icon`, and optional `data-disabled`. The `options` property accepts the equivalent `{ value, label, icon?, disabled? }[]` data when options change after connection. A selection emits the native `change` event and `uif-change` with `{ value }`.

A missing or unknown value, or a value that names a disabled option, selects the first enabled option in document order. If every option is disabled or no options exist, no radio is checked. Replacing `options` keeps the current enabled selection when possible and otherwise applies the same fallback. Changing the group-level `disabled` attribute keeps the selection.

## Accessibility

The legend names the group. Each visible icon is decorative because the adjacent text is the option name. Checked state uses native radio state plus weight, inset indicator and forced-color outline; color is not the only cue. Disabled options remain programmatically disabled. Sizes `sm`, `md` and `lg` preserve the minimum target size. Indicator transitions stop when reduced motion is requested.

## API

Attributes: `label`, `name`, `value`, `size="sm|md|lg"`, and `disabled`. The `value` property returns the checked radio value. The `uif.segmentedControl` macro requires a non-empty, caller-owned `name`; every independent group under the same form owner must use a different name. Missing or empty names emit no control. The Custom Element derives an instance-local name when its `name` attribute is omitted.

Live Figma component/token reconciliation and Code Connect publication for issue #60 are deferred. No Figma identifier is recorded by this technical implementation.
