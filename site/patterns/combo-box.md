---
layout: layouts/docs.njk
title: ComboBox
description: An editable text field with filtered, custom or asynchronously updated suggestions.
navTitle: ComboBox
order: 103
permalink: /patterns/combo-box/
playgroundUrl: /patterns/combo-box-playground/
playgroundLabel: Open ComboBox Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.comboBox(id="destination-combo", label="Destination", name="destination", value="pmi", options=[{value: "pmi", textValue: "Palma de Mallorca", label: "Palma de Mallorca — PMI"}, {value: "tfs", textValue: "Tenerife", label: "Tenerife — TFS"}, {value: "lpa", textValue: "Gran Canaria", label: "Gran Canaria — LPA"}]) }}</div></div><div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

<script type="module" src="/vendor/ui-foundations/elements/ui-combo-box.js"></script>

## Behavior

`<uif-combo-box>` uses an editable input with `role="combobox"` and a separate `role="listbox"`. Text input filters local options by their `text-value`. The committed `value` can differ from the visible option text and is submitted through a hidden input when `name` is present. A native form reset restores the initial visible text, submitted and reflected value, selected option, and closed popup state. Set the `options` property to replace results asynchronously; the current query, active option when still available, focus and committed value remain stable. Use `loading` while fetching and remove it after updating `options`. `error`, `empty-message`, `loading-message` and `error-message` provide distinct perceivable states.

Arrow Up and Arrow Down move through enabled suggestions; Home and End move to the first or last suggestion; Enter commits the active option; Escape closes the popup; Tab closes it without changing the value. Pointer selection returns focus to the input. Typing emits the native bubbling `input` event. A commit emits native bubbling `input` and `change` events plus `uif-selection` with `{ value, textValue, freeform }`. Outside interaction dismisses the popup.

## Options and free-form values

Author options as `<uif-combo-box-option value="pmi" text-value="Palma de Mallorca">…custom content…</uif-combo-box-option>`. `text-value` supplies filtering and the input's committed text independently of the rendered content. In JavaScript, assign objects shaped as `{ value, textValue, label, disabled }` to `options`.

Without `freeform`, only a real enabled option can commit. With `freeform`, Enter can commit the authored query when no option is active. `readonly` keeps the field and suggestions perceivable but prevents edits and commits; `disabled` removes the input from interaction and form submission.

## Accessibility

The visible label names the input. Focus stays on the input while `aria-activedescendant` identifies the active option; `aria-expanded`, `aria-controls`, `aria-selected`, `aria-disabled`, `aria-busy`, `aria-invalid` and `aria-readonly` expose state. Loading remains visibly available next to the field when the popup is closed and uses the same polite status region for announcements, rather than a second visually hidden status or an announcement for each local-filter keystroke. Empty and error text remains visible. When `invalid` is present without `error`, the component shows and programmatically associates “Select a valid option.” Provide a specific, action-oriented `error` whenever the validation cause is known. Selection is not communicated by color alone, and forced-colors styles preserve the active and selected cues. The fixed popup is clamped to the viewport and flips above the input when needed.

Automated browser and axe checks cover the implemented role, name, state, keyboard, pointer, loading, error, zoom and forced-colors behavior. They do not constitute manual screen-reader certification.

## API

Attributes: `label`, `name`, `value`, `placeholder`, `freeform`, `loading`, `disabled`, `readonly`, `invalid`, `error`, `empty-message`, `loading-message`, and `error-message`. Properties: `value`, read-only `query`, and `options`. Methods: `open()` and `close()`.

The `uif.comboBox` Nunjucks macro requires a non-empty caller-owned `id` and accepts `options` objects with `value`, `textValue`, `label`, and `disabled`. Every instance on a page needs a unique ID.

Live Figma component/token reconciliation and Code Connect publication for issue #64 are deferred. No Figma identifier is recorded by this technical implementation.
