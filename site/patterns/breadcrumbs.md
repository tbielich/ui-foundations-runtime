---
layout: layouts/docs.njk
title: Breadcrumbs
description: Hierarchical navigation with current-page and responsive disclosure semantics.
navTitle: Breadcrumbs
order: 89
permalink: /patterns/breadcrumbs/
playgroundUrl: /patterns/breadcrumbs-playground/
playgroundLabel: Open Breadcrumbs Playground
---
{% import "macros/ui.njk" as uif %}
{% from "macros/component-docs.njk" import preview %}

<div class="docs-hero">{% call preview(scale=true) %}{{ uif.breadcrumbs(items=[{label: "Home", href: "/"}, {label: "Holidays", href: "#holidays"}, {label: "Spain", href: "#spain"}, {label: "Mallorca", href: "#mallorca"}, {label: "Booking", current: true}]) }}{% endcall %}<div class="docs-hero-meta"><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

Breadcrumbs expose one labelled `nav` containing an ordered list. The current item uses `aria-current="page"`. Separators are CSS-generated decoration, so assistive technology does not announce them.

<h2 id="behavior">Behavior</h2>

Set `separator` to a short visual separator and `collapse-at` to the maximum item count before middle items move into a native `details` disclosure. The first item, current page and its adjacent parent remain visible. Disclosure keeps every hidden link keyboard-operable and available without clipping its text. Labels wrap at narrow widths instead of being removed from the accessibility tree.

<h2 id="implementation">Implementation</h2>

```html
<uif-breadcrumbs label="Breadcrumb" separator="/" collapse-at="4">
  <a href="/">Home</a>
  <a href="/holidays">Holidays</a>
  <span aria-current="page">Booking</span>
</uif-breadcrumbs>
```

The `uif.breadcrumbs` macro accepts `items` with `label`, optional `href` and optional `current` fields. The first item marked `current` takes precedence. If none is marked, the final item is current.

<h2 id="accessibility">Accessibility</h2>

The native navigation, list, links and disclosure preserve reading and focus order. At 320 CSS pixels and 200% text, labels wrap and the disclosure panel stays inside the viewport. Forced-colors mode retains its border and focus indication. Automated evidence does not claim manual screen-reader certification.

<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/breadcrumbs.css" %}

<h2 id="design-follow-up">Design follow-up</h2>

Live Figma variant/token reconciliation and Code Connect publication are deferred for issue #43. No Figma ID is claimed.
