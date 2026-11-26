---
layout: layouts/docs.njk
templateEngineOverride: njk
title: Content
description: Display formatted text, code examples and Unicode drawings.
navTitle: Content
order: 89
permalink: /patterns/content/
---
{% from "macros/component-docs.njk" import scaleSwitch %}
<div class="docs-hero">
  <div class="docs-hero-preview docs-content-preview">
    <div class="docs-hero-preview-controls">
      <span class="docs-hero-switch" data-hero-group="brand">
        <button type="button" data-hero-brand="a" aria-pressed="true">Brand A</button>
        <button type="button" data-hero-brand="b" aria-pressed="false">Brand B</button>
        <button type="button" data-hero-brand="c" aria-pressed="false">Brand C</button>
      </span>
      <span class="docs-hero-switch" data-hero-group="mode">
        <button type="button" data-hero-mode="light" aria-pressed="true">Light</button>
        <button type="button" data-hero-mode="dark" aria-pressed="false">Dark</button>
      </span>
      {{ scaleSwitch() }}
    </div>
    <div class="docs-hero-preview-stage">
      <div id="content-example" class="uif-content" aria-label="Content preview" style="inline-size:100%;min-inline-size:0"></div>
    </div>
      <div class="docs-hero-preview-controls docs-content-footer" role="group" aria-label="Content examples"><span class="docs-hero-switch">
        <button type="button" data-content-variant="formatted" aria-pressed="true" aria-controls="content-example">Markdown</button>
        <button type="button" data-content-variant="inline" aria-pressed="false" aria-controls="content-example">Inline code</button>
        <button type="button" data-content-variant="code" aria-pressed="false" aria-controls="content-example">Code block</button>
        <button type="button" data-content-variant="unicode" aria-pressed="false" aria-controls="content-example">Unicode</button>
      </span><p id="content-variant-description">Headings, paragraphs, lists and tables from Markdown.</p></div>

  </div>
</div>
<p>Content displays formatted text and code. Choose an example above to compare paragraphs, inline code, code blocks and Unicode drawings.</p>
<h2 id="render-content">Render content</h2>
<pre class="uif-code"><code>import { renderContent } from "ui-foundations/behaviors/content";
const view = renderContent(target, answer, { headingLevel: 3 });
// Plain-text output retains whitespace without Markdown interpretation:
renderContent(target, unicodeDrawing, { format: "text" });
// Use view.destroy() when discarding a retained render result.
</code></pre>
<h2>Unicode drawings</h2>
<p>Use <code>uif-code</code> to preserve spaces and line breaks in a UIF TextArea. Add <code>uif-code-grid</code> for drawings that need a one-em line height. Ordinary code keeps the normal text line height. The font must provide matching widths for spaces and drawing characters; these classes alone cannot guarantee connected lines.</p>
<label for="content-grid">Unicode drawing</label>
<textarea id="content-grid" class="uif-textarea uif-code uif-code-grid" rows="5" readonly wrap="off">╭────╮
│    │
│    │
╰────╯</textarea>
<h2>Supported syntax</h2>
<p>Paragraphs, ATX headings, nested ordered/unordered lists (space indentation), emphasis/strong, blockquotes, inline code, backtick/tilde fences, inline links and simple pipe tables. Code block language hints are not executed or highlighted. Headings start at <code>headingLevel</code> (default 2) and clamp at h6.</p>
<h2 id="behaviors">Behaviors</h2>
<h3>Security and fallback</h3>
<p>Pass a string, never prebuilt HTML. Source enters text nodes only. HTML, images, reference links, autolinks, task lists and unsupported constructs remain literal text. Links permit HTTP, HTTPS, mailto, fragments and explicit local paths; other protocols and control characters are rejected. This is a documented subset, not a CommonMark parser. No parser or sanitizer dependency is installed.</p>
<p>On a formatting failure, the original answer is rendered preformatted; the returned object retains <code>source</code> and reports <code>fallback</code>. Markdown above 200,000 UTF-16 code units becomes plain text; deeply nested blocks and very long inline runs also remain text. When Copy is enabled, re-rendering supersedes pending feedback and a failure announces a manual selection alternative.</p>
<h2 id="usage-guidelines">Usage guidelines</h2>
<h3>Accessibility and E-Ink</h3>
<p>Native headings, lists, links and tables remain navigable. Each code/table overflow region has a name and a keyboard stop. Copy is an optional consumer action: set <code>copy: true</code> to add a native button and polite success/failure feedback. It is off by default. Localize <code>labels.copy</code>, <code>copied</code>, <code>failed</code>, <code>code</code> and <code>table</code> for consumers. No animation, streaming, color syntax highlighting or hover-only controls are required. The example uses no animation. On the BOOX Max2 Pro, the legacy CSS bundle and a consumer-loaded DejaVu Sans Mono font restore UIF styles and aligned Unicode drawing rows. Clipboard access remains unavailable in the tested browser; Copy is optional. E-Ink refresh quality and screen-reader behavior need separate manual assessment.</p>
<p>Font families use the existing semantic Mono role with generic monospace fallbacks. Consumers load their chosen fonts. Unicode fallback glyphs and terminal cell proportions still depend on the font; a plain-text file cannot encode the browser's font or row spacing.</p>
<script type="module" src="{{ '/assets/content-example.js?v=content-stage-6' | sitePath }}"></script>
