---
title: Usability Heuristics
description: Interaction quality rules that ensure patterns are usable, accessible, and predictable.
---

<p class="page-intro">
  Check whether people can understand a control, use it with a keyboard, and recognise its current state. The heuristics below connect those questions to pattern rules and validation.
</p>

<h2 id="heuristics-heading">Heuristic references</h2>

<p>
  Use these IDs in pattern rules and validation to record which interaction
  requirement a check covers.
</p>

<div class="docs-table-wrap">
  <table class="docs-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Implementation usage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>heuristic.feedback</code></td>
        <td>Feedback</td>
        <td>Used when a pattern must expose state, messages, focus, or updated content.</td>
      </tr>
      <tr>
        <td><code>heuristic.consistency</code></td>
        <td>Consistency</td>
        <td>Used when related controls must share naming, placement, state, or interaction behavior.</td>
      </tr>
      <tr>
        <td><code>heuristic.error-prevention</code></td>
        <td>Error Prevention</td>
        <td>Used when labels, grouping, required cues, disabled states, or constraints reduce avoidable mistakes.</td>
      </tr>
      <tr>
        <td><code>heuristic.recognition</code></td>
        <td>Recognition</td>
        <td>Used when actions and context must be visible rather than hidden behind memory or convention.</td>
      </tr>
      <tr>
        <td><code>heuristic.user-control</code></td>
        <td>User Control</td>
        <td>Used when a pattern needs reversible choices, cancellation, recovery, or clear current state.</td>
      </tr>
      <tr>
        <td><code>heuristic.accessibility</code></td>
        <td>Accessibility</td>
        <td>Used when semantic HTML, accessible names, keyboard access, visible focus, or assistive state communication are required.</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 id="traceability-heading">Traceability</h2>

<ul>
  <li>Pattern rules must cite the heuristic IDs they rely on.</li>
  <li>Component rules must implement the cited heuristics with semantic markup, state classes, tokens, or documented behavior.</li>
  <li>Validation prefers deterministic checks tied to these IDs.</li>
</ul>

<h2 id="usage-heading">Usage in Pattern Rules</h2>

<p>When documenting a pattern rule, reference heuristics like this:</p>

<pre><code>Cites: heuristic.feedback, heuristic.accessibility
Rationale: Checkbox checked state must be communicated via
:checked pseudo-class AND aria-checked for screen readers.</code></pre>
