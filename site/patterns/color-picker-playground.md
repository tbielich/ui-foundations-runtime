---
layout: layouts/docs.njk
title: ColorPicker Playground
description: Preview synchronized color controls, swatches, opacity, and validation states.
navTitle: ColorPicker Playground
order: 106
permalink: /patterns/color-picker-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: ColorPicker
    url: /patterns/color-picker/
  - label: Playground
playground:
  id: color-picker-playground
  queryPrefix: color-picker
  runtime: vanilla
  renderer: color-picker
  tokenCssPath: src/ui/patterns/color-picker.css
  controls:
    - kind: text
      name: label
      label: Label
      default: Brand color
    - kind: text
      name: value
      label: Initial Hex value
      default: "#0066CC"
    - kind: checkbox
      name: readonly
      label: Read only
      default: false
    - kind: checkbox
      name: disabled
      label: Disabled
      default: false
    - kind: checkbox
      name: invalid
      label: Invalid
      default: false
    - kind: text
      name: error
      label: Error message
      default: ""
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-color-picker.js"></script>
