---
layout: layouts/docs.njk
title: Tabs
description: Tabbed navigation for switching between related content panels. Keyboard accessible with ARIA tablist pattern.
navTitle: Tabs
order: 20
permalink: /patterns/tabs/
playgroundUrl: /patterns/tabs-playground/
playgroundLabel: Open Tabs Playground
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
    <div class="docs-hero-preview-stage" style="inline-size: 100%;">
      <div class="uif-tabs" style="inline-size: 100%; min-inline-size: 0;">
        <uif-tab-list aria-label="Example tabs">
          <uif-tab label="Overview" selected controls="panel-1"></uif-tab>
          <uif-tab label="Details" controls="panel-2"></uif-tab>
          <uif-tab label="Settings" controls="panel-3"></uif-tab>
        </uif-tab-list>
        <uif-tab-panel id="panel-1">Overview content goes here.</uif-tab-panel>
        <uif-tab-panel id="panel-2" hidden>Details content goes here.</uif-tab-panel>
        <uif-tab-panel id="panel-3" hidden>Settings content goes here.</uif-tab-panel>
      </div>
    </div>
  </div>
  <div class="docs-hero-meta">
    {% if playgroundUrl %}
    <a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel or "Open Playground" }}</a>
    {% endif %}
  </div>
</div>

<h2 id="anatomy">Anatomy</h2>

<div class="docs-anatomy">
  <div class="docs-anatomy-preview">
    <div class="docs-anatomy-subject" style="inline-size: 100%;">
      <span class="docs-anatomy-outline"></span>
      <span class="docs-anatomy-callout" data-dir="top" style="left: 30%; transform: translateX(-50%);">
        <span class="docs-anatomy-badge">1</span>
        <span class="docs-anatomy-callout-line"></span>
      </span>
      <span class="docs-anatomy-callout" data-dir="right" style="top: 70%; transform: translateY(-50%);">
        <span class="docs-anatomy-callout-line"></span>
        <span class="docs-anatomy-badge">2</span>
      </span>
      {% call uif.tabList(ariaLabel="Anatomy tabs") %}
        {{ uif.tab(label="Tab 1", selected=true) }}
        {{ uif.tab(label="Tab 2") }}
      {% endcall %}
      {% call uif.tabPanel() %}
        <p>Panel content</p>
      {% endcall %}
    </div>
  </div>
  <ol class="docs-anatomy-footnotes">
    <li><span class="docs-anatomy-badge-inline">1</span> Tab list — horizontal row of tab buttons with active indicator</li>
    <li><span class="docs-anatomy-badge-inline">2</span> Tab panel — content area associated with the active tab</li>
  </ol>
</div>

<h2 id="options">Options</h2>

### States

<div class="docs-states-grid" style="--docs-states-cols: 4">
  <div class="docs-states-grid-item">
    <div class="docs-states-grid-item-preview">
      <button class="tab" role="tab" aria-selected="false">Default</button>
    </div>
    <span class="docs-states-grid-item-label">Default</span>
  </div>
  <div class="docs-states-grid-item">
    <div class="docs-states-grid-item-preview">
      <button class="tab is-hover" role="tab" aria-selected="false">Hover</button>
    </div>
    <span class="docs-states-grid-item-label">Hover</span>
  </div>
  <div class="docs-states-grid-item">
    <div class="docs-states-grid-item-preview">
      <button class="tab" role="tab" aria-selected="true">Selected</button>
    </div>
    <span class="docs-states-grid-item-label">Selected</span>
  </div>
  <div class="docs-states-grid-item">
    <div class="docs-states-grid-item-preview">
      <button class="tab is-disabled" role="tab" aria-selected="false" disabled>Disabled</button>
    </div>
    <span class="docs-states-grid-item-label">Disabled</span>
  </div>
</div>

### Table of options

<table class="docs-options-table">
  <thead><tr><th>Property</th><th>Values</th><th>Default</th></tr></thead>
  <tbody>
    <tr><td>orientation</td><td><code>horizontal</code> / <code>vertical</code></td><td><code>horizontal</code></td></tr>
    <tr><td>selected</td><td><code>true</code> / <code>false</code></td><td><code>false</code></td></tr>
    <tr><td>disabled</td><td><code>true</code> / <code>false</code></td><td><code>false</code></td></tr>
  </tbody>
