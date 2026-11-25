---
layout: layouts/docs.njk
title: TreeView Playground
description: Preview hierarchy, selection, reordering and lazy expansion.
navTitle: TreeView Playground
order: 108
permalink: /patterns/tree-view-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: TreeView
    url: /patterns/tree-view/
  - label: Playground
playground:
  id: tree-view-playground
  queryPrefix: tree-view
  runtime: vanilla
  renderer: tree-view
  tokenCssPath: src/ui/patterns/tree-view.css
  controls:
    - kind: text
      name: label
      label: Label
      default: Destinations
    - kind: select
      name: selection
      label: Selection
      default: multiple
      options:
        - value: single
          label: Single
        - value: multiple
          label: Multiple
        - value: none
          label: None
    - kind: checkbox
      name: reorderable
      label: Allow reordering
      default: true
    - kind: checkbox
      name: lazy
      label: Include lazy branch
      default: true
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
{{ uiPlayground(playground) }}
<script type="module" src="/vendor/ui-foundations/elements/ui-tree-view.js"></script>
