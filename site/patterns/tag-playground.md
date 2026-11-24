---
layout: layouts/docs.njk
title: Tag Playground
description: Preview Tag sizes, removal and overflow behavior.
navTitle: Tag Playground
order: 94
permalink: /patterns/tag-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Tag
    url: /patterns/tag/
  - label: Playground
playground:
  id: tag-playground
  queryPrefix: tag
  runtime: vanilla
  renderer: tag
  tokenCssPath: src/ui/patterns/tag.css
  controls:
    - kind: text
      name: label
      label: First tag label
      source: prop
      query: true
      default: Family
    - kind: select
      name: size
      label: Size
      query: true
      default: md
      options:
        - md
        - sm
    - kind: checkbox
      name: removable
      label: Removable
      query: true
      default: true
    - kind: select
      name: overflow
      label: Overflow
      query: true
      default: wrap
      options:
        - wrap
        - scroll
    - kind: text
      name: icon
      label: Prefix icon
      source: prop
      query: true
      default: user
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-tag.js"></script>
