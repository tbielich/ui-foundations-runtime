---
layout: layouts/docs.njk
title: Pricing
description: Consulting service cards for design system health, AI workflows, and agent readiness.
navTitle: Pricing
order: 15
permalink: /examples/pricing/
templateEngineOverride: njk
breadcrumb:
  - label: Examples
    url: /examples/
  - label: Pricing
---

{% import "macros/ui.njk" as uif %}

{% macro annotation(index, enabled) %}{% if enabled %}<span class="docs-anatomy-outline" aria-hidden="true"></span><span class="docs-anatomy-callout" data-dir="right" aria-hidden="true"><span class="docs-anatomy-callout-line"></span><span class="docs-anatomy-badge">{{ index }}</span></span>{% endif %}{% endmacro %}

{% macro serviceCard(service, anatomy=false) %}
  {% if service == "health" %}
    {% set name = "Design System Health Check" %}
    {% set price = "€790" %}
    {% set scope = "One Figma library or a scoped repository" %}
    {% set description = "Understand where your design system needs attention." %}
    {% set features = ["Component and token structure", "Naming and semantic consistency", "Documentation and governance gaps", "Prioritized findings and 30-day action plan", "5–8-page report and 30-minute debrief"] %}
    {% set action = "Request Health Check" %}
  {% elif service == "workflow" %}
    {% set name = "AI Workflow Readiness Review" %}
    {% set price = "€590" %}
    {% set scope = "One team, one workflow, one feedback round" %}
    {% set description = "Identify where AI can support your team's existing work." %}
    {% set features = ["Review of one existing workflow", "AI opportunities and process boundaries", "Workflow diagram", "Tool recommendations", "Prioritized implementation roadmap"] %}
    {% set action = "Request Workflow Review" %}
  {% else %}
    {% set name = "AI-Agent Readiness Check" %}
    {% set price = "On request" %}
    {% set scope = "Scope agreed for your design or engineering team" %}
    {% set description = "Assess whether your team is ready to work with AI agents." %}
    {% set features = ["Agent instructions and documentation", "Tool access and permission boundaries", "Tests and quality gates", "Governance and risk assessment", "Prioritized readiness recommendations"] %}
    {% set action = "Discuss Agent Readiness" %}
  {% endif %}
  <article class="pricing-card{% if service == 'health' %} pricing-card--recommended{% endif %}{% if anatomy %} pricing-anatomy{% endif %}" {% if anatomy %}aria-label="Design System Health Check anatomy"{% else %}role="listitem"{% endif %}>
    {% if service == "health" %}<div class="pricing-anatomy-recommendation pricing-anatomy-part">{{ uif.badge("Start here", variant="brand", size="sm") }}{{ annotation(1, anatomy) }}</div>{% endif %}
    <div class="pricing-card-header">
      <h3 class="pricing-card-plan pricing-anatomy-part">{{ name }}{{ annotation(2, anatomy) }}</h3>
      <div class="pricing-card-price-row pricing-anatomy-part">
        <p class="pricing-card-price{% if service == 'agent' %} pricing-card-price--quote{% endif %}">{{ price }}{% if service != 'agent' %}<span class="pricing-card-price-period"> / pilot</span>{% endif %}</p>
        {{ annotation(3, anatomy) }}
      </div>
      <p class="pricing-card-scope pricing-anatomy-part">{{ scope }}{{ annotation(4, anatomy) }}</p>
      <p class="pricing-card-subtitle">{{ description }}</p>
    </div>
    <div class="pricing-anatomy-features pricing-anatomy-part">
      <ul class="pricing-card-features">
        {% for feature in features %}<li class="pricing-card-feature">{{ uif.icon("checkmark-circled") }}<span>{{ feature }}</span></li>{% endfor %}
      </ul>
      {{ annotation(5, anatomy) }}
    </div>
    <div class="pricing-card-cta pricing-anatomy-part">
      {{ uif.button(label=action, variant="solid" if service == "health" else "outline") }}{{ annotation(6, anatomy) }}
    </div>
  </article>
{% endmacro %}


