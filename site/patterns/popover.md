---
layout: layouts/docs.njk
title: Popover
description: A labelled floating panel bound to a trigger, with viewport-aware placement and predictable focus.
navTitle: Popover
order: 89
permalink: /patterns/popover/
playgroundUrl: /patterns/popover-playground/
playgroundLabel: Open Popover Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import preview %}

<div class="docs-hero">
  {% call preview(scale=true) %}{% call uif.popover(triggerId="popover-docs-trigger", triggerLabel="Show booking details", label="Booking details", placement="bottom") %}<p>Your fare can be changed before departure.</p><a href="#implementation">Review implementation</a>{% endcall %}{% endcall %}
  <div class="docs-hero-meta"><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div>
</div>

A Popover presents supplementary interactive content next to a trigger. It is non-modal: the rest of the page remains available, and outside interaction closes the panel.

<h2 id="options">Options</h2>

| Custom Element | Nunjucks | Values and defaults |
|---|---|---|
| `trigger` | `triggerId` | ID of the trigger element. The component synchronizes `aria-controls`, `aria-expanded` and `aria-haspopup="dialog"`. |
| `label` | `label` | Required accessible name for the dialog panel. |
| `placement` | `placement` | Preferred `top`, `bottom`, `left` or `right`; default `bottom`. The panel flips when the opposite side has more usable space. |
| `open` | `open` | Shows the panel. Trigger activation toggles this state. |

Add `data-uif-popover-close` to a control inside the panel when the content needs an explicit close action.

<h2 id="behavior">Behavior</h2>

- Opening places the fixed panel within the viewport, updates trigger state and moves focus to the first interactive descendant. If there is no interactive content, the labelled panel receives focus.
- <kbd>Escape</kbd>, trigger reactivation and an explicit close control close the panel and return focus to the trigger.
- Pointer interaction outside closes the panel without overriding the destination that the user selected.
- Resize, scroll and element-size changes recalculate placement. Disconnecting the component removes trigger, document, viewport and observer listeners.
- The decorative arrow follows the resolved placement and remains visible in forced-colors mode.

<h2 id="keyboard-interactions">Keyboard interactions</h2>

| Key | Action |
|---|---|
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the trigger and opens or closes the panel. |
| <kbd>Tab</kbd> | Moves through interactive content, then continues into the document because the popover is non-modal. |
| <kbd>Escape</kbd> | Closes the panel and returns focus to its trigger. |

<h2 id="accessibility">Accessibility</h2>

The trigger remains programmatically related to a labelled `role="dialog"`. Focus entry and return are deterministic for keyboard and screen-reader users. The panel wraps at 320 CSS pixels and 200% text size, uses system-visible borders in forced-colors mode and does not require animation. Browser evidence covers name, role, state, focus, Escape, outside dismissal, auto-flip, reflow and axe checks. It does not claim manual screen-reader certification.

Do not use Popover for blocking decisions or long workflows; use [Dialog](/patterns/dialog/) when focus must remain inside a modal surface. Do not place a Popover trigger inside another interactive control.

<h2 id="implementation">Implementation</h2>

```js
import "ui-foundations/elements/ui-popover";
```

```html
<button id="booking-details-trigger" type="button">Show booking details</button>
<uif-popover trigger="booking-details-trigger" label="Booking details" placement="bottom">
  <a href="/fare-conditions">Review fare conditions</a>
  <button type="button" data-uif-popover-close>Close details</button>
</uif-popover>
```

```njk
{% raw %}
{% call uif.popover(triggerId="booking-details-trigger", triggerLabel="Show booking details", label="Booking details") %}
  <a href="/fare-conditions">Review fare conditions</a>
{% endcall %}
{% endraw %}
```

<h2 id="theming">Theming</h2>

Authored `--uif-popover-*` slots use existing semantic surface, content, border, radius and spacing values. No new token source or dependency is added.

<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/popover.css" %}

<h2 id="design-follow-up">Design follow-up</h2>

Live Figma component and token reconciliation, real component identity verification and Code Connect publication are deferred. No Figma node or property ID is claimed by this implementation.
