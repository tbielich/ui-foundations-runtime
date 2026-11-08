---
layout: layouts/docs.njk
title: Inline Alert
description: An inline contextual message that communicates status, confirmation, warning, or error within the content flow without blocking the page.
navTitle: Inline Alert
order: 85
permalink: /patterns/inline-alert/
playgroundUrl: /patterns/inline-alert-playground/
playgroundLabel: Open Inline Alert Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import scaleSwitch %}

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
      {{ scaleSwitch() }}
    </div>
    <div class="docs-hero-preview-stage"><div style="display: flex; flex-direction: column; gap: 0.75rem; inline-size: 100%;">{{ uif.inlineAlert(title="Information", description="Here is some helpful context for this situation.", variant="info") }}{{ uif.inlineAlert(title="Changes saved", description="Your updates were stored successfully.", variant="positive") }}</div></div>
  </div>
  <div class="docs-hero-meta">
    <a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a>
  </div>
</div>

An Inline Alert places a short, contextual message next to the content it relates to. Use it for status, confirmation, warnings, and errors that do not need to interrupt the user. For transient or stacked system messages, use a toast or notification pattern instead; for blocking confirmation, use [Dialog](/patterns/dialog/).


<h2 id="anatomy">Anatomy</h2>

<div class="docs-anatomy">
  <div class="docs-anatomy-preview">
    <div class="docs-anatomy-subject">
      <span class="docs-anatomy-outline"></span>
      <span class="docs-anatomy-callout" data-dir="top" style="left: 8%; transform: translateX(-50%);"><span class="docs-anatomy-badge">1</span><span class="docs-anatomy-callout-line"></span></span>
      <span class="docs-anatomy-callout" data-dir="top" style="left: 45%; transform: translateX(-50%);"><span class="docs-anatomy-badge">2</span><span class="docs-anatomy-callout-line"></span></span>
      <span class="docs-anatomy-callout" data-dir="top" style="left: 92%; transform: translateX(-50%);"><span class="docs-anatomy-badge">3</span><span class="docs-anatomy-callout-line"></span></span>
      {{ uif.inlineAlert(title="Title", description="Description text goes here.", variant="info", dismissible=true) }}
    </div>
  </div>
  <ol class="docs-anatomy-footnotes">
    <li><span class="docs-anatomy-badge-inline">1</span> Icon — a decorative indicator chosen from the variant; provides a second cue alongside color.</li>
    <li><span class="docs-anatomy-badge-inline">2</span> Content — a title and an optional description.</li>
    <li><span class="docs-anatomy-badge-inline">3</span> Dismiss button — optional; hides the alert when activated.</li>
  </ol>
</div>


<h2 id="options">Options</h2>

### Variants

<div class="docs-states-grid" style="--docs-states-cols: 1">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Default", description="A neutral message with no specific status.", variant="") }}</div><span class="docs-states-grid-item-label">Default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Information", description="Here is some helpful context.", variant="info") }}</div><span class="docs-states-grid-item-label">Info</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Success", description="Your action completed successfully.", variant="positive") }}</div><span class="docs-states-grid-item-label">Positive</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Error", description="Something went wrong. Please try again.", variant="negative") }}</div><span class="docs-states-grid-item-label">Negative</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Notice", description="Please review the following before proceeding.", variant="notice") }}</div><span class="docs-states-grid-item-label">Notice</span></div>
</div>

Variants select an appearance and a default icon; they do not infer meaning from the text. Choose the variant and wording together.

### Sizes

<div class="docs-states-grid" style="--docs-states-cols: 2">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Information", description="Default size.", variant="info") }}</div><span class="docs-states-grid-item-label">Medium · default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Information", description="Small size.", variant="info", size="sm") }}</div><span class="docs-states-grid-item-label">Small</span></div>
</div>

### Container scaling