<style>
  .pricing-grid {
    inline-size: 100%;
    min-inline-size: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--size-spacing-600);
    align-items: stretch;
  }

  @media (max-width: 760px) {
    .pricing-grid {
      grid-template-columns: 1fr;
    }
  }

  .pricing-card {
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--size-spacing-500);
    border-style: solid;
    border-width: var(--size-border-100);
    border-color: var(--color-border-subtle);
    border-radius: var(--corner-card-radius, var(--size-radius-500));
    background: var(--color-fill-surface);
    padding: var(--size-spacing-700);
  }

  .pricing-card--recommended {
    border-color: var(--color-border-brand);
    border-width: var(--size-border-200);
    box-shadow: var(--docs-shadow-md);
    position: relative;
  }

  .pricing-card--recommended > .uif-badge {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
  }

  .pricing-card-header {
    display: grid;
    gap: var(--size-spacing-200);
    text-align: start;
  }

  .pricing-card-plan {
    margin: 0;
    font-family: var(--typography-heading-font-family);
    font-size: var(--typography-heading-font-size-md);
    font-weight: var(--typography-heading-font-weight);
    line-height: var(--typography-heading-line-height-md);
    color: var(--color-text-default);
  }

  .pricing-card-price-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--size-spacing-200);
  }

  .pricing-card-scope {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    color: var(--color-text-default);
  }

  .pricing-anatomy {
    inline-size: 100%;
    max-inline-size: 28rem;
    margin-inline: auto;
  }

  .pricing-anatomy-recommendation {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
  }

  .pricing-anatomy-features {
    flex: 1;
  }

  .pricing-anatomy-part {
    position: relative;
  }

  .pricing-anatomy-recommendation.pricing-anatomy-part {
    position: absolute;
  }

  .pricing-anatomy-part > .docs-anatomy-callout {
    top: 50%;
    transform: translateY(-50%);
  }


  .pricing-card-price {
    margin: 0;
    font-family: var(--typography-heading-font-family);
    font-size: var(--typography-heading-font-size-xxxl);
    font-weight: var(--font-weight-800);
    line-height: var(--typography-heading-line-height-xxxl);
    color: var(--color-text-default);
  }

  .pricing-card-price--quote {
    font-size: var(--typography-heading-font-size-xl);
    line-height: var(--typography-heading-line-height-xl);
  }

  .pricing-card-price-period {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-400);
    color: var(--color-text-default);
  }

  .pricing-card-subtitle {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    color: var(--color-text-default);
  }

  .pricing-card-features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--size-spacing-300);
    flex: 1;
    align-content: start;
  }

  .pricing-card-feature {
    display: flex;
    align-items: flex-start;
    gap: var(--size-spacing-200);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    color: var(--color-text-default);
  }

  .pricing-card-feature .uif-icon {
    flex-shrink: 0;
    color: var(--color-text-default);
  }

  .pricing-card-cta {
    margin-block-start: auto;
  }

  .pricing-card-cta .uif-button {
    inline-size: 100%;
    justify-content: center;
  }
</style>

<p>Three focused consulting services: assess your design system, review an AI workflow, or prepare your team for AI agents. The fixed amounts are proposed B2B pilot fees, before any applicable VAT.</p>

<h2 id="preview">Preview</h2>

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
  <div class="docs-hero-preview-stage">

<div class="pricing-grid" role="list" aria-label="Consulting services">
  {{ serviceCard("workflow") }}
  {{ serviceCard("health") }}
  {{ serviceCard("agent") }}
</div>

  </div>
</div>

<h2 id="anatomy">Anatomy</h2>

<p>The Design System Health Check uses the same card markup in the preview and anatomy. Outlines, connection lines, and numbered markers are overlays.</p>

<div class="docs-anatomy">
  <div class="docs-anatomy-preview">
    {{ serviceCard("health", anatomy=true) }}
  </div>
  <ol class="docs-anatomy-footnotes">
    <li><span class="docs-anatomy-badge-inline">1</span>Recommendation — “Start here” identifies the suggested first engagement.</li>
    <li><span class="docs-anatomy-badge-inline">2</span>Service — names the consulting engagement.</li>
    <li><span class="docs-anatomy-badge-inline">3</span>Price — a fixed pilot fee with its pricing basis.</li>
    <li><span class="docs-anatomy-badge-inline">4</span>Scope — defines the library, repository, team, or workflow covered.</li>
    <li><span class="docs-anatomy-badge-inline">5</span>Deliverables — a scannable list of the review areas and results.</li>
    <li><span class="docs-anatomy-badge-inline">6</span>Action — one full-width CTA at the bottom of the card.</li>
  </ol>
</div>

<h2 id="behavior">Layout and behavior</h2>

<ul>
  <li>Cards use a three-column grid and stack below 760px, the existing <code>--breakpoint-200</code> threshold.</li>
  <li>Left-aligned content keeps the service, fee, scope, and deliverables on one reading axis.</li>
  <li>Cards stretch to equal height and keep their actions aligned at the bottom.</li>
  <li>The Health Check uses a brand border, a badge above the card, and a solid button.</li>
  <li>Brand and scheme controls apply to the comparison preview. Anatomy follows the page theme.</li>
  <li>Request buttons demonstrate composition only; this example does not submit an inquiry.</li>
</ul>

<h2 id="usage">Usage guidelines</h2>

<ul>
  <li>Show whether a fee covers a pilot, a project, or ongoing support. Explain applicable taxes and additional work before an engagement.</li>
  <li>Agree the scope before starting. The Health Check covers one Figma library or a scoped repository.</li>
  <li>Keep deliverables concrete: reports, diagrams, prioritized findings, and a debrief.</li>
  <li>Use an inquiry action for consulting services. State “On request” when the fee depends on the agreed scope.</li>
</ul>

<h2 id="composition">Composition</h2>

<p>This example composes <a href="/patterns/badge/">Badge</a>, <a href="/patterns/button/">Button</a>, and <a href="/patterns/icon/">Icon</a> with local card layout styles. Colors, spacing, borders, and typography use existing UIF tokens; the card shadow uses the docs-layer <code>--docs-shadow-md</code> variable.</p>
