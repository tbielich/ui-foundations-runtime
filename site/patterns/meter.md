---
layout: layouts/docs.njk
title: Meter
description: A read-only measurement within a known minimum and maximum.
navTitle: Meter
order: 85
permalink: /patterns/meter/
playgroundUrl: /patterns/meter-playground/
playgroundLabel: Open Meter Playground
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
    <div class="docs-hero-preview-stage"><div style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", value=72) }}</div></div></div>
  </div>
  <div class="docs-hero-meta">
    <a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a>
  </div>
</div>

Meter represents a scalar measurement within a known range, such as storage usage. Use [Progress Bar](/patterns/progress-bar/) for completion of an ongoing task. Meter is not a slider or a form input.


<h2 id="anatomy">Anatomy</h2>

<div class="docs-anatomy">
  <div class="docs-anatomy-preview"><div class="docs-anatomy-subject" style="inline-size: 100%;"><span class="docs-anatomy-outline"></span><span class="docs-anatomy-callout" data-dir="top" style="left: 8%; transform: translateX(-50%);"><span class="docs-anatomy-badge">1</span><span class="docs-anatomy-callout-line"></span></span><span class="docs-anatomy-callout" data-dir="top" style="left: 88%; transform: translateX(-50%);"><span class="docs-anatomy-badge">2</span><span class="docs-anatomy-callout-line"></span></span><span class="docs-anatomy-callout" data-dir="bottom" style="left: 86%; transform: translateX(-50%);"><span class="docs-anatomy-callout-line"></span><span class="docs-anatomy-badge">3</span></span><span class="docs-anatomy-callout" data-dir="bottom" style="left: 40%; transform: translateX(-50%);"><span class="docs-anatomy-callout-line"></span><span class="docs-anatomy-badge">4</span></span><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", value=72) }}</div></div></div>
  <ol class="docs-anatomy-footnotes">
    <li><span class="docs-anatomy-badge-inline">1</span> Label — names the measured quantity.</li>
    <li><span class="docs-anatomy-badge-inline">2</span> Value text — a percentage or a custom measurement with units.</li>
    <li><span class="docs-anatomy-badge-inline">3</span> Track — the full minimum-to-maximum range.</li>
    <li><span class="docs-anatomy-badge-inline">4</span> Fill — the normalized current measurement. A native meter carries the accessible value; the visual track is hidden from assistive technology.</li>
  </ol>
</div>


<h2 id="options">Options</h2>

### Variants

<div class="docs-states-grid" style="--docs-states-cols: 2">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Default", value=72, variant="default") }}</div></div><span class="docs-states-grid-item-label">Default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Positive", value=72, variant="positive") }}</div></div><span class="docs-states-grid-item-label">Positive</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Notice", value=72, variant="notice") }}</div></div><span class="docs-states-grid-item-label">Notice</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Negative", value=72, variant="negative") }}</div></div><span class="docs-states-grid-item-label">Negative</span></div>
</div>

Variants change presentation only. The component does not calculate thresholds or infer whether a value is good or bad.

### Sizes

<div class="docs-states-grid" style="--docs-states-cols: 2">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", value=72) }}</div></div><span class="docs-states-grid-item-label">Medium · default</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", value=72, size="sm") }}</div></div><span class="docs-states-grid-item-label">Small</span></div>
</div>

### Range and value text

<div class="docs-states-grid" style="--docs-states-cols: 2">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", min=0, max=200, value=72, valueText="72 of 200 GB") }}</div></div><span class="docs-states-grid-item-label">Custom units</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Measured level", min=10, max=30, value=20, valueText="20 units") }}</div></div><span class="docs-states-grid-item-label">Nonzero minimum</span></div>
</div>

### Table of options

<div class="docs-table-wrap">
<table class="docs-options-table">
  <thead><tr><th>Custom Element</th><th>Nunjucks</th><th>Values and defaults</th></tr></thead>
  <tbody>
    <tr><td><code>label</code></td><td><code>label</code></td><td>Names the measurement. Custom Element default: <code>Meter</code>; macro default: <code>Storage used</code>. Supply a meaningful label.</td></tr>
    <tr><td><code>value</code></td><td><code>value</code></td><td>A finite number. Custom Element default: <code>0</code>; macro default: <code>72</code>. Clamped to the range.</td></tr>
    <tr><td><code>min</code></td><td><code>min</code></td><td>Lower bound. Default: <code>0</code>.</td></tr>
    <tr><td><code>max</code></td><td><code>max</code></td><td>Upper bound. Default: <code>100</code>.</td></tr>
    <tr><td><code>value-text</code></td><td><code>valueText</code></td><td>Optional measurement text, such as <code>72 of 200 GB</code>. Defaults to the rounded normalized percentage.</td></tr>
    <tr><td><code>variant</code></td><td><code>variant</code></td><td><code>default</code>, <code>positive</code>, <code>notice</code> or <code>negative</code>. Default: <code>default</code>.</td></tr>
    <tr><td><code>size</code></td><td><code>size</code></td><td><code>md</code> (default) or <code>sm</code>.</td></tr>
  </tbody>
</table>
</div>


<h2 id="behaviors">Behaviors</h2>

