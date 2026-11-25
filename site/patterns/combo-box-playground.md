---
layout: layouts/docs.njk
title: ComboBox Playground
description: Preview local filtering, free-form, loading, disabled and error states.
navTitle: ComboBox Playground
order: 104
permalink: /patterns/combo-box-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: ComboBox
    url: /patterns/combo-box/
  - label: Playground
playground:
  id: combo-box-playground
  queryPrefix: combo-box
  runtime: vanilla
  containerScale: true
  renderer: combo-box
  tokenCssPath: src/ui/patterns/combo-box.css
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
      default: Destination
    - kind: text
      name: placeholder
      label: Placeholder
      default: Search destinations
    - kind: checkbox
      name: freeform
      label: Allow free-form values
      default: false
    - kind: checkbox
      name: loading
      label: Loading
      default: false
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
<script type="module" src="/vendor/ui-foundations/elements/ui-combo-box.js"></script>
