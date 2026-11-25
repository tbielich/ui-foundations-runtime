---
layout: layouts/docs.njk
title: Toast Playground
description: Interactive preview for Toast variants, urgency, actions and timing.
navTitle: Toast Playground
order: 88
permalink: /patterns/toast-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Toast
    url: /patterns/toast/
  - label: Playground
playground:
  id: toast-playground
  queryPrefix: toast
  runtime: vanilla
  containerScale: true
  renderer: toast
  tokenCssPath: src/ui/patterns/toast.css
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
      name: message
      label: Message
      source: prop
      query: true
      default: "Your booking was saved."
    - kind: select
      name: variant
      label: Variant
      query: true
      default: info
      options:
        - info
        - success
        - warning
        - error
    - kind: text
      name: duration
      label: Duration in milliseconds
      source: prop
      query: true
      default: "0"
    - kind: select
      name: urgency
      label: Announcement urgency
      query: true
      default: auto
      options:
        - auto
        - polite
        - assertive
    - kind: text
      name: actionLabel
      label: Action label
      source: prop
      query: true
      default: "Undo"
    - kind: select
      name: position
      label: Stack position
      query: true
      default: top-end
      options:
        - top-end
        - top-start
        - bottom-end
        - bottom-start
---

{% from "macros/playground.njk" import playground as uiPlayground with context %}

{{ uiPlayground(playground) }}

<script type="module" src="/vendor/ui-foundations/elements/ui-toast.js"></script>
