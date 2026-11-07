---
layout: layouts/docs.njk
title: Components
description: Interactive widgets that combine patterns, state, and JavaScript.
navTitle: Overview
order: 1
permalink: /components/
---

{% import "macros/component-docs.njk" as docs %}

{% call docs.preview() %}
<div class="docs-component-grid">
  <a class="docs-component-card" href="/components/date-picker/">
    <div class="docs-component-card-preview" aria-hidden="true">
      <div class="docs-component-mini-field"><span>Travel date</span><strong>DD / MM / YYYY <span>▦</span></strong></div>
    </div>
    <div class="docs-component-card-body"><h2>Date Picker</h2><p>Segmented date entry with a calendar and coordinated keyboard interactions.</p></div>
  </a>
  <a class="docs-component-card" href="/components/dialog/">
    <div class="docs-component-card-preview" aria-hidden="true">
      <div class="docs-component-mini-dialog"><strong>Confirm your choice</strong><span>Review the details before continuing.</span><div><span class="uif-button outline">Cancel</span><span class="uif-button solid">Confirm</span></div></div>
    </div>
    <div class="docs-component-card-body"><h2>Dialog</h2><p>A focused modal task with explicit actions and native dialog behavior.</p></div>
  </a>
</div>
{% endcall %}
