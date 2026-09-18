---
layout: layouts/docs.njk
title: Dialog Playground
description: Interactive preview for the Dialog component.
navTitle: Dialog Playground
order: 22
permalink: /components/dialog-playground/
templateEngineOverride: njk
isPlayground: true
breadcrumb:
  - label: Components
    url: /components/
  - label: Dialog
    url: /components/dialog/
  - label: Playground
playground:
  id: dialog-playground
  queryPrefix: dialog
  runtime: vanilla
  renderer: dialog
  tokenCssPath: src/ui/patterns/dialog.css
  controls:
    - kind: text
      name: title
      label: Title
      query: true
      default: Confirm action
    - kind: text
      name: description
      label: Description
      query: true
      default: Review the information before continuing.
    - kind: switch
      name: dismissible
      label: Dismissible
      valueType: boolean
      query: true
      default: true
    - kind: switch
      name: open
      label: Open
      valueType: boolean
      query: true
      default: true
    - kind: text
      name: confirmLabel
      label: Confirm Label
      query: true
      default: Confirm
    - kind: text
      name: cancelLabel
      label: Cancel Label
      query: true
      default: Cancel
---

{% from "macros/playground.njk" import playground as uiPlayground with context %}

{{ uiPlayground(playground) }}
