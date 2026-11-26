---
layout: layouts/docs.njk
title: Symbol Playground
description: Experimental inline SVG motifs with parent color and line height.
navTitle: Symbol Playground
order: 23
permalink: /patterns/symbol-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Patterns
    url: /patterns/
  - label: Symbol
    url: /patterns/symbol/
  - label: Playground
playground:
  id: symbol-playground
  queryPrefix: symbol
  runtime: vanilla
  renderer: symbol
  tokenCssPath: src/ui/patterns/symbol.css
  controls:
    - kind: select
      name: motif
      label: Motif
      query: true
      default: checkmark
      options:
        - checkmark
        - dash
        - chevron
        - plus
        - cross
    - kind: number
      name: weight
      label: Experimental Stroke Weight
      query: true
      default: 400
      min: 100
      max: 900
    - kind: select
      name: lineHeight
      label: Parent Line Height
      query: true
      default: 24px
      options:
        - 16px
        - 20px
        - 24px
        - 28px
        - 32px
    - kind: color
      name: color
      label: Parent Color
      query: true
      default: currentColor
---
{% from "macros/playground.njk" import playground as uiPlayground with context %}
<p>Experimental decorative Symbol beside the visible parent label “Continue”. Weight controls SVG stroke, independently of font weight. Chevron points right.</p>
<p><a href="https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UI-Foundations?node-id=3336-3818">Figma source</a> — Code Connect is pending publication and mapping confirmation. No screenreader, E-Ink, or WCAG acceptance is claimed.</p>
{{ uiPlayground(playground) }}
