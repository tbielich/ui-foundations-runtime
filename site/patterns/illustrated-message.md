---
layout: layouts/docs.njk
title: Illustrated Message
description: A centered illustration, heading, and description with an optional action. Presets cover empty, error, and no-results states.
navTitle: Illustrated Message
order: 87
permalink: /patterns/illustrated-message/
playgroundUrl: /patterns/illustrated-message-playground/
playgroundLabel: Open Illustrated Message Playground
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
    <div class="docs-hero-preview-stage"><div style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty", actionLabel="Create item") }}</div></div>
  </div>
  <div class="docs-hero-meta">
    <a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a>
  </div>
</div>

An Illustrated Message fills an otherwise empty region with an illustration, a heading, a short description and an optional action. Use it for empty states, error states and no-results states. For an inline, in-flow message use [Inline Alert](/patterns/inline-alert/).


<h2 id="anatomy">Anatomy</h2>

<div class="docs-anatomy">
  <div class="docs-anatomy-preview">
    <div class="docs-anatomy-subject">
      <span class="docs-anatomy-outline"></span>
      <span class="docs-anatomy-callout" data-dir="top" style="left: 50%; transform: translateX(-50%);"><span class="docs-anatomy-badge">1</span><span class="docs-anatomy-callout-line"></span></span>
      <span class="docs-anatomy-callout" data-dir="left" style="top: 55%;"><span class="docs-anatomy-badge">2</span><span class="docs-anatomy-callout-line"></span></span>
      <span class="docs-anatomy-callout" data-dir="bottom" style="left: 50%; transform: translateX(-50%);"><span class="docs-anatomy-badge">3</span><span class="docs-anatomy-callout-line"></span></span>
      {{ uif.illustratedMessage(preset="empty", actionLabel="Create item") }}
    </div>
  </div>
  <ol class="docs-anatomy-footnotes">
    <li><span class="docs-anatomy-badge-inline">1</span> Illustration — a decorative icon, SVG or custom asset in the illustration slot.</li>
    <li><span class="docs-anatomy-badge-inline">2</span> Content — a heading and a supporting description.</li>
    <li><span class="docs-anatomy-badge-inline">3</span> Actions — an optional primary next step.</li>
  </ol>
</div>


<h2 id="options">Options</h2>

### Presets

<div class="docs-states-grid" style="--docs-states-cols: 3">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty", actionLabel="Create item") }}</div><span class="docs-states-grid-item-label">Empty</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="error", actionLabel="Try again") }}</div><span class="docs-states-grid-item-label">Error</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="no-results", actionLabel="Clear filters", actionVariant="outline") }}</div><span class="docs-states-grid-item-label">No results</span></div>
</div>

Each preset supplies a default heading, description and illustration icon. Any of these can be overridden while keeping the preset's overall intent.

### Sizes

<div class="docs-states-grid" style="--docs-states-cols: 2">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty") }}</div><span class="docs-states-grid-item-label">Medium · default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty", size="sm") }}</div><span class="docs-states-grid-item-label">Small</span></div>
</div>

### Container scaling

Use the Scale switch beside Light/Dark in the preview above, or set <code>data-scale="small|medium|large"</code> on a containing element. The illustration size, heading and description typography and the spacing inherit that context. A local <code>size="sm"</code> remains smaller within the chosen context; it does not cancel the container scale.

<div class="docs-states-grid" style="--docs-states-cols: 3">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div data-scale="small" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty") }}</div></div><span class="docs-states-grid-item-label">Container small</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div data-scale="medium" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty") }}</div></div><span class="docs-states-grid-item-label">Container medium</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div data-scale="large" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty") }}</div></div><span class="docs-states-grid-item-label">Container large</span></div>
</div>

The default context is medium. A nested container replaces the inherited context explicitly, without multiplying the parent context again. Brand and light/dark mode remain independent.

### Table of options

<div class="docs-table-wrap">
<table class="docs-options-table">
  <thead><tr><th>Custom Element</th><th>Nunjucks</th><th>Values and defaults</th></tr></thead>
  <tbody>
    <tr><td><code>preset</code></td><td><code>preset</code></td><td><code>empty</code> (default), <code>error</code>, <code>no-results</code>. Unsupported values fall back to <code>empty</code>.</td></tr>
    <tr><td><code>heading</code></td><td><code>heading</code></td><td>Heading text. Defaults to the preset heading.</td></tr>
    <tr><td><code>description</code></td><td><code>description</code></td><td>Description text. Defaults to the preset description.</td></tr>
    <tr><td><code>illustration-icon</code></td><td><code>illustrationIcon</code></td><td>Icon name. Defaults to the preset icon.</td></tr>
    <tr><td><code>action-label</code></td><td><code>actionLabel</code></td><td>Renders a single action when present. Empty by default.</td></tr>
    <tr><td><code>action-href</code></td><td><code>actionHref</code></td><td>Renders the action as a link; otherwise a button. Allowed URL prefixes: <code>http:</code>, <code>https:</code>, <code>mailto:</code>, <code>tel:</code>, <code>/</code> and <code>#</code>. Unsupported URLs fall back to <code>#</code>.</td></tr>
    <tr><td><code>action-variant</code></td><td><code>actionVariant</code></td><td><code>solid</code> (default), <code>outline</code>, <code>ghost</code>.</td></tr>
    <tr><td><code>size</code></td><td><code>size</code></td><td><code>md</code> (default) or <code>sm</code>. Relative to the inherited container scale.</td></tr>
  </tbody>
</table>
</div>


