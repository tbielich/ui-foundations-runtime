---
layout: layouts/docs.njk
title: ProgressCircle
description: Circular progress indicator for determinate progress and indeterminate loading states.
navTitle: ProgressCircle
order: 47
permalink: /patterns/progress-circle/
playgroundUrl: /patterns/progress-circle-playground/
playgroundLabel: Open ProgressCircle Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero">
  <div class="docs-hero-preview">
    <div class="docs-hero-preview-stage" style="display: flex; gap: 1rem; align-items: center;">
      {{ uif.progressCircle(value=64, label="Uploading") }}
      {{ uif.progressCircle(label="Loading") }}
    </div>
  </div>
</div>

<h2 id="options">Options</h2>

### States

- **Determinate** — provide a value from 0 to 100.
- **Indeterminate** — omit the value when progress cannot be quantified.

### Sizes

<div class="docs-states-grid" style="--docs-states-cols: 3">
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview">{{ uif.progressCircle(value=64, label="Small progress", size="sm") }}</div><span class="docs-states-grid-item-label">S (32px)</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview">{{ uif.progressCircle(value=64, label="Medium progress") }}</div><span class="docs-states-grid-item-label">M (40px)</span></div>
  <div class="docs-states-grid-item"><div class="docs-states-grid-item-preview">{{ uif.progressCircle(value=64, label="Large progress", size="lg") }}</div><span class="docs-states-grid-item-label">L (48px)</span></div>
</div>

<h2 id="accessibility">Accessibility</h2>

- Uses `role="progressbar"` and requires a meaningful accessible label.
- Determinate progress exposes `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- Indeterminate progress omits `aria-valuenow` so assistive technology does not receive a fabricated percentage.

<h2 id="tokens">Tokens</h2>

ProgressCircle owns `--uif-progress-circle-*` pattern tokens for size, stroke width, track color, and indicator color.
