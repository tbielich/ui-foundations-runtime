---
layout: layouts/docs.njk
title: Illustrated Message Playground
description: Interactive vanilla preview for the Illustrated Message component.
navTitle: Illustrated Message Playground
order: 88
permalink: /patterns/illustrated-message-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Illustrated Message
    url: /patterns/illustrated-message/
  - label: Playground
playground:
  id: illustrated-message-playground
  queryPrefix: illustrated-message
  runtime: vanilla
  containerScale: true
  renderer: illustrated-message
  tokenCssPath: src/ui/patterns/illustrated-message.css
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
    - kind: select
      name: preset
      label: Preset
      query: true
      default: empty
      options:
        - empty
        - error
        - no-results
    - kind: text
      name: heading
      label: Heading override
      query: true
      default: ""
    - kind: text
      name: description
      label: Description override
      query: true
      default: ""
    - kind: text
      name: illustrationIcon
      label: Illustration icon override
      query: true
      default: ""
    - kind: text
      name: actionLabel
      label: Action label
      query: true
      default: ""
    - kind: text
      name: actionHref
      label: Action href
      query: true
      default: ""
    - kind: select
      name: actionVariant
      label: Action variant
      query: true
      default: solid
      options:
        - solid
        - outline
        - ghost
    - kind: select
      name: size
      label: Size
      query: true
      default: md
      options:
        - md
        - sm
---

{% from "macros/playground.njk" import playground as uiPlayground with context %}

{{ uiPlayground(playground) }}

<script type="module" src="/vendor/ui-foundations/elements/ui-illustrated-message.js"></script>
