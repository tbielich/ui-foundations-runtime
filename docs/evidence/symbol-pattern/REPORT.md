# Symbol Pattern — first experimental slice

Owner approved starting Symbol, adding the necessary default-stroke token in Figma, and making it similar to the existing SVGs. Implementation revision: `0f4ffefbbb40f3888b77f6398b1ff490a9bd18c0`; baseline: `61347ff8fe93f1749d9dacd9ee23dce2be5897a8`. Later evidence-only commits do not change the candidate source. candidate-state.json binds exact source hashes and validation commands.

## Delivered

Five decorative motifs: checkmark, dash, chevron (right), plus, cross. Native SVG root + one trusted path, inherited currentColor, contextual1lh sizing with1em fallback, variable stroke and round caps/joins. Geometry matches the existing source SVG path data exactly; this is not a claim of pixel-identical raster output across engines. Unlike Icon's fixed-stroke asset mask, Symbol styles the stroke directly. It uses more inline markup, with no universal compiler, asset migration, new dependency or blanket performance claim.

Integrated CSS, Nunjucks macro, optional light-DOM UISymbol/package export, docs, actual overview card, interactive playground and all three snippet formats. Input allowlists reject unknown/hostile motifs and normalize finite decimal weights to100..900, default400. Direct CSS authors must respect these experimental bounds; this is not a new typography or public design-weight scale. Parent text/control owns accessible meaning; Symbol itself is aria-hidden and nonfocusable.

Figma: [Symbol set](https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UI-Foundations?node-id=3336-3818). One new FLOAT variable `Symbol/Default/Glyph/Stroke-width/Default`, id `VariableID:3336:3817`, scopes STROKE_FLOAT, WEB `var(--uif-symbol-default-glyph-stroke-width-default)`, aliases existing semantic `Size/Border/Default` (`VariableID:3173:61`). It resolves to1. The five24x24 vector variants bind this token and retain ROUND caps/joins; review instances are separate from main components. Existing semantic content color is used only for the Figma preview. Runtime color and size remain inherited; no new color/size token was created. Existing token-sync workflow and ID projection were used; generated dist was not hand-edited.

## Independent verification

PASS: targeted Symbol suite6 checks; npm run lint; npm run test:unit266 tests; npm run ci:check including119 Chromium checks and12 accessibility checks. Existing browser checks do not imply full Symbol accessibility or raster-matrix coverage.

PASS: manual IAB package smoke proves all five paths render from the built package. Chromatic currentColor inheritance observed as rgb(192,32,128); source stroke widths .25px and2.25px at weights100/900 in24unit SVG coordinates; contextual boxes12/48px. Rendered caps/joins round, SVGs hidden and nonfocusable. The paragraph reset in the first smoke fixture supplied its own foreground; moving test color to the direct paragraph context verified actual inheritance without modifying production behavior. Full-page screenshots and exact observations are retained. Browser engine/DPR not bound by this manual smoke.

PASS: playground motif, stroke, parent color/line-height and HTML/Nunjucks/Web Component examples observed. Exact allowed-path checks pass. Dependency/lockfile, existing SVG assets, Checkbox/Select, root README and governance pack remain unchanged. package.json changes only add the Symbol element export.

Failures and corrections are preserved. Macro null/undefined conversion and array-type parity were repaired first. Integration completion refreshed the generated naming inventory, preserved the helper's source/package/docs import URL, registered exactly one existing-style code-only runtime slot, moved Symbol into the actual overview preview registry and filled the two missing snippet maps. The overview catalogue expectation changed16→17 because one Pattern was added; inert/theme/responsive assertions remain intact. No generic validator was disabled. The second integration repair group has several ordered validation checkpoints, all retained rather than relabeled as passes.

## Remaining gates

Canonical overall verification stays needs_revision/defer for review, despite passing repository checks. Code Connect is reference-only: no executable mapping or library publication was claimed. The figma-code-connect skill requires “Components must be published” and explicit confirmation of the matched code component before authoring its mapping. New Figma objects were not library-published by this run. Source link is usable now.

The full size/weight/DPR/zoom/Forced Colors matrix, actual screenreader and physical E-Ink remain outstanding. Old CSS-PoC footprint results are historical and not evidence for this native SVG implementation. No merge, release, native-control migration or stable production adoption is authorized.

Preview: http://127.0.0.1:8170/patterns/symbol-playground/ . Package diagnostic fixture: http://127.0.0.1:8171/docs/evidence/symbol-pattern/element-smoke.html .