Use the Scale switch beside Light/Dark in the preview above, or set <code>data-scale="small|medium|large"</code> on a containing element. Font size, line height, spacing and corner radius inherit that context. A local <code>size="sm"</code> remains smaller within the chosen context; it does not cancel the container scale. Border width stays fixed.

<div class="docs-states-grid" style="--docs-states-cols: 3">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div data-scale="small" style="inline-size: 100%;">{{ uif.inlineAlert(title="Information", description="Container small.", variant="info") }}</div></div><span class="docs-states-grid-item-label">Container small</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div data-scale="medium" style="inline-size: 100%;">{{ uif.inlineAlert(title="Information", description="Container medium.", variant="info") }}</div></div><span class="docs-states-grid-item-label">Container medium</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div data-scale="large" style="inline-size: 100%;">{{ uif.inlineAlert(title="Information", description="Container large.", variant="info") }}</div></div><span class="docs-states-grid-item-label">Container large</span></div>
</div>

The default context is medium. A nested container replaces the inherited context explicitly, without multiplying the parent context again. Brand and light/dark mode remain independent.

### Table of options

<div class="docs-table-wrap">
<table class="docs-options-table">
  <thead><tr><th>Custom Element</th><th>Nunjucks</th><th>Values and defaults</th></tr></thead>
  <tbody>
    <tr><td><code>variant</code></td><td><code>variant</code></td><td>Empty default (neutral), <code>info</code>, <code>positive</code>, <code>negative</code>, <code>notice</code>. Unsupported values fall back to the neutral default.</td></tr>
    <tr><td><code>title</code></td><td><code>title</code></td><td>Bold heading text. Optional; omitted when empty.</td></tr>
    <tr><td><code>description</code></td><td><code>description</code></td><td>Body text. Optional; omitted when empty.</td></tr>
    <tr><td><code>icon</code></td><td><code>icon</code></td><td>Icon name override. Defaults to a variant-appropriate icon; the neutral default has no icon unless set.</td></tr>
    <tr><td><code>size</code></td><td><code>size</code></td><td><code>md</code> (default) or <code>sm</code>. Relative to the inherited container scale.</td></tr>
    <tr><td><code>dismissible</code></td><td><code>dismissible</code></td><td><code>false</code> (default) or present/<code>true</code>. Adds a dismiss button.</td></tr>
  </tbody>
</table>
</div>


<h2 id="behaviors">Behaviors</h2>

<div class="docs-behavior-list">
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Dismissible", description="Activate the close button to hide this alert.", variant="info", dismissible=true) }}</div><div class="docs-behavior-body"><h3>Dismiss</h3><p>When <code>dismissible</code> is set, a close button appears. Activating it adds the <code>is-hidden</code> class and the Custom Element dispatches a <code>uif-dismiss</code> event. Dismissal does not remove the element from the DOM.</p></div></div>
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Title only", variant="positive") }}</div><div class="docs-behavior-body"><h3>Title-only</h3><p>The description is optional. When omitted, the title occupies the content area on its own.</p></div></div>
</div>


<h2 id="usage-guidelines">Usage guidelines</h2>

<div class="docs-guideline">
  <div class="docs-guideline-item" data-type="do"><div class="docs-guideline-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Booking confirmed", description="Your reservation has been saved.", variant="positive") }}</div><div class="docs-guideline-body"><p class="docs-guideline-label">Do</p><p>Use <code>positive</code> for confirmed actions and successful outcomes, with wording that matches.</p></div></div>
  <div class="docs-guideline-item" data-type="dont"><div class="docs-guideline-preview" style="inline-size: 100%;">{{ uif.inlineAlert(title="Booking confirmed", description="Your reservation has been saved.", variant="negative") }}</div><div class="docs-guideline-body"><p class="docs-guideline-label">Don't</p><p>Do not pair a success message with the <code>negative</code> variant — it signals an error and misleads.</p></div></div>
</div>

Place the alert next to the content it concerns. Keep a single clear message per alert and avoid stacking many alerts in one region.


