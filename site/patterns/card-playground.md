---
layout: layouts/docs.njk
title: Card Playground
description: Preview Card layouts and explicit interaction modes.
navTitle: Card Playground
order: 92
permalink: /patterns/card-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Card
    url: /patterns/card/
  - label: Playground
playground:
  id: card-playground
  queryPrefix: card
  runtime: vanilla
  containerScale: true
  renderer: card
  tokenCssPath: src/ui/patterns/card.css
  controls:
    - kind: select
      name: scale
      label: Container scale
      query: true
      default: medium
      options:
        - small
        - medium
        - large
    - kind: text
      name: title
      label: Title
      source: prop
      query: true
      default: Mallorca escape
    - kind: select
      name: layout
      label: Layout
      query: true
      default: vertical
      options:
        - vertical
        - horizontal
    - kind: checkbox
      name: selectable
      label: Selectable
      query: true
      default: false
    - kind: checkbox
      name: selected
      label: Selected
      query: true
      default: false
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-card.js"></script>
