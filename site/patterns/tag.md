---
layout: layouts/docs.njk
title: Tag and Tag Group
description: Categorization labels with optional prefixes, removal and roving keyboard focus.
navTitle: Tag
order: 93
permalink: /patterns/tag/
playgroundUrl: /patterns/tag-playground/
playgroundLabel: Open Tag Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import preview %}

<div class="docs-hero">{% call preview(scale=true) %}{% call uif.tagGroup(label="Selected filters") %}{{ uif.tag("Family", removable=true, icon="user") }}{{ uif.tag("Beach", removable=true) }}{{ uif.tag("Breakfast included", removable=true) }}{% endcall %}{% endcall %}<div class="docs-hero-meta"><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

Tags label categories and filters. Prefix icons and avatars are decorative because the text remains the accessible label. Use `size="sm"` only for the local compact variant. Groups wrap by default; `overflow="scroll"` keeps one line with local scrolling.

<h2 id="keyboard">Keyboard interactions</h2>

| Key | Action |
|---|---|
| <kbd>Arrow Right</kbd> / <kbd>Arrow Down</kbd> | Moves to the next tag. |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Up</kbd> | Moves to the previous tag. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Moves to the first or last tag. |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Removes a removable tag and moves focus to the next tag, or the previous tag at the end. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused remove button. |

Removal dispatches bubbling `uif-remove` with `detail.label` and `detail.index`. Each button defaults to “Remove {label}”; use `remove-label` when that wording needs more context.

<h2 id="accessibility">Accessibility</h2>

TagGroup uses a named list and each tag is a list item. Roving focus keeps one group target in the Tab sequence while arrow keys provide local navigation. Buttons meet the repository 24 CSS pixel minimum, remain visible in forced colors and do not rely on color. Wrapped text remains available at 320 CSS pixels and 200% text.

<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/tag.css" %}

<h2 id="design-follow-up">Design follow-up</h2>

Live Figma Tag/TagGroup identities, properties and tokens plus Code Connect publication are deferred for issue #45. No Figma ID is claimed.
