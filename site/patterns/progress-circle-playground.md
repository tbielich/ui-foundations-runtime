---
layout: layouts/docs.njk
title: ProgressCircle Playground
description: Interactive preview for the ProgressCircle component.
navTitle: ProgressCircle Playground
order: 47
permalink: /patterns/progress-circle-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: ProgressCircle
    url: /patterns/progress-circle/
  - label: Playground
playground:
  id: progress-circle-playground
  queryPrefix: progressCircle
  runtime: vanilla
  renderer: progressCircle
  tokenCssPath: src/ui/patterns/progress-circle.css
  controls:
    - kind: select
      name: size
      label: Size
      query: true
      default: md
      options:
        - sm
        - md
        - lg
    - kind: number
      name: value
      label: Value
      query: true
      default: 64
    - kind: text
      name: label
      label: Accessible label
      query: true
      default: Uploading
---

{% from "macros/playground.njk" import playground as uiPlayground with context %}

{{ uiPlayground(playground) }}
