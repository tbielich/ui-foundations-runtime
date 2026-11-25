---
layout: layouts/docs.njk
title: Search Field
description: A labelled native search input with clear and search actions.
navTitle: Search Field
order: 95
permalink: /patterns/search-field/
playgroundUrl: /patterns/search-field-playground/
playgroundLabel: Open Search Field Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.searchField(label="Search holidays", id="search-doc", name="query", value="Mallorca") }}</div></div><div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

<script type="module" src="/vendor/ui-foundations/components/input-controls.js"></script>

## Behavior

`<uif-search-field>` keeps a visible label and native `type="search"` input. Enter retains ancestor-form submission and also dispatches `uif-search` with `{ query }`. The clear button is enabled only when a value exists; clearing emits bubbling native `input` and `change` events, then returns focus to the input. `quiet` removes the enclosing surface without removing the focus border. Macro output gets the same clear behavior from `ui-foundations/behaviors/input-controls`.

## Accessibility

The search icon is decorative. The clear button name includes the field label, remains a keyboard target while enabled, and is hidden from sequential focus only when disabled. Native form naming, disabled behavior, text editing, voice-input naming, browser validation and Enter submission remain intact. At narrow widths the input can shrink without clipping its controls; forced-colors mode restores a system border.

## API

Attributes: `label`, `name`, `value`, `placeholder`, `disabled`, `quiet`, and `clear-label`. The `value` property reads the current input value. Use a `form` with an appropriate submit button when search submission must work without JavaScript.

The `uif.searchField` Nunjucks macro requires a non-empty, caller-owned `id` as its first argument. Give every rendered instance a unique ID. Calls that previously relied on the `search-field` default must migrate to an explicit value, for example `uif.searchField("holiday-search", label="Search holidays")`; missing or empty IDs emit no control.

Live Figma component/token reconciliation and Code Connect publication for issue #48 are deferred. No Figma identifier is recorded by this technical implementation.
