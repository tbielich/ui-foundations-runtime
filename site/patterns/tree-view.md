---
layout: layouts/docs.njk
title: TreeView
description: Hierarchical navigation and selection with keyboard, pointer and lazy-loading support.
navTitle: TreeView
order: 107
permalink: /patterns/tree-view/
playgroundUrl: /patterns/tree-view-playground/
playgroundLabel: Open TreeView Playground
---
{% import "macros/ui.njk" as uif %}
{% set destinations = [
  { value: "europe", label: "Europe", expanded: true, children: [
    { value: "spain", label: "Spain" },
    { value: "greece", label: "Greece" }
  ] },
  { value: "americas", label: "Americas", children: [
    { value: "mexico", label: "Mexico" },
    { value: "canada", label: "Canada" }
  ] }
] %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.treeView(id="destination-tree", label="Destinations", items=destinations, selection="multiple", reorderable=true) }}</div></div><div class="docs-hero-meta"><span class="docs-status" data-status="stable">Stable</span><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

<script type="module" src="/vendor/ui-foundations/elements/ui-tree-view.js"></script>

## Behavior

TreeView uses `role="tree"`, nested `treeitem` and `group` semantics, explicit levels, expanded state and single- or multi-selection. One visible item is in the tab order. Arrow Down and Arrow Up move through visible items; Arrow Right expands or enters a branch; Arrow Left collapses or returns to its parent; Home and End move to the first and last visible items. Enter and Space select. Printable characters move to the next visible label that starts with the typed text.

Set `selection="single"`, `multiple` or `none`. Selection emits `uif-selection` with the affected `item`, its `value`, current `selected` state and the complete `values` array. Expansion emits `uif-toggle`.

## Reordering

`reorderable` enables pointer drag-and-drop with visible before, inside and after targets. The complete keyboard path uses Control+Shift+Arrow Up or Arrow Down to move among siblings, Control+Shift+Arrow Right to move into the previous sibling, and Control+Shift+Arrow Left to move after the parent. Every completed move retains focus and selection, announces the result and emits `uif-reorder` with the value, old and new parent, indexes, position and `method` (`pointer` or `keyboard`). Applications should provide an additional context-menu command when platform shortcuts conflict with local conventions.

## Lazy branches

A `lazy` item with no children dispatches a cancelable `uif-load` request when expanded. The detail contains `{ item, value, signal, resolve, reject }`. The host application owns data retrieval, listens for `signal.abort`, and calls `resolve(children)` or `reject(error)`. Collapsing during a request aborts its signal. Repeated values are ignored when children resolve, so retry and repeated responses do not duplicate direct children. Loading uses `aria-busy`; failure is announced with a retry instruction, and Enter or Arrow Right retries the branch.

The component does not fetch data or choose a persistence service.

## Accessibility

Hierarchy, expansion, selection, busy state and errors are programmatic and visible. Selection includes text and a check mark rather than color alone. Pointer drag has a complete keyboard alternative. Rows provide a 44 CSS pixel minimum target, wrap at 320 CSS pixels and 200% text, and preserve focus, hierarchy guides, drop cues and errors in forced colors. Reduced-motion mode removes transitions.

Automated Chromium and axe checks cover role, name, state, keyboard navigation, selection, reorder, lazy loading, focus retention, target size, zoom, forced colors and reduced motion. They do not constitute manual screen-reader certification.

## API

Elements: `<uif-tree-view>` and nested `<uif-tree-item>`. Tree attributes: `label`, `selection`, `reorderable`. Item attributes: `value`, `label`, `expanded`, `selected`, `lazy`. Read-only property: `selectedValues`. Events: `uif-selection`, `uif-toggle`, `uif-reorder`, and cancelable `uif-load`.

The `uif.treeView` macro emits the same authored hierarchy from an `items` array. Give each item a stable value before enabling reorder or asynchronous updates.

Live Figma component/token reconciliation, verified node/property identities and Code Connect publication for issue #58 are deferred. No Figma identifier is recorded by this technical implementation.
