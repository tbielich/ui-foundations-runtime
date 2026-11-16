---
title: System Architecture
description: How UI Foundations is structured — from atomic layers to governance and quality controls.
---

<p class="page-intro">
  UI Foundations combines a layered token model with CSS patterns, optional
  Web Components, and validation. This page explains how those parts fit together.
</p>

<h2 id="layers-heading">Atomic Layers</h2>

<div class="arch-hero-table">
  <table class="docs-table">
    <thead>
      <tr>
        <th>Layer</th>
        <th>Chemistry</th>
        <th>Definition</th>
        <th>Location</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tokens</strong></td>
        <td>Subatomic particles</td>
        <td>Raw design values — colors, spacing, radii, typography. The physical constants of the system.</td>
        <td><code>dist/tokens/</code></td>
      </tr>
      <tr>
        <td><strong>Patterns</strong></td>
        <td>Atoms</td>
        <td>Smallest self-contained UI unit. CSS-only, stateless. Works without JavaScript.</td>
        <td><code>src/ui/patterns/</code></td>
      </tr>
      <tr>
        <td><strong>Components</strong></td>
        <td>Molecules</td>
        <td>Multiple atoms bound together with vanilla JavaScript for state and interactivity.</td>
        <td><code>src/ui/components/</code> (planned)</td>
      </tr>
      <tr>
        <td><strong>Compositions</strong></td>
        <td>Organisms</td>
        <td>Multiple molecules and atoms arranged for a specific task or use-case.</td>
        <td><code>site/examples/</code> (docs only, not shipped)</td>
      </tr>
    </tbody>
  </table>
</div>

<p>The binding energy that turns atoms into molecules is <strong>JavaScript and state management</strong>. If it works with pure CSS, it's a pattern. If it needs JS to function, it's a component.</p>

<p class="section-description"><strong>Note:</strong> Compositions live in <code>site/examples/</code> on the documentation site — they are reference implementations, not shipped library code. The "Examples" section in the navigation corresponds to the Organisms layer.</p>

<h2 id="token-layers-heading">Token Architecture</h2>

<p>
  The token model separates <strong>raw values</strong>, <strong>context</strong>,
  <strong>meaning</strong>, and <strong>UI usage</strong>. This makes it easier
  to understand why a token exists and what is allowed to change it.
</p>

<pre><code>Core
  ↓
Appearance
  ├─ Brand
  ├─ Scheme
  └─ Scale
  ↓
Semantics
  ↓
Patterns</code></pre>

<div class="docs-table-wrap">
  <table class="docs-table">
    <thead>
      <tr>
        <th>Responsibility</th>
        <th>Question it answers</th>
        <th>Example</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Core</strong></td>
        <td>What reusable values exist?</td>
        <td>Palette steps, spacing, radii, type values</td>
      </tr>
      <tr>
        <td><strong>Appearance / Brand</strong></td>
        <td>Which brand-specific value applies?</td>
        <td>Brand A, Brand B, Brand C</td>
      </tr>
      <tr>
        <td><strong>Appearance / Scheme</strong></td>
        <td>How should the value resolve in light or dark UI?</td>
        <td>Light, Dark</td>
      </tr>
      <tr>
        <td><strong>Appearance / Scale</strong></td>
        <td>How should a scalable value resolve?</td>
        <td>Min, Max fluid endpoints</td>
      </tr>
      <tr>
        <td><strong>Semantics</strong></td>
        <td>What does the value mean in the interface?</td>
        <td><code>Color / Action / Surface / Hover</code></td>
      </tr>
      <tr>
        <td><strong>Patterns</strong></td>
        <td>Where does that meaning apply?</td>
        <td><code>Button / … / Background / Hover</code></td>
      </tr>
    </tbody>
  </table>
</div>

<p>
  Brand, Scheme, and Scale are independent Appearance axes. Semantics stays
  stable across those contexts. Patterns normally consume Semantics rather than
  reaching directly into Appearance or Core.
</p>

<h3>Example: a Button hover state</h3>

<p>
  A Button does not need to know the brand's actual hover color. It asks for a
  semantic role, and the layers below resolve the correct value:
</p>

