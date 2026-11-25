---
layout: layouts/docs.njk
title: Search Field Playground
description: Preview native search, clear, quiet and disabled states.
navTitle: Search Field Playground
order: 96
permalink: /patterns/search-field-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Search Field
    url: /patterns/search-field/
  - label: Playground
playground:
  id: search-field-playground
  queryPrefix: search-field
  runtime: vanilla
  containerScale: true
  renderer: search-field
  tokenCssPath: src/ui/patterns/search-field.css
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
      label: Label
      default: Search holidays
    - kind: text
      name: placeholder
      label: Placeholder
      default: Destination or hotel
    - kind: text
      name: value
      label: Value
      default: Mallorca
    - kind: checkbox
      name: quiet
      label: Quiet
      default: false
    - kind: checkbox
      name: disabled
      label: Disabled
      default: false
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-search-field.js"></script>
