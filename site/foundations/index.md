---
layout: layouts/docs.njk
title: Foundations
description: The thinking behind UI Foundations — principles, accessibility, and design tokens.
navTitle: Overview
order: 1
permalink: /foundations/
---
{% import "macros/foundation-docs.njk" as foundation %}


{% call foundation.feature("Foundations", "Start with the decisions.", "Understand how the system works, then use its tokens and guidance to shape your interface.") %}
<ol class="foundation-stack"><li><span>01</span><div><strong>Structure</strong><small>How tokens and patterns fit together</small></div></li><li><span>02</span><div><strong>Appearance</strong><small>Choose a brand and scheme</small></div></li><li><span>03</span><div><strong>Use</strong><small>Labels, access, and language in context</small></div></li></ol>
{% endcall %}


<div class="docs-grid">
  <a class="docs-card" href="/foundations/theming/">
    <h2>Theming</h2>
    <p>Select a brand and scheme, and customise pattern tokens.</p>
  </a>
  <a class="docs-card" href="/foundations/accessibility/">
    <h2>Accessibility</h2>
    <p>Implementation expectations for accessible components, docs, and validation.</p>
  </a>
  <a class="docs-card" href="/foundations/design-tokens/">
    <h2>Design Tokens</h2>
    <p>The layered token architecture that connects Figma to code.</p>
  </a>
  <a class="docs-card" href="/foundations/content/">
    <h2>Content Standards</h2>
    <p>Writing guidelines for labels, messages, and in-product copy.</p>
  </a>
  <a class="docs-card" href="/foundations/internationalization/">
    <h2>Internationalization</h2>
    <p>RTL support, locale considerations, and bi-directional layout.</p>
  </a>
</div>

{{ foundation.next("/getting-started/", "Ready to build?", "Start with installation and a working example.") }}
