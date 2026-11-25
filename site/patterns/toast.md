---
layout: layouts/docs.njk
title: Toast
description: Transient feedback that announces an action result without moving focus.
navTitle: Toast
order: 87
permalink: /patterns/toast/
playgroundUrl: /patterns/toast-playground/
playgroundLabel: Open Toast Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import preview %}

<div class="docs-hero">
  {% call preview(scale=true, stageStyle="min-block-size: 14rem; position: relative;") %}{% call uif.toastRegion(label="Notifications") %}{{ uif.toast(message="Your booking was saved.", variant="success", duration=0, actionLabel="Undo") }}{% endcall %}{% endcall %}
  <div class="docs-hero-meta"><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div>
</div>

A Toast reports a short action result without interrupting the current task. Toasts appear in a labelled region, stack in DOM order and never move focus when they appear. Use [Inline Alert](/patterns/inline-alert/) when a message must remain beside related content.

<h2 id="options">Options</h2>

<div class="docs-table-wrap" role="region" aria-label="Toast options" tabindex="0">

| Custom Element | Nunjucks | Values and defaults |
|---|---|---|
| `variant` | `variant` | `info` (default), `success`, `warning`, `error`. The icon and text provide cues in addition to color. |
| `message` | `message` | Required notification text. Initial text content is a Custom Element fallback. |
| `duration` | `duration` | Auto-dismiss delay in milliseconds. Default: `5000`. Use `0` for persistent feedback. |
| `urgency` | `urgency` | `polite` by default; `error` defaults to `assertive`. Set explicitly only when the message needs immediate announcement. |
| `action-label` | `actionLabel` | Optional action button. Activation dispatches `uif-action`; it does not dismiss the toast. |
| `dismiss-label` | `dismissLabel` | Accessible dismiss button label. Default: “Dismiss notification”. |
| region `position` | `position` | `top-end` (default), `top-start`, `bottom-end`, `bottom-start`. |

</div>

<h2 id="behavior">Behavior</h2>

- The timer pauses while the pointer is over a toast or focus is within it, then resumes with the remaining time. This prevents time pressure while a user reads or operates its controls.
- Dismissal dispatches `uif-dismiss` with `detail.reason`: `dismiss`, `timeout` or `programmatic`.
- The region is a named `role="region"`, not a live region. Each toast owns one atomic announcement: `status`/`polite`, or `alert`/`assertive` for urgent feedback. This avoids duplicate output.
- New toasts do not receive focus. If a user dismisses a focused toast, focus moves to the next available control outside the toast, or the previous control when no next control exists.
- Entry and exit animations are disabled when `prefers-reduced-motion: reduce` is active.

<h2 id="keyboard-interactions">Keyboard interactions</h2>

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Moves through the optional action and dismiss button without moving focus to the toast itself. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused action or dismiss button. |

<h2 id="accessibility">Accessibility</h2>

The implementation uses text and an icon rather than color alone, preserves visible focus in forced-colors mode and keeps controls at least 24 CSS pixels in both dimensions. At 320 CSS pixels and 200% text size, the stack remains within the viewport and messages wrap. Automated browser evidence covers role, name, urgency, timer pausing, keyboard dismissal, focus continuity, forced colors, reduced motion, reflow and axe checks. It does not claim manual screen-reader certification.

Use assertive announcements sparingly. Do not auto-dismiss information that users must copy, compare or act on under time pressure; set `duration="0"` instead.

<h2 id="implementation">Implementation</h2>

```js
import "ui-foundations/elements/ui-toast";
```

```html
<uif-toast-region label="Notifications" position="top-end">
  <uif-toast variant="success" message="Your booking was saved." duration="5000" action-label="Undo"></uif-toast>
</uif-toast-region>
```

```njk
{% raw %}
{% call uif.toastRegion(label="Notifications") %}
  {{ uif.toast(message="Your booking was saved.", variant="success", duration=5000, actionLabel="Undo") }}
{% endcall %}
{% endraw %}
```

The Nunjucks macros emit static semantic HTML. Use the Custom Elements when you need timers, pause/resume, events and dismissal behavior; do not hydrate macro output as a second Toast instance.

<h2 id="theming">Theming</h2>

Authored `--uif-toast-*` slots use existing semantic and Inline Alert pattern roles for surfaces, borders, content, spacing and focus. No new token source or dependency is added.

<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/toast.css" %}

<h2 id="design-follow-up">Design follow-up</h2>

Live Figma component and token reconciliation, real component identity verification and Code Connect publication are deferred. No Figma node or property ID is claimed by this implementation.
