---
layout: layouts/docs.njk
title: Number Field Playground
description: Preview constraints, formatting and field states.
navTitle: Number Field Playground
order: 98
permalink: /patterns/number-field-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Number Field
    url: /patterns/number-field/
  - label: Playground
playground:
  id: number-field-playground
  queryPrefix: number-field
  runtime: vanilla
  renderer: number-field
  tokenCssPath: src/ui/patterns/number-field.css
  controls:
    - kind: text
      name: label
      label: Label
      default: Holiday budget
    - kind: number
      name: value
      label: Value
      default: 500
    - kind: number
      name: min
      label: Minimum
      default: 0
    - kind: number
      name: max
      label: Maximum
      default: 5000
    - kind: number
      name: step
      label: Step
      default: 50
    - kind: select
      name: format
      label: Format
      default: currency
      options:
        - decimal
        - currency
        - percent
    - kind: checkbox
      name: readonly
      label: Read only
      default: false
    - kind: checkbox
      name: disabled
      label: Disabled
      default: false
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-number-field.js"></script>
