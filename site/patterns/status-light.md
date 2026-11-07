---
layout: layouts/docs.njk
title: Status Light
description: A labeled indicator for a current status.
navTitle: Status Light
order: 84
permalink: /patterns/status-light/
playgroundUrl: /patterns/status-light-playground/
playgroundLabel: Open Status Light Playground
---
{% import "macros/ui.njk" as uif %}

<div class="docs-hero"><div class="docs-hero-preview"><div class="docs-hero-preview-stage">{{ uif.statusLight("Online", variant="positive") }}</div></div></div>

Use a status light for a named condition such as Online or Unavailable. The visible label carries the meaning; the dot is decorative. Use Badge when a compact category or count is the main purpose.

Variants: `neutral`, `positive`, `negative`, `notice`, `info`. Sizes: `md`, `sm`. Unsupported variants fall back to neutral.

```html
<uif-status-light variant="positive">Online</uif-status-light>
```

```njk
{% raw %}
{{ uif.statusLight("Online", variant="positive", size="sm") }}
{% endraw %}
```

Import `ui-foundations/elements/ui-status-light` for the Custom Element. Change `label` to update text; removing it restores the initial text. Repeated variant and size changes preserve that label. Live announcements belong to the surrounding status region when needed.


<h2 id="tokens">Tokens</h2>

{% componentTokenTable "src/ui/patterns/status-light.css" %}
