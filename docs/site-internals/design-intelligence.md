---
title: Design Intelligence
description: The reasoning layer that evaluates design quality beyond rule compliance.
---

<p class="page-intro">
  Review how a change fits the system as well as whether it passes individual checks. Consider its purpose, accessibility, and reuse across patterns.
</p>

<h2 id="system-lens-heading">Reviewing a change</h2>

<p>
  In this repository, design intelligence is applied as an implementation review
  lens for patterns, components, examples, and documentation. Use it to check
  whether a proposed implementation is appropriate for the system, traceable to
  existing rules, token-driven, accessible, and reusable.
</p>

<p>Before adding or changing a local implementation, ask:</p>

<ul>
  <li>Would this decision still make sense if repeated 100 times?</li>
  <li>Can this be reused? Can this scale?</li>
  <li>Can this be documented? Can this be automated?</li>
  <li>Can this become a pattern, token, or guidance?</li>
</ul>

<p>
  Record the reason for a change in its pattern documentation or review,
  including any limits on where it should be used.
</p>
