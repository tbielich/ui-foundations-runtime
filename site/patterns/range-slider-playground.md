---
layout: layouts/docs.njk
title: Range Slider Playground
description: Preview bounds, steps, values and field states.
navTitle: Range Slider Playground
order: 102
permalink: /patterns/range-slider-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Range Slider
    url: /patterns/range-slider/
  - label: Playground
playground:
  id: range-slider-playground
  queryPrefix: range-slider
  runtime: vanilla
  containerScale: true
  renderer: range-slider
  tokenCssPath: src/ui/patterns/range-slider.css
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
      default: Price range
    - kind: number
      name: min
      label: Minimum bound
      default: 0
    - kind: number
      name: max
      label: Maximum bound
      default: 2000
    - kind: number
      name: step
      label: Step
      default: 50
    - kind: number
      name: lower
      label: Lower value
      default: 300
    - kind: number
      name: upper
      label: Upper value
      default: 1200
    - kind: checkbox
      name: invalid
      label: Invalid
      default: false
    - kind: checkbox
      name: disabled
      label: Disabled
      default: false
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-range-slider.js"></script>
