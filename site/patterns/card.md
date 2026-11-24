---
layout: layouts/docs.njk
title: Card
description: Structured content container with explicit interaction and selection semantics.
navTitle: Card
order: 91
permalink: /patterns/card/
playgroundUrl: /patterns/card-playground/
playgroundLabel: Open Card Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{% call uif.card(id="card-mallorca", title="Mallorca escape", href="#mallorca", actionLabel="View Mallorca escape") %}<p>Seven nights with breakfast and direct flights.</p><strong>From €499</strong>{% endcall %}</div></div><div class="docs-hero-meta"><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

Card groups one subject with media, header, body and footer content. Custom Element children use `slot="media|header|body|footer"` in light DOM. The element maps them to canonical `.uif-card-*` regions. Pass a unique `id` to every Nunjucks Card instance so its heading and `aria-labelledby` reference remain unique.

<h2 id="interaction">Interaction model</h2>

Use `href` for one explicit navigation link or `selectable` for one native button with `aria-pressed`. Do not combine these modes or add nested interactive controls. The card container itself is not assigned a button role. `selected` has programmatic meaning only with `selectable`; activation dispatches `uif-select` with `detail.selected`.

A disabled navigation Card keeps its native link semantics and `href`, exposes `aria-disabled="true"`, and prevents activation. It is removed from the sequential tab order with `tabindex="-1"`; users can still reach the surrounding content without landing on an unavailable action.

Use `layout="horizontal"` only when media and content remain understandable side by side. It returns to one column on narrow viewports.

<h2 id="implementation">Implementation</h2>

```html
<uif-card id="mallorca-card" title="Mallorca escape" layout="horizontal" href="/mallorca">
  <img slot="media" src="/mallorca.jpg" alt="Mallorca coastline">
  <p slot="body">Seven nights with breakfast.</p>
  <strong slot="footer">From €499</strong>
</uif-card>
```

<h2 id="accessibility">Accessibility</h2>

The card is an `article` labelled by its heading. Its one native action preserves normal focus and activation behavior unless explicitly disabled. Selected cards expose `aria-pressed` and a non-color-only border change. Content reflows at 320 CSS pixels and 200% text. Forced-colors mode keeps boundaries and selection visible.

<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/card.css" %}

<h2 id="design-follow-up">Design follow-up</h2>

Live Figma variants/properties/tokens and Code Connect publication are deferred for issue #44. No Figma ID is claimed.
