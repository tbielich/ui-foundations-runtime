---
layout: layouts/docs.njk
title: DropZone
description: A native file picker enhanced with optional drag-and-drop.
navTitle: DropZone
order: 105
permalink: /patterns/drop-zone/
playgroundUrl: /patterns/drop-zone-playground/
playgroundLabel: Open DropZone Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.dropZone(id="travel-documents", label="Travel documents", name="documents", accept=".pdf,image/*", multiple=true) }}</div></div><div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

<script type="module" src="/vendor/ui-foundations/elements/ui-drop-zone.js"></script>

## Behavior

DropZone keeps a labelled native `input type="file"` and its visible “Choose files” control as the complete primary path. Drag-and-drop is an optional pointer enhancement over the same validation path. `accept` filters extensions, exact MIME types and MIME wildcards for both paths. Without `multiple`, the first accepted file is retained and later files receive a specific error. The filled state lists every accepted filename in text.

A successful picker or drop action emits `uif-files-selected` with `{ files, source }`, where `source` is `picker` or `drop`. A dropped selection also emits the native bubbling `change` event from the file input. The read-only `files` property returns the accepted files. A native form reset clears the filled and validation states.

DropZone only selects local files. It does not upload, read or send them, and its loading state means that the host application is processing a selection. Applications own any upload service, progress and cancellation behavior.

## Validation and states

Use `accept` and `multiple` instead of maintaining a second drag-only rule. Rejected filenames and the accepted rule are shown in a polite status. `error` supplies an application validation message; `invalid` without a message uses a generic recoverable prompt. `disabled` and `loading` disable the native input and ignore drop handling. `loading-message` defaults to “Processing files…”.

## Accessibility

The visible label names the group and the native file input. The button path provides full keyboard, voice-control and touch access without requiring a drag gesture. Focus remains on the native control, with a visible indicator on the associated button. Selected filenames, validation errors and loading state are text, not color-only cues. The target and button reflow at 320 CSS pixels and 200% text; forced-colors styles preserve borders, active-drop feedback and focus.

Automated Chromium and axe checks cover the implemented role, name, state, keyboard fallback, target size, zoom, forced-colors, picker/drop parity and reset behavior. They do not constitute manual screen-reader certification.

## API

Attributes: `label`, `description`, `button-label`, `name`, `accept`, `multiple`, `disabled`, `invalid`, `error`, `loading`, and `loading-message`. Property: read-only `files`. Event: `uif-files-selected`.

The `uif.dropZone` macro requires a non-empty caller-owned `id`. Every instance on a page needs a unique ID.

Live Figma component/token reconciliation and Code Connect publication for issue #57 are deferred. No Figma identifier is recorded by this technical implementation.
