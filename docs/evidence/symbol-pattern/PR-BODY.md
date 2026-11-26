Starts the experimental decorative Symbol Pattern after owner approval of its Figma stroke token and SVG-like geometry. Five fixed source motifs use native inline SVG, round caps/joins, inherited currentColor, contextual sizing and CSS-controlled stroke. Existing Icon assets and Checkbox/Select remain unchanged.

Includes the Figma semantic-alias token/projection, CSS, macro, optional Web Component/package export, docs, overview preview, playground and matching HTML/Nunjucks/Web Component snippets. No dependencies, compiler or asset replacement. Refs #368 and #369; this is a separate first implementation, not closure of the research issue.

Validation: six targeted Symbol checks, lint,266 unit tests and ci:check PASS (119 Chromium +12 accessibility checks). Independent source/scope checks, live Figma binding readback and manual package/playground observations are persisted in docs/evidence/symbol-pattern/REPORT.md. Intermediate failures and scoped corrections are retained.

Overall verification remains needs_revision/defer: Code Connect is reference-only pending library publication/mapping confirmation; full DPR/zoom/Forced Colors, screenreader and physical E-Ink coverage remain outstanding. No merge, release or stable adoption authorized.

Milestone exception: this owner-assigned experimental first slice has no agreed delivery milestone; the PR gathers code and evidence for review.
