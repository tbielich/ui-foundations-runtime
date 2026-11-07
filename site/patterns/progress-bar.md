---
layout: layouts/docs.njk
title: Progress Bar
description: Task completion with determinate and indeterminate states.
navTitle: Progress Bar
order: 86
permalink: /patterns/progress-bar/
playgroundUrl: /patterns/progress-bar-playground/
playgroundLabel: Open Progress Bar Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.progressBar(value=60, label="Uploading", showValue=true) }}</div></div></div>

Use Progress Bar for task completion. Use Meter for a measurement that is not a task.

```html
<uif-progress-bar value="0" label="Uploading" show-value></uif-progress-bar>
<uif-progress-bar label="Processing" indeterminate></uif-progress-bar>
```

```njk
{% raw %}
{{ uif.progressBar(value=0, label="Uploading", showValue=true) }}
{{ uif.progressBar(label="Processing", indeterminate=true) }}
{% endraw %}
```

Import `ui-foundations/elements/ui-progress-bar` for the Custom Element. `value`, `label`, `variant`, `size`, `show-value` and `indeterminate` update on attribute changes. Finite values are clamped to 0–100. Missing, empty or invalid Custom Element values are indeterminate; zero remains zero. Pass finite numbers or an empty value to the macro.

Variants: `default`, `positive`, `negative`. Sizes: `sm`, `md`, `lg`. A meaningful label names the progressbar. Determinate progress exposes `aria-valuenow`; indeterminate progress omits it and hides the numeric percentage. Reduced-motion preference disables the indeterminate animation.


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/progress-bar.css" %}