</table>

### Container size

Use S/M/L on the containing element: `data-scale="small|medium|large"`.
Tabs inherit this context for font size, line height and padding; border widths
stay unchanged. The nearest recognized container replaces the outer context,
while an unknown value preserves inheritance. Without a container, medium is
used. Tabs have no separate `size` attribute or Compact/Default variant.

```html
<div data-scale="small">
  <uif-tab-list aria-label="Sections">
    <uif-tab label="Overview" selected controls="overview"></uif-tab>
  </uif-tab-list>
  <uif-tab-panel id="overview">Overview content</uif-tab-panel>
</div>
```

The same container context applies to static macro output. Macros emit semantic
markup; use Custom Elements for the keyboard activation and panel behavior shown
here. See the repository guide `docs/container-scale.md` for the Runtime contract.

### Overflow

Horizontal tab lists use native inline scrolling when labels exceed the available width. Tab triggers do not shrink, so labels stay readable and focused tabs can be brought into view by the browser. Vertical tab lists do not use horizontal scrolling.

Panel switching is state-driven through the selected tab and the controlled panel's `hidden` state; panel scroll position is not an alternate activation model.

The Custom Elements retain their existing tab buttons and panel content when
attributes change. Switching panels hides content without recreating it, so
unsaved form values and event listeners remain intact. Changing a tab list's
`orientation` or `aria-label` updates its existing list and preserves selection.

<h2 id="keyboard-interactions">Keyboard interactions</h2>

<table class="docs-keyboard-table">
  <thead><tr><th>Key</th><th>Action</th></tr></thead>
  <tbody>
    <tr><td><kbd>Tab</kbd></td><td>Moves focus into/out of the tab list</td></tr>
    <tr><td><kbd>←</kbd> / <kbd>→</kbd></td><td>Moves between tabs (horizontal)</td></tr>
    <tr><td><kbd>↑</kbd> / <kbd>↓</kbd></td><td>Moves between tabs (vertical)</td></tr>
    <tr><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td>Activates the focused tab</td></tr>
    <tr><td><kbd>Home</kbd></td><td>Moves to first tab</td></tr>
    <tr><td><kbd>End</kbd></td><td>Moves to last tab</td></tr>
  </tbody>
</table>

<h2 id="accessibility">Accessibility</h2>

- Uses `role="tablist"`, `role="tab"`, and `role="tabpanel"` ARIA pattern.
- `aria-selected` indicates the active tab.
- `aria-controls` links each tab to its panel.
- Only the selected tab has `tabindex="0"`; others have `tabindex="-1"` for roving focus.
- `aria-orientation` communicates layout direction to assistive technology.

<h2 id="design-checklist">Design checklist</h2>

<div class="docs-checklist">
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>All brand/mode contexts</strong><span>Works across light and dark modes.</span></div></div>
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Keyboard interactions</strong><span>Chromium keyboard and panel-state checks; screenreader not tested.</span></div></div>
  <div class="docs-checklist-item" data-done="true"><div class="docs-checklist-icon">✓</div><div class="docs-checklist-text"><strong>Design tokens</strong><span>Component-scoped tokens (<code>--uif-tabs-*</code>).</span></div></div>
</div>

The selected tab uses the Solid Button's default Brand color in light mode. In dark mode, text and indicator retain the readable active Brand foreground and contour. Existing Tabs tokens now resolve through shared Navigation roles and Appearance Scheme in both Figma and Runtime; no Tabs-specific Dark CSS override is needed. The six Brand/Scheme color contexts were read back and verified. Native Figma container S/M/L projection and library publication remain separate acceptance gates.

<script type="module" src="/vendor/ui-foundations/elements/ui-tabs.js"></script>

Code Connect source: `schemas/web-tab.figma.ts`. Live source readback confirmed
Tab component set `2535:286`, Selected false/true and Label. The existing mapping
parses successfully; this check does not claim that it is published in Figma.
