---
layout: layouts/docs.njk
title: Skeleton Playground
description: Preview loading shapes and composition.
navTitle: Skeleton Playground
order: 96
permalink: /patterns/skeleton-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Skeleton
    url: /patterns/skeleton/
  - label: Playground
playground:
  id: skeleton-playground
  queryPrefix: skeleton
  runtime: vanilla
  containerScale: true
  renderer: skeleton
  tokenCssPath: src/ui/patterns/skeleton.css
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
    - kind: select
      name: shape
      label: Shape
      query: true
      default: text
      options:
        - text
        - circle
        - rectangle
    - kind: text
      name: lines
      label: Text line count
      source: prop
      query: true
      default: "3"
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-skeleton.js"></script>
