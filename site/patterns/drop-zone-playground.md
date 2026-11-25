---
layout: layouts/docs.njk
title: DropZone Playground
description: Preview file filtering, multiple selection, disabled, loading and error states.
navTitle: DropZone Playground
order: 106
permalink: /patterns/drop-zone-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: DropZone
    url: /patterns/drop-zone/
  - label: Playground
playground:
  id: drop-zone-playground
  queryPrefix: drop-zone
  runtime: vanilla
  renderer: drop-zone
  tokenCssPath: src/ui/patterns/drop-zone.css
  controls:
    - kind: text
      name: label
      label: Label
      default: Travel documents
    - kind: text
      name: description
      label: Description
      default: PDF or image files
    - kind: text
      name: accept
      label: Accepted file types
      default: .pdf,image/*
    - kind: checkbox
      name: multiple
      label: Allow multiple files
      default: true
    - kind: checkbox
      name: loading
      label: Processing
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
<script type="module" src="/vendor/ui-foundations/elements/ui-drop-zone.js"></script>
