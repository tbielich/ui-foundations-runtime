---
layout: layouts/docs.njk
title: Breadcrumbs Playground
description: Preview hierarchy, separator and disclosure behavior.
navTitle: Breadcrumbs Playground
order: 90
permalink: /patterns/breadcrumbs-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Breadcrumbs
    url: /patterns/breadcrumbs/
  - label: Playground
playground:
  id: breadcrumbs-playground
  queryPrefix: breadcrumbs
  runtime: vanilla
  containerScale: true
  renderer: breadcrumbs
  tokenCssPath: src/ui/patterns/breadcrumbs.css
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
      name: label
      label: Navigation label
      source: prop
      query: true
      default: Breadcrumb
    - kind: text
      name: separator
      label: Separator
      source: prop
      query: true
      default: "/"
    - kind: text
      name: collapseAt
      label: Collapse after item count
      source: prop
      query: true
      default: "4"
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-breadcrumbs.js"></script>
