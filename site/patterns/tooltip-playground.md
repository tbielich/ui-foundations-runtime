---
layout: layouts/docs.njk
title: Tooltip Playground
description: Interactive preview for the Tooltip component.
navTitle: Tooltip Playground
order: 21
permalink: /patterns/tooltip-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Tooltip
    url: /patterns/tooltip/
  - label: Playground
playground:
  id: tooltip-playground
  queryPrefix: tooltip
  runtime: vanilla
  renderer: tooltip
  tokenCssPath: src/ui/patterns/tooltip.css
  controls:
    - kind: text
      name: text
      label: Tooltip Text
      query: true
      default: "Helpful tip"
    - kind: select
      name: placement
      label: Placement
      query: true
      default: top
      options:
        - top
        - bottom
        - left
        - right
    - kind: select
      name: showDelay
      label: Show Delay
      query: true
      default: "300"
      options:
        - "0"
        - "150"
        - "300"
        - "500"
        - "1000"
    - kind: select
      name: hideDelay
      label: Hide Delay
      query: true
      default: "0"
      options:
        - "0"
        - "150"
        - "300"
        - "500"
    - kind: text
      name: children
      label: Trigger Text
      source: children
      query: true
      default: "Hover me"
---

{% from "macros/playground.njk" import playground as uiPlayground with context %}

{{ uiPlayground(playground) }}
