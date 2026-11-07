---
layout: layouts/docs.njk
title: Meter
description: A scalar measurement within a known range.
navTitle: Meter
order: 85
permalink: /patterns/meter/
playgroundUrl: /patterns/meter-playground/
playgroundLabel: Open Meter Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.meter(label="Storage used", value=72) }}</div></div></div>

Use Meter for a measurement such as storage usage. Use Progress Bar for completion of an ongoing task.

```html
<uif-meter label="Storage used" min="0" max="200" value="72" value-text="72 of 200 GB"></uif-meter>
```

```njk
{% raw %}
{{ uif.meter(label="Storage used", min=0, max=200, value=72, valueText="72 of 200 GB") }}
{% endraw %}
```

Import `ui-foundations/elements/ui-meter` for the Custom Element. `label`, `value`, `min`, `max`, `variant`, `size` and `value-text` update on attribute changes. Defaults: min 0, max 100, value 0 for the Custom Element. The macro defaults to the 72% documentation example; pass value explicitly in consumer code.

Values are clamped to the range. Non-finite Custom Element inputs fall back to defaults. An inverted or empty range gets max = min + 1; an unrepresentable range resets to 0–100. Pass finite numeric arguments to the macro. Variants: `default`, `positive`, `notice`, `negative`. Sizes: `md`, `sm`.

A native `<meter>` exposes the name, bounds and current value. `value-text` adds a human-readable measurement through `aria-valuetext`. The styled track is hidden from assistive technology to avoid duplicate measurements. The native meter remains available without JavaScript when using the macro.


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/meter.css" %}
