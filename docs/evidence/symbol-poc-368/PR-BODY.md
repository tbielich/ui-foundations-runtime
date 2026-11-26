Adds an isolated comparison of existing Checkbox, Select and Button indicator rendering with five experimental CSS motifs. All changes stay in `docs/evidence/symbol-poc-368/`; production patterns, tokens, dependencies and exports remain unchanged.

Refs #368. This draft preserves the AgentTask, Kiro/Codex execution traces, measured footprint, screenshots, scoped repair findings and independent VerificationResult. See `REPORT.md` for the evidence and limits.

Recommendation: retain existing SVG/local CSS. Public Symbol Pattern remains HOLD. The candidate is approximate; the full DPR/zoom/weight/Forced Colors matrix, actual screenreader, physical E-Ink and live Figma fidelity remain BLOCKED. Additional Select automation was not introduced. Overall verification remains `needs_revision / defer` for human review despite passing repository checks.

Validation: `npm run lint`, `npm run test:unit` (260 tests) and `npm run ci:check` PASS. Original environment-related failures are retained. Two demonstrated PoC defects were repaired in one bounded iteration. Codex reported a transient root README edit/restoration; final baseline equality was independently checked, and the execution-boundary incident is explicitly retained.

No merge, release or production adoption authorized.

Milestone exception: discovery issue #368 has no assigned delivery milestone; this draft collects bounded experimental evidence for owner review.
