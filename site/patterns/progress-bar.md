---
layout: layouts/docs.njk
title: Progress Bar
description: Known or unknown completion of an ongoing task.
navTitle: Progress Bar
order: 86
permalink: /patterns/progress-bar/
playgroundUrl: /patterns/progress-bar-playground/
playgroundLabel: Open Progress Bar Playground
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
    <div class="docs-hero-preview-stage"><div style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(value=60, label="Uploading", showValue=true) }}</div></div></div>
  </div>
  <div class="docs-hero-meta">
    <a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a>
  </div>
</div>

Progress Bar communicates completion of an ongoing task. Use [Meter](/patterns/meter/) for a scalar measurement such as storage usage. The component is read-only; cancellation or retry actions belong in separate controls.


<h2 id="anatomy">Anatomy</h2>

<div class="docs-anatomy">
  <div class="docs-anatomy-preview"><div class="docs-anatomy-subject" style="inline-size: 100%;"><span class="docs-anatomy-outline"></span><span class="docs-anatomy-callout" data-dir="top" style="left: 8%; transform: translateX(-50%);"><span class="docs-anatomy-badge">1</span><span class="docs-anatomy-callout-line"></span></span><span class="docs-anatomy-callout" data-dir="top" style="left: 88%; transform: translateX(-50%);"><span class="docs-anatomy-badge">2</span><span class="docs-anatomy-callout-line"></span></span><span class="docs-anatomy-callout" data-dir="bottom" style="left: 86%; transform: translateX(-50%);"><span class="docs-anatomy-callout-line"></span><span class="docs-anatomy-badge">3</span></span><span class="docs-anatomy-callout" data-dir="bottom" style="left: 40%; transform: translateX(-50%);"><span class="docs-anatomy-callout-line"></span><span class="docs-anatomy-badge">4</span></span><div style="inline-size: 100%;">{{ uif.progressBar(value=60, label="Uploading", showValue=true) }}</div></div></div>
  <ol class="docs-anatomy-footnotes">
    <li><span class="docs-anatomy-badge-inline">1</span> Label — names the task and also supplies the accessible name.</li>
    <li><span class="docs-anatomy-badge-inline">2</span> Percentage — optional visible rounded progress for a determinate task.</li>
    <li><span class="docs-anatomy-badge-inline">3</span> Track — the complete 0–100 range.</li>
    <li><span class="docs-anatomy-badge-inline">4</span> Fill — completed progress, or an animated indicator when the amount is unknown.</li>
  </ol>
</div>


<h2 id="options">Options</h2>

### Progress states

<div class="docs-states-grid" style="--docs-states-cols: 2">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(value=60, label="Uploading", showValue=true) }}</div></div><span class="docs-states-grid-item-label">Determinate</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Processing", indeterminate=true, showValue=true) }}</div></div><span class="docs-states-grid-item-label">Indeterminate</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Uploading", value=0, showValue=true) }}</div></div><span class="docs-states-grid-item-label">Not started · zero</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Upload complete", value=100, showValue=true, variant="positive") }}</div></div><span class="docs-states-grid-item-label">Complete</span></div>
</div>

Use determinate progress only when a meaningful completion value is available. An indeterminate indicator has no numeric percentage.

### Variants

<div class="docs-states-grid" style="--docs-states-cols: 3">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Default", value=60, variant="default") }}</div></div><span class="docs-states-grid-item-label">Default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Positive", value=60, variant="positive") }}</div></div><span class="docs-states-grid-item-label">Positive</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Negative", value=60, variant="negative") }}</div></div><span class="docs-states-grid-item-label">Negative</span></div>
</div>

A variant changes appearance; it does not mark a task complete, pause it or report an error automatically. Update the label and surrounding message to explain the task state.

### Sizes

<div class="docs-states-grid" style="--docs-states-cols: 3">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Uploading", value=60, size="sm") }}</div></div><span class="docs-states-grid-item-label">Small</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Uploading", value=60, size="md") }}</div></div><span class="docs-states-grid-item-label">Medium · default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Uploading", value=60, size="lg") }}</div></div><span class="docs-states-grid-item-label">Large</span></div>
</div>

### Table of options

<div class="docs-table-wrap">
<table class="docs-options-table">
  <thead><tr><th>Custom Element</th><th>Nunjucks</th><th>Values and defaults</th></tr></thead>
  <tbody>
    <tr><td><code>value</code></td><td><code>value</code></td><td>Finite completion value, clamped to <code>0–100</code>. Omitted or empty by default: indeterminate. Numeric <code>0</code> is determinate.</td></tr>
    <tr><td><code>label</code></td><td><code>label</code></td><td>Visible task text and accessible name. Default: empty; the accessible fallback is <code>Progress</code> or <code>Loading</code>. Supply a task-specific label.</td></tr>
    <tr><td><code>show-value</code></td><td><code>showValue</code></td><td>Boolean. Default: false. Shows the rounded percentage only for determinate progress.</td></tr>
    <tr><td><code>indeterminate</code></td><td><code>indeterminate</code></td><td>Boolean. Default: false. Forces unknown progress even when value is present.</td></tr>
    <tr><td><code>variant</code></td><td><code>variant</code></td><td><code>default</code> (default), <code>positive</code> or <code>negative</code>.</td></tr>
    <tr><td><code>size</code></td><td><code>size</code></td><td><code>sm</code>, <code>md</code> (default) or <code>lg</code>.</td></tr>
  </tbody>
</table>
</div>