<pre><code>Core color
  → Appearance (Brand + Scheme)
  → Color / Action / Surface / Hover
  → Button / … / Background / Hover</code></pre>

<p>
  The same principle applies to accessible color pairs. A state-specific
  <code>Surface</code> role is paired with its <code>Content</code> role;
  <code>Foreground</code> is reserved for standalone action text, icons,
  strokes, or outlines.
</p>

<p class="section-description">
  <strong>Compatibility note:</strong> some generated Runtime filenames still
  contain older collection names. They are intentionally retained to avoid
  breaking consumers and do not redefine the architecture.
</p>

<h2 id="governance-heading">Governance &amp; Quality</h2>

<p>
  Design principles guide pattern and component decisions. Rule IDs connect
  those decisions to documented requirements, validation, and CI.
</p>

<div class="docs-table-wrap">
  <table class="docs-table">
    <thead>
      <tr>
        <th>Layer</th>
        <th>Purpose</th>
        <th>Examples</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong><a href="principles.md">Design Principles</a></strong></td>
        <td>Guide token use, semantic markup, and pattern responsibilities</td>
        <td>Pattern-rule citations and component documentation</td>
      </tr>
      <tr>
        <td><strong><a href="heuristics.md">Usability Heuristics</a></strong></td>
        <td>Check feedback, consistency, error prevention, and user control</td>
        <td>Rule pipeline and validation manifest</td>
      </tr>
      <tr>
        <td><strong><a href="design-intelligence.md">Design Intelligence</a></strong></td>
        <td>Review system fit, accessibility, and reuse</td>
        <td>Pattern, component, and docs review</td>
      </tr>
    </tbody>
  </table>
</div>

<p>Pattern rules must cite principle and heuristic IDs. Component rules must preserve the cited pattern intent. This traceability ensures every visual decision can be traced back to a documented rationale.</p>

<h2 id="context-heading">Brand, Scheme And Scale</h2>

<p>
  Brand, Scheme, and Scale are separate Appearance concerns. Runtime exposes
  Brand and Scheme as consumer-controlled data attributes; Scale is compiled
  from its fluid endpoints.
</p>

<p>Brand and Scheme are applied via:</p>

<ul>
  <li><code>data-brand="a|b|c"</code> — switches color palette, typography, and corner radii</li>
  <li><code>data-mode="light|dark"</code> — switches semantic color mappings</li>
</ul>

<p>Patterns never hardcode brand or mode values. They reference semantic roles that resolve differently per context.</p>

<h2 id="pipeline-heading">Build Pipeline</h2>

<p>The system flows from Figma to production in a one-directional pipeline:</p>

<div class="pipeline-flow">
  <div class="pipeline-step">
    <span class="pipeline-step-label">Figma Variables</span>
  </div>
  <div class="pipeline-arrow"><span>export</span></div>
  <div class="pipeline-step">
    <span class="pipeline-step-label">figma/exports/*.tokens.json</span>
  </div>
  <div class="pipeline-arrow"><span>npm run tokens:generate</span></div>
  <div class="pipeline-step">
    <span class="pipeline-step-label">dist/tokens/css/*.css + tokens.yaml</span>
  </div>
  <div class="pipeline-arrow"><span>npm run build:css</span></div>
  <div class="pipeline-step">
    <span class="pipeline-step-label">dist/main.css (bundled, layered)</span>
  </div>
  <div class="pipeline-arrow"><span>npm run docs:site</span></div>
  <div class="pipeline-step">
    <span class="pipeline-step-label">_site/ (documentation website)</span>
  </div>
</div>

<p>Generated files in <code>dist/</code> are never edited directly. Changes flow from Figma exports through the pipeline.</p>

<h2 id="validation-heading">Validation</h2>

<p><code>npm run ci:check</code> validates the full system:</p>

<ul>
  <li>Lint — JS syntax correctness</li>
  <li>Unit tests — token pipeline logic</li>
  <li>Build — generates all dist artifacts</li>
  <li>Smoke check — verifies critical outputs exist</li>
  <li>Token validation — zero missing aliases, zero duplicates</li>
  <li>DTCG validation — schema compliance</li>
  <li>Asset check — all referenced icons/assets exist</li>
  <li>Rule pipeline — principles and heuristics are properly cited</li>
</ul>
