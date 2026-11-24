---
layout: layouts/docs.njk
title: Popover Playground
description: Interactive preview for Popover placement, content and focus behavior.
navTitle: Popover Playground
order: 90
permalink: /patterns/popover-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Popover
    url: /patterns/popover/
  - label: Playground
playground:
  id: popover-playground
  queryPrefix: popover
  runtime: vanilla
  renderer: popover
  tokenCssPath: src/ui/patterns/popover.css
  controls:
    - kind: text
      name: triggerLabel
      label: Trigger label
      source: prop
      query: true
      default: "Show booking details"
    - kind: text
      name: label
      label: Popover accessible name
      source: prop
      query: true
      default: "Booking details"
    - kind: text
      name: content
      label: Content
      source: prop
      query: true
      default: "Your fare can be changed before departure."
    - kind: select
      name: placement
      label: Preferred placement
      query: true
      default: bottom
      options:
        - top
        - bottom
        - left
        - right
---

{% from "macros/playground.njk" import playground as uiPlayground with context %}

{{ uiPlayground(playground) }}

<script type="module" src="/vendor/ui-foundations/elements/ui-popover.js"></script>
