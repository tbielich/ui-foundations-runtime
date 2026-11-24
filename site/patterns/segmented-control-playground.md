---
layout: layouts/docs.njk
title: Segmented Control Playground
description: Preview size, selection and disabled options.
navTitle: Segmented Control Playground
order: 100
permalink: /patterns/segmented-control-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Segmented Control
    url: /patterns/segmented-control/
  - label: Playground
playground:
  id: segmented-control-playground
  queryPrefix: segmented-control
  runtime: vanilla
  renderer: segmented-control
  tokenCssPath: src/ui/patterns/segmented-control.css
  controls:
    - kind: text
      name: label
      label: Group label
      default: Results view
    - kind: select
      name: value
      label: Selected value
      default: list
      options:
        - list
        - grid
        - map
    - kind: select
      name: size
      label: Size
      default: md
      options:
        - sm
        - md
        - lg
    - kind: checkbox
      name: disableLast
      label: Disable Map
      default: false
    - kind: checkbox
      name: disabled
      label: Disable group
      default: false
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-segmented-control.js"></script>
