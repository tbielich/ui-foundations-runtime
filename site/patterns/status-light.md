---
layout: layouts/docs.njk
title: Status Light
description: A visible label and decorative dot for a current condition.
navTitle: Status Light
order: 84
permalink: /patterns/status-light/
playgroundUrl: /patterns/status-light-playground/
playgroundLabel: Open Status Light Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero">
  <div class="docs-hero-preview">
    <div class="docs-hero-preview-controls">
      <span class="docs-hero-switch" data-hero-group="brand">
        <button type="button" data-hero-brand="a" aria-pressed="true">Brand A</button>
        <button type="button" data-hero-brand="b" aria-pressed="false">Brand B</button>
        <button type="button" data-hero-brand="c" aria-pressed="false">Brand C</button>
      </span>
      <span class="docs-hero-switch" data-hero-group="mode">
        <button type="button" data-hero-mode="light" aria-pressed="true">Light</button>
        <button type="button" data-hero-mode="dark" aria-pressed="false">Dark</button>
      </span>
    </div>
    <div class="docs-hero-preview-stage"><div style="inline-size: 100%;">{{ uif.statusLight("Online", variant="positive") }}</div></div>
  </div>
  <div class="docs-hero-meta">
    <a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a>
  </div>
</div>

A Status Light pairs a small indicator with a named condition, such as Online or Unavailable. Use [Badge](/patterns/badge/) for a compact category or count.


<h2 id="anatomy">Anatomy</h2>

<div class="docs-anatomy">
  <div class="docs-anatomy-preview"><div class="docs-anatomy-subject"><span class="docs-anatomy-outline"></span><span class="docs-anatomy-callout" data-dir="top" style="left: 6%; transform: translateX(-50%);"><span class="docs-anatomy-badge">1</span><span class="docs-anatomy-callout-line"></span></span><span class="docs-anatomy-callout" data-dir="top" style="left: 70%; transform: translateX(-50%);"><span class="docs-anatomy-badge">2</span><span class="docs-anatomy-callout-line"></span></span>{{ uif.statusLight("Online", variant="positive") }}</div></div>
  <ol class="docs-anatomy-footnotes">
    <li><span class="docs-anatomy-badge-inline">1</span> Indicator — a decorative colored dot with a discernible outline.</li>
    <li><span class="docs-anatomy-badge-inline">2</span> Label — visible text that communicates the condition without relying on color.</li>
  </ol>
</div>


<h2 id="options">Options</h2>

### Variants

<div class="docs-states-grid" style="--docs-states-cols: 3">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.statusLight("Unknown", variant="neutral") }}</div><span class="docs-states-grid-item-label">Unknown</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.statusLight("Online", variant="positive") }}</div><span class="docs-states-grid-item-label">Online</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.statusLight("Unavailable", variant="negative") }}</div><span class="docs-states-grid-item-label">Unavailable</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.statusLight("Pending", variant="notice") }}</div><span class="docs-states-grid-item-label">Pending</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.statusLight("Information", variant="info") }}</div><span class="docs-states-grid-item-label">Information</span></div>
</div>

Variants select an appearance; they do not infer meaning from the label. Choose the variant and wording together. The implementation does not add alert or live-region semantics.

### Sizes

<div class="docs-states-grid" style="--docs-states-cols: 2">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.statusLight("Online", variant="positive") }}</div><span class="docs-states-grid-item-label">Medium · default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.statusLight("Online", variant="positive", size="sm") }}</div><span class="docs-states-grid-item-label">Small</span></div>
</div>

### Table of options

<div class="docs-table-wrap">
<table class="docs-options-table">
  <thead><tr><th>Custom Element</th><th>Nunjucks</th><th>Values and defaults</th></tr></thead>
  <tbody>
    <tr><td><code>text content</code></td><td><code>text</code></td><td>The initial text. Required macro argument; empty when omitted from the Custom Element.</td></tr>
    <tr><td><code>label</code></td><td><code>text</code></td><td>Optional Custom Element text override. Removing the attribute restores the initial text. The macro receives its text directly.</td></tr>
    <tr><td><code>variant</code></td><td><code>variant</code></td><td><code>neutral</code> (default), <code>positive</code>, <code>negative</code>, <code>notice</code>, <code>info</code>. Unsupported values fall back to neutral.</td></tr>
    <tr><td><code>size</code></td><td><code>size</code></td><td><code>md</code> (default) or <code>sm</code>. Unsupported values use medium.</td></tr>
  </tbody>
</table>
</div>


<h2 id="behaviors">Behaviors</h2>