<h2 id="behaviors">Behaviors</h2>

<div class="docs-behavior-list">
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="no-results", actionLabel="Clear filters", actionVariant="outline") }}</div><div class="docs-behavior-body"><h3>Optional action</h3><p>An action appears only when a label is provided. With an href it renders as a link; otherwise as a button. Omit the action when there is no immediate recovery step.</p></div></div>
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="empty") }}</div><div class="docs-behavior-body"><h3>Custom illustration slot</h3><p>The Custom Element accepts a <code>slot="illustration"</code> and a <code>slot="action"</code> in light DOM, replacing the default icon and generated action when a plain icon is not enough.</p></div></div>
</div>

Provide custom markup in the illustration region when an icon is not sufficient:

```html
{% raw %}
<uif-illustrated-message heading="Invite your team" description="Add collaborators to start working together.">
  <span slot="illustration" class="uif-avatar xl" role="img" aria-label="Team"><span class="uif-avatar-initials">UI</span></span>
  <a slot="action" class="uif-button solid" href="/invite">Invite teammates</a>
</uif-illustrated-message>
{% endraw %}
```


<h2 id="usage-guidelines">Usage guidelines</h2>

<div class="docs-guideline">
  <div class="docs-guideline-item" data-type="do"><div class="docs-guideline-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="no-results", actionLabel="Clear filters", actionVariant="outline") }}</div><div class="docs-guideline-body"><p class="docs-guideline-label">Do</p><p>Offer one clear next step that helps the user recover, such as clearing filters.</p></div></div>
  <div class="docs-guideline-item" data-type="dont"><div class="docs-guideline-preview" style="inline-size: 100%;">{{ uif.illustratedMessage(preset="error", heading="Error 0x8007", description="ERR_CONNECTION_RESET at module boundary during fetch retry sequence.") }}</div><div class="docs-guideline-body"><p class="docs-guideline-label">Don't</p><p>Do not expose raw error codes or internal jargon. Explain what happened in plain language.</p></div></div>
</div>


<h2 id="content-standards">Content standards</h2>

- Keep the heading short and concrete; describe the situation, not the system.
- Make the description actionable and reassuring.
- Use a single action label that names the next step as a verb phrase.
- Provide localized text. The component does not translate content.


<h2 id="keyboard-interactions">Keyboard interactions</h2>

The message itself is not interactive. When an action is present it is a standard link or button:

| Key | Action |
|-----|--------|
| <kbd>Tab</kbd> | Moves focus to the action, when present. |
| <kbd>Enter</kbd> | Activates a link or button action. |
| <kbd>Space</kbd> | Activates a button action. |


<h2 id="accessibility">Accessibility</h2>

- The illustration is decorative by default and carries <code>aria-hidden="true"</code>. Custom illustration markup remains exposed to assistive technology: provide an accessible name when it communicates unique meaning, or set `aria-hidden="true"` on the custom illustration when decorative.
- The heading uses an <code>h2</code>; confirm it fits the surrounding document outline, or adjust the level in a custom slot.
- Keep the action focusable and clearly labelled.
- Do not rely on the illustration alone to convey the state; the heading and description carry the meaning.


<h2 id="implementation">Implementation</h2>

Import the individual module once, or use the aggregate <code>ui-foundations/elements</code> entry.

```js
{% raw %}
import "ui-foundations/elements/ui-illustrated-message";
{% endraw %}
```

```html
{% raw %}
<uif-illustrated-message preset="no-results" action-label="Clear filters" action-variant="outline"></uif-illustrated-message>
{% endraw %}
```

For static HTML without Custom Element JavaScript, use the macro:

```njk
{% raw %}
{% import "macros/ui.njk" as uif %}
{{ uif.illustratedMessage(preset="empty", actionLabel="Create item") }}
{% endraw %}
```

The macro and Custom Element emit the same markup: a <code>.uif-illustrated-message</code> container with <code>.uif-illustrated-message-illustration</code>, <code>.uif-illustrated-message-content</code> (<code>.uif-illustrated-message-heading</code> and <code>.uif-illustrated-message-description</code>) and an optional <code>.uif-illustrated-message-actions</code> wrapper. Heading, description and action text are escaped.


<h2 id="theming">Theming</h2>

Use the brand and mode switches in the preview above. Visual values come from the pattern's <code>--uif-illustrated-message-*</code> slots, which alias existing Semantic roles for content, subtle foreground, typography and spacing. Set <code>data-brand</code> and <code>data-mode</code> on the root element. See [Design Tokens](/foundations/design-tokens/).


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/illustrated-message.css" %}


<h2 id="design-checklist">Design checklist</h2>

<div class="docs-checklist">
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Runtime and examples</strong><span>CSS, Custom Element, static macro and playground are implemented.</span></div></div>
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Preset coverage and slots</strong><span>Empty, error and no-results presets; illustration and action slots supported.</span></div></div>
  <div class="docs-checklist-item" data-done="false"><div class="docs-checklist-icon">○</div><div class="docs-checklist-text"><strong>Figma parity and Code Connect</strong><span>Live source access is unavailable. Design parity is unverified and the mapping example is inactive.</span></div></div>
  <div class="docs-checklist-item" data-done="false"><div class="docs-checklist-icon">○</div><div class="docs-checklist-text"><strong>Playground code tabs (Nunjucks / Web Component)</strong><span>The HTML tab and live preview work. The Nunjucks and Web Component tabs are not yet wired to a code generator.</span></div></div>
</div>

Automated checks cover markup, token resolution and naming. They do not certify complete accessibility or live design parity.