<h2 id="content-standards">Content standards</h2>

- Keep titles short, around 3–7 words, in sentence case.
- Write descriptions in plain language; make them concise and actionable.
- Do not repeat the title content in the description.
- Provide localized text. The component does not translate content.


<h2 id="keyboard-interactions">Keyboard interactions</h2>

| Key | Action |
|-----|--------|
| <kbd>Tab</kbd> | Moves focus to the dismiss button, when present. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused dismiss button. |

Without a dismiss button the alert has no interactive controls and does not enter the tab order.


<h2 id="accessibility">Accessibility</h2>

- The container uses <code>role="alert"</code> so assistive technologies announce the message when it is inserted.
- Icons are decorative and carry <code>aria-hidden="true"</code>.
- The dismiss button has an explicit <code>aria-label="Dismiss"</code> and a visible focus indicator.
- Color is not the only cue: the variant icon and the wording carry the meaning (WCAG 1.4.1).
- Rapidly inserting or updating alerts can cause repeated announcements; insert them deliberately.


<h2 id="implementation">Implementation</h2>

Import the individual module once, or use the aggregate <code>ui-foundations/elements</code> entry.

```js
{% raw %}
import "ui-foundations/elements/ui-inline-alert";
{% endraw %}
```

```html
{% raw %}
<uif-inline-alert variant="info" title="Information" description="Here is some helpful context."></uif-inline-alert>
<uif-inline-alert variant="negative" title="Error" description="Something went wrong." dismissible></uif-inline-alert>
{% endraw %}
```

For static HTML without Custom Element JavaScript, use the macro:

```njk
{% raw %}
{% import "macros/ui.njk" as uif %}
{{ uif.inlineAlert(title="Information", description="Here is some helpful context.", variant="info", dismissible=true) }}
{% endraw %}
```

The macro and Custom Element emit the same markup: a <code>.uif-inline-alert</code> container with <code>.uif-inline-alert-icon</code>, <code>.uif-inline-alert-content</code> (<code>.uif-inline-alert-title</code> and <code>.uif-inline-alert-description</code>) and an optional <code>.uif-inline-alert-dismiss</code> button. Title and description text are escaped.

The scale belongs to the container, not to the <code>size</code> attribute:

```html
{% raw %}
<div data-scale="large">
  <uif-inline-alert size="sm" variant="info" title="Information"></uif-inline-alert>
</div>
{% endraw %}
```


<h2 id="theming">Theming</h2>

Use the brand and mode switches in the preview above. Visual values come from the pattern's <code>--uif-inline-alert-*</code> slots, which alias existing Semantic roles: surfaces, borders and content colors per variant. Set <code>data-brand="a"</code>, <code>"b"</code> or <code>"c"</code> and <code>data-mode="light"</code> or <code>"dark"</code> on the root element. Consumers own activation of these contexts. See [Design Tokens](/foundations/design-tokens/).


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/inline-alert.css" %}


<h2 id="design-checklist">Design checklist</h2>

<div class="docs-checklist">
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Runtime and examples</strong><span>CSS, Custom Element, static macro and playground are implemented.</span></div></div>
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Accessible use of color and role</strong><span>role="alert", decorative icons as a second cue, and labelled dismiss control.</span></div></div>
  <div class="docs-checklist-item" data-done="false"><div class="docs-checklist-icon">○</div><div class="docs-checklist-text"><strong>Figma parity and Code Connect</strong><span>Live source access is unavailable. Design parity is unverified and the mapping example is inactive.</span></div></div>
  <div class="docs-checklist-item" data-done="false"><div class="docs-checklist-icon">○</div><div class="docs-checklist-text"><strong>Playground code tabs (Nunjucks / Web Component)</strong><span>The HTML tab and live preview work. The Nunjucks and Web Component tabs are not yet wired to a code generator.</span></div></div>
</div>

Automated checks cover markup, token resolution and naming. They do not certify complete accessibility or live design parity.