<div class="docs-behavior-list">
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;">{{ uif.statusLight("Online", variant="positive") }}</div><div class="docs-behavior-body"><h3>Read-only condition</h3><p>The indicator has no action, selection or keyboard focus. Place any related action in a separate button or link.</p></div></div>
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;">{{ uif.statusLight("Unavailable", variant="negative") }}</div><div class="docs-behavior-body"><h3>Attribute updates</h3><p>Changes to label, variant or size update the rendered condition. Variant and size changes preserve the text; reconnecting does not create nested indicators.</p></div></div>
</div>


<h2 id="usage-guidelines">Usage guidelines</h2>

<div class="docs-guideline">
  <div class="docs-guideline-item" data-type="do"><div class="docs-guideline-preview" style="inline-size: 100%;">{{ uif.statusLight("Online", variant="positive") }}</div><div class="docs-guideline-body"><p class="docs-guideline-label">Do</p><p>Name the condition explicitly. The label remains understandable when the dot color cannot be distinguished.</p></div></div>
  <div class="docs-guideline-item" data-type="dont"><div class="docs-guideline-preview" style="inline-size: 100%;"><span class="uif-status-light"><span class="uif-status-light-indicator" aria-hidden="true"></span></span></div><div class="docs-guideline-body"><p class="docs-guideline-label">Don't</p><p>Do not use an unlabeled dot as the only indication of status.</p></div></div>
</div>

Use a stable position near the item it describes. Keep category labels and actionable controls separate from the condition.


<h2 id="content-standards">Content standards</h2>

- Use short condition names in sentence case, such as “Online”, “Pending review” or “Unavailable”.
- Describe the current condition; put causes and recovery instructions in nearby content.
- Provide localized text. The component does not translate labels.


<h2 id="keyboard-interactions">Keyboard interactions</h2>

Status Light has no keyboard commands and does not enter the tab order. Any related action needs its own focusable control.


<h2 id="accessibility">Accessibility</h2>

- The label provides the meaning. The dot has <code>aria-hidden="true"</code>.
- No interactive role or live-region behavior is added automatically.
- If a background update must be announced, update a surrounding status region with suitable <code>aria-live</code> behavior. Avoid repeated or unnecessary announcements.
- Keep the label visible; color alone must not communicate the condition.


<h2 id="implementation">Implementation</h2>

Import the individual module once, or use the aggregate <code>ui-foundations/elements</code> entry.

```js
{% raw %}
import "ui-foundations/elements/ui-status-light";
{% endraw %}
```

```html
{% raw %}
<uif-status-light id="connection-status" variant="positive">Online</uif-status-light>
{% endraw %}
```

```js
{% raw %}
const status = document.querySelector("#connection-status");
status.setAttribute("label", "Unavailable");
status.setAttribute("variant", "negative");
{% endraw %}
```

For static HTML without Custom Element JavaScript, use the macro:

```njk
{% raw %}
{% import "macros/ui.njk" as uif %}
{{ uif.statusLight("Online", variant="positive", size="sm") }}
{% endraw %}
```

The macro emits <code>.uif-status-light</code>, <code>.uif-status-light-indicator</code> and <code>.uif-status-light-text</code> spans. Text is escaped; arbitrary HTML children are not part of the text API.


<h2 id="theming">Theming</h2>

Use the brand and mode switches in the preview above. Visual values come from the pattern's <code>--uif-status-light-*</code> slots and existing Semantic roles. Labels use semantic content color. An inward outline keeps colored markers or fills discernible across light and dark surfaces.

Set <code>data-brand="a"</code>, <code>"b"</code> or <code>"c"</code> and <code>data-mode="light"</code> or <code>"dark"</code> on the root element. Consumers own activation of these contexts. See [Design Tokens](/foundations/design-tokens/).


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/status-light.css" %}


<h2 id="design-checklist">Design checklist</h2>

<div class="docs-checklist">
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Runtime and examples</strong><span>CSS, Custom Element, static macro and playground are implemented.</span></div></div>
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Bounded browser checks</strong><span>Updates, semantics and text/visible-boundary contrast checked across three brands and two modes.</span></div></div>
  <div class="docs-checklist-item" data-done="false"><div class="docs-checklist-icon">○</div><div class="docs-checklist-text"><strong>Figma parity and Code Connect</strong><span>Live source access is unavailable. Design parity is unverified and mapping examples are inactive.</span></div></div>
</div>

The browser checks cover specific Runtime behavior and contrast pairs; they do not certify complete accessibility or live design parity.