<div class="docs-behavior-list">
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", min=0, max=200, value=72, valueText="72 of 200 GB") }}</div></div><div class="docs-behavior-body"><h3>Normalized measurement</h3><p>The fill represents (value − min) / (max − min). A value of 72 in a 0–200 range fills 36% of the track.</p></div></div>
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", value=100) }}</div></div><div class="docs-behavior-body"><h3>Range boundaries</h3><p>Finite values below min or above max are clamped. A value of zero stays zero. Meter has no indeterminate state.</p></div></div>
  <div class="docs-behavior-item"><div class="docs-behavior-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", value=72) }}</div></div><div class="docs-behavior-body"><h3>Read-only updates</h3><p>Changing observed attributes replaces the displayed measurement. Meter emits no component-specific change event and does not accept keyboard or pointer input.</p></div></div>
</div>

For the Custom Element, invalid or non-finite numeric input falls back to the corresponding default. If max is not greater than min, max becomes min + 1. If the resulting range cannot be represented, it resets to 0–100. Supply finite numeric arguments to the macro and set bounds deliberately rather than depending on recovery behavior.


<h2 id="usage-guidelines">Usage guidelines</h2>

<div class="docs-guideline">
  <div class="docs-guideline-item" data-type="do"><div class="docs-guideline-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Storage used", max=200, value=72, valueText="72 of 200 GB") }}</div></div><div class="docs-guideline-body"><p class="docs-guideline-label">Do</p><p>Name the quantity and include units when percentages alone would be ambiguous.</p></div></div>
  <div class="docs-guideline-item" data-type="dont"><div class="docs-guideline-preview" style="inline-size: 100%;"><div style="inline-size: 100%;">{{ uif.meter(label="Uploading", value=72) }}</div></div><div class="docs-guideline-body"><p class="docs-guideline-label">Don't</p><p>Do not use Meter for a task in progress. Use Progress Bar for uploading or processing.</p></div></div>
</div>

Choose bounds that have meaning for the measurement. Explain any notice or negative condition in text; do not expect the fill color to explain a threshold.


<h2 id="content-standards">Content standards</h2>

- Name the measured quantity, for example “Storage used”.
- Add units and a denominator when useful: “72 of 200 GB”.
- Update value text together with the numeric value; a stale custom label would describe a different measurement.
- Localize units and number formatting in the consuming application.


<h2 id="keyboard-interactions">Keyboard interactions</h2>

Meter is read-only, has no keyboard commands and is not a tab stop. Use a separate input or slider when people need to change the value.


<h2 id="accessibility">Accessibility</h2>

- A native <code>&lt;meter&gt;</code> exposes its accessible name, min, max and value.
- <code>value-text</code> also becomes <code>aria-valuetext</code> so the measurement can be expressed with units.
- The styled proxy track has <code>aria-hidden="true"</code>; the native meter remains in the accessibility tree.
- The label and measurement text carry meaning alongside any color treatment.
- Updates are not live announcements by default. Add a surrounding announcement region only when the workflow requires it.


<h2 id="implementation">Implementation</h2>

```js
{% raw %}
import "ui-foundations/elements/ui-meter";
{% endraw %}
```

```html
{% raw %}
<uif-meter id="storage-meter" label="Storage used" min="0" max="200"
  value="72" value-text="72 of 200 GB"></uif-meter>
{% endraw %}
```

```js
{% raw %}
const meter = document.querySelector("#storage-meter");
meter.setAttribute("value", "84");
meter.setAttribute("value-text", "84 of 200 GB");
{% endraw %}
```

For server-rendered, static HTML without Custom Element JavaScript:

```njk
{% raw %}
{% import "macros/ui.njk" as uif %}
{{ uif.meter(label="Storage used", min=0, max=200, value=72,
  valueText="72 of 200 GB", variant="default", size="md") }}
{% endraw %}
```

The macro emits the label, native <code>&lt;meter&gt;</code> and hidden-from-AT visual proxy. Include <code>ui-foundations/core.css</code> and <code>ui-foundations/ui.css</code> for the token-driven presentation. Pass explicit values in consumer code; the macro defaults are a documentation example.


<h2 id="theming">Theming</h2>

Use the brand and mode switches in the preview above. Visual values come from the pattern's <code>--uif-meter-*</code> slots and existing Semantic roles. Labels use semantic content color. An inward outline keeps colored markers or fills discernible across light and dark surfaces.

Set <code>data-brand="a"</code>, <code>"b"</code> or <code>"c"</code> and <code>data-mode="light"</code> or <code>"dark"</code> on the root element. Consumers own activation of these contexts. See [Design Tokens](/foundations/design-tokens/).


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/meter.css" %}


<h2 id="design-checklist">Design checklist</h2>

<div class="docs-checklist">
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Runtime and examples</strong><span>CSS, Custom Element, static macro and playground are implemented.</span></div></div>
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Bounded browser checks</strong><span>Updates, semantics and text/visible-boundary contrast checked across three brands and two modes.</span></div></div>
  <div class="docs-checklist-item" data-done="false"><div class="docs-checklist-icon">○</div><div class="docs-checklist-text"><strong>Figma parity and Code Connect</strong><span>Live source access is unavailable. Design parity is unverified and mapping examples are inactive.</span></div></div>
</div>

The browser checks cover specific Runtime behavior and contrast pairs; they do not certify complete accessibility or live design parity.