Custom Element booleans are enabled by attribute presence. Omit <code>show-value</code> or <code>indeterminate</code> to turn them off; writing <code>indeterminate="false"</code> still enables it. Macro booleans use actual <code>true</code>/<code>false</code> arguments.


<h2 id="behaviors">Behaviors</h2>

<div class="docs-behavior-list">
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(value=60, label="Uploading", showValue=true) }}</div></div><div class="docs-behavior-body"><h3>Determinate updates</h3><p>Changing value updates the fill, accessible current value and optional percentage. Finite values outside 0–100 are clamped.</p></div></div>
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Processing", indeterminate=true) }}</div></div><div class="docs-behavior-body"><h3>Unknown amount</h3><p>Missing, empty or non-finite Custom Element values produce indeterminate progress. No aria-valuenow or visible percentage is emitted.</p></div></div>
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Processing", indeterminate=true) }}</div></div><div class="docs-behavior-body"><h3>Reduced motion</h3><p>The indeterminate animation stops when reduced motion is requested. The indicator remains visible and keeps unknown-value semantics.</p></div></div>
</div>

Switch from unknown progress by removing <code>indeterminate</code> and setting a finite value. At 100 the component remains visible; the consuming workflow decides when to replace it with a completion message. It does not emit completion events or remove itself.


<h2 id="usage-guidelines">Usage guidelines</h2>

<div class="docs-guideline">
  <div class="docs-guideline-item" data-type="do"><div class="docs-guideline-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Uploading photos", value=60, showValue=true) }}</div></div><div class="docs-guideline-body"><p class="docs-guideline-label">Do</p><p>Name the task and show a percentage when it is based on meaningful progress.</p></div></div>
  <div class="docs-guideline-item" data-type="dont"><div class="docs-guideline-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.progressBar(label="Estimating progress", value=50, showValue=true) }}</div></div><div class="docs-guideline-body"><p class="docs-guideline-label">Don't</p><p>Do not invent a percentage while the amount of work is unknown. Use an indeterminate indicator instead.</p></div></div>
</div>

Keep cancellation and retry controls outside the progressbar. Use a nearby message to explain failures; a negative fill alone is not an error explanation.


<h2 id="content-standards">Content standards</h2>

- Use task-specific wording, such as “Uploading photos” or “Preparing download”.
- Keep the label stable while the percentage changes.
- Do not promise a remaining duration unless the application can estimate it reliably.
- For completion or failure, provide a clear outcome in nearby text.


<h2 id="keyboard-interactions">Keyboard interactions</h2>

Progress Bar has no keyboard commands and does not enter the tab order. Related cancel, retry or navigation actions need separate buttons or links.


<h2 id="accessibility">Accessibility</h2>

- The root has <code>role="progressbar"</code> and a task name supplied through <code>aria-label</code>.
- Determinate progress exposes <code>aria-valuemin="0"</code>, <code>aria-valuemax="100"</code> and <code>aria-valuenow</code>.
- Indeterminate progress omits <code>aria-valuenow</code> and the visible numeric percentage.
- A progressbar is not an automatic live region. If completion must be announced, use a separate, appropriately timed status message rather than announcing every percentage change.
- Reduced-motion preference disables the indeterminate animation.


<h2 id="implementation">Implementation</h2>

```js
{% raw %}
import "ui-foundations/elements/ui-progress-bar";
{% endraw %}
```

```html
{% raw %}
<uif-progress-bar id="upload-progress" value="0"
  label="Uploading photos" show-value></uif-progress-bar>
{% endraw %}
```

```js
{% raw %}
const progress = document.querySelector("#upload-progress");
progress.setAttribute("value", "60");

// Unknown work amount: no percentage is exposed.
progress.setAttribute("indeterminate", "");

// Resume known progress.
progress.removeAttribute("indeterminate");
progress.setAttribute("value", "75");
{% endraw %}
```

For static HTML without Custom Element JavaScript:

```njk
{% raw %}
{% import "macros/ui.njk" as uif %}
{{ uif.progressBar(value=0, label="Uploading photos", showValue=true) }}
{{ uif.progressBar(label="Preparing download", indeterminate=true) }}
{% endraw %}
```

The macro emits the progressbar, optional header and styled track/fill. Pass finite numbers or an empty value to the macro. Both interfaces use the same CSS pattern; changes to static markup must keep its fill value and accessible current value aligned.


<h2 id="theming">Theming</h2>

Use the brand and mode switches in the preview above. Visual values come from the pattern's <code>--uif-progress-bar-*</code> slots and existing Semantic roles. Labels use semantic content color. An inward outline keeps colored markers or fills discernible across light and dark surfaces.

Set <code>data-brand="a"</code>, <code>"b"</code> or <code>"c"</code> and <code>data-mode="light"</code> or <code>"dark"</code> on the root element. Consumers own activation of these contexts. See [Design Tokens](/foundations/design-tokens/).


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/progress-bar.css" %}


<h2 id="design-checklist">Design checklist</h2>

<div class="docs-checklist">
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Runtime and examples</strong><span>CSS, Custom Element, static macro and playground are implemented.</span></div></div>
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Bounded browser checks</strong><span>Updates, semantics and text/visible-boundary contrast checked across three brands and two modes.</span></div></div>
  <div class="docs-checklist-item" data-done="false"><div class="docs-checklist-icon">○</div><div class="docs-checklist-text"><strong>Figma parity and Code Connect</strong><span>Live source access is unavailable. Design parity is unverified and mapping examples are inactive.</span></div></div>
</div>

The browser checks cover specific Runtime behavior and contrast pairs; they do not certify complete accessibility or live design parity.
