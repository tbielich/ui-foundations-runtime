---
layout: layouts/docs.njk
title: Skeleton
description: Decorative loading shapes that mirror content without creating announcements.
navTitle: Skeleton
order: 95
permalink: /patterns/skeleton/
playgroundUrl: /patterns/skeleton-playground/
playgroundLabel: Open Skeleton Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage"><section aria-busy="true" aria-label="Loading holiday details">{{ uif.skeleton(shape="text", lines=3) }}</section></div></div><div class="docs-hero-meta"><a class="docs-page-link docs-page-link--playground" href="{{ playgroundUrl }}">{{ playgroundLabel }}</a></div></div>

Skeleton provides composable `text`, `circle` and `rectangle` shapes. The placeholders are always `aria-hidden`. Put `aria-busy="true"` and a concise loading label on the content region that the shapes represent; remove busy state when real content replaces them.

<h2 id="implementation">Implementation</h2>

```html
<section aria-busy="true" aria-label="Loading holiday details">
  <uif-skeleton shape="circle"></uif-skeleton>
  <uif-skeleton shape="text" lines="3"></uif-skeleton>
  <uif-skeleton shape="rectangle"></uif-skeleton>
</section>
```

`width` and `height` are optional CSS lengths for composition. Do not use placeholder geometry as the only loading message.

<h2 id="accessibility">Accessibility</h2>

The containing region owns the meaningful loading state; placeholder shapes never enter the accessibility tree. Shimmer stops when `prefers-reduced-motion: reduce` is active. Forced-colors mode replaces shimmer with visible system-color outlines. Shapes stay within their container at narrow widths and enlarged text.

<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/skeleton.css" %}

<h2 id="design-follow-up">Design follow-up</h2>

Live Figma shape/token reconciliation and Code Connect publication are deferred for issue #61. No Figma ID is claimed.
