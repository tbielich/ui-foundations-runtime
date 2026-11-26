# UIF-RUN #368 internal geometry PoC

Current independent results and recommendation: [REPORT.md](REPORT.md). The worker handoff below records the initial state before orchestrator validation and scoped repairs.

Public Symbol Pattern: **HOLD**. Recommendation: **provisionally retain existing implementations pending independent verification**. Worker self-report is not acceptance. No production adoption or integration.

Open `/docs/evidence/symbol-poc-368/comparison.html` from an existing repository-root static server. It loads actual Checkbox, Select, Button and Icon source CSS, plus optional existing generated token CSS. `dist/tokens/css` was absent during inspection: full baseline token styling and alias resolution are **BLOCKED**. No outputs were generated. Neutral docs layout is not a substitute token projection.

## Sources

Read `codex-contract.json` and fixed `thresholds.json` before implementation. Baseline revision recorded there: `61347ff8fe93f1749d9dacd9ee23dce2be5897a8`. Required design, operating, architecture and agent context was inspected. Direct task restrictions override normal integration and worker validation workflows.

Checkbox checked input::after uses the actual checkmark SVG mask; indeterminate input::after uses a rounded background bar. Icon already uses one element. Actual checkmark/plus/cross SVGs have round caps/joins and one-unit strokes in a 24-unit viewBox. Select embeds a rounded 1.5-unit chevron in a 16-unit viewBox, repeated across states and progressive picker content. Button supplies control styling and inherited color rather than motif geometry.

Figma `Patterns (UI).tokens.json` supplies existing Checkbox/Button WEB names and semantic aliases. `Core (Primitives).tokens.json` includes dash border/radius names. No new tokens or parity claim. Generated token comparison is BLOCKED by missing dist outputs. `scripts/generate-icon-list.mjs` lists source assets into schema; `scripts/build-css.mjs` copies modular assets and embeds local SVG mask URLs into the flat bundle. Modular-cache economics differ from flat main.css.

## Geometry and actual reuse

Internal `--poc-*` properties are experimental geometry parameters, not public tokens. Inherited currentColor paints each candidate. Stroke hypothesis: size / 24 × weight / 400; 100–900 exposed in hundred-step increments, initially 400. This is unrelated to font-weight. Sizes: 12/16/24/32/48px.

| Motif | Baseline standalone | Candidate actual hosts | Limitations |
| --- | --- | --- | --- |
| checkmark | Icon span using source SVG mask | span, button::before, checked input::after | Rotated border corner differs from asymmetric SVG path and rounded caps |
| dash | span reproducing indeterminate geometry | span, button::before, mixed input::after | Square-ended border; baseline remains fixed rem/token dimensions |
| chevron | span using actual Select data URI | span, button::before; separate select::picker-icon adapter | Border join/proportions differ; progressive picker adapter fixed at 400 |
| plus | Icon span using source SVG mask | span, button::before | Single element with two background layers, square caps |
| cross | Icon span using source SVG mask | span, button::before | Rotated plus; arm reach differs from SVG |

All five appear baseline versus candidate at each size. Shared declarations paint directly on standalone and pseudo hosts; no nested pseudo-elements. Real input checkboxes retain native checked/mixed/disabled properties and visible labels. Mixed state is set through indeterminate. Decorative spans are aria-hidden; real buttons carry visible text and empty decorative ::before. Native Select fallback is retained; picker-icon is progressive only. Generic ::before reuse is not portable on native Select. Input pseudo rendering is browser-dependent and unverified. Select is not automated. Baseline data-URI currentColor has its own image context and may not inherit host color.

Forced Colors strategy: borders for checkmark/dash/chevron; narrowly scoped forced-color-adjust:none plus ButtonText for background bars; Canvas/CanvasText for candidate Checkbox. Actual visibility is unverified. Subpixel low-weight strokes, clipping, rasterization and rounded-cap mismatch require independent inspection. These are approximations, never exact-fidelity claims.

## Footprint handoff

Orchestrator command, not executed by worker:

```sh
node docs/evidence/symbol-poc-368/measure.mjs
```

Node builtins only, stdout JSON, no writes. Reports actual raw/minified/gzip/Brotli CSS, SVG and printed markup payloads; shared utility subset; source hashes and runtime versions. Conservative minification removes comments/whitespace only. Compression uses gzip level 9 and Brotli quality 11 independently per resource. No timing inference.

Baseline extracts exact checked/mixed/Icon blocks and all Select image declarations, not entire pattern styling. Select extraction is a cost ledger, not runnable CSS. Decorative dash/chevron adapters are charged too. Whole candidate CSS includes adapters and Forced Colors. Utility cost is already included, not added twice.

Each of 1/100/1000 repeats includes five decorative motif spans plus one checked input. Cold baseline: HTML, CSS, three unique SVGs fetched once. Cold candidate: HTML and CSS. Warm: CSS/assets cached, HTML transferred. Compression applies separately to each resource; headers/TLS/CPU excluded. Shared control/token CSS and full demo overhead excluded equally. Embedded Select SVG is counted in CSS without another request. Equal motif counts do not establish visual equivalence or a threshold pass; independent verification must assess workload relevance. Flat production bundles have different cache behavior.

## Pending independent checks

| Check | Status |
| --- | --- |
| lint, test:unit, ci:check | BLOCKED: worker execution prohibited; orchestrator owns declared checks |
| Footprint output | BLOCKED: script not executed |
| 12/16/24/32/48 × weights 100/400/900 × DPR 1/2/3 × light/dark × zoom 100/200%, Forced Colors | BLOCKED: no cells visually observed |
| Candidate keyboard, names, checked/mixed/disabled semantics | BLOCKED: independent inspection required |
| Existing Button/Checkbox accessibility criteria | BLOCKED: orchestrator checks; does not imply candidate coverage |
| Screenreader | BLOCKED: pending tester |
| Physical E-Ink | BLOCKED: pending physical device |
| Select automation | BLOCKED: additional approval required; none included |
| Timing | BLOCKED: no reproducible timing measurement performed |

Acceptance requires demonstrated reuse without markup regression, all required observed quality evidence, and equivalent geometry+markup gzip AND Brotli costs no greater than baseline at 100 repeats. No acceptance or adoption claim is made here.

Observed worker changes: created only `candidate.css`, `comparison.html`, `measure.mjs`, `README.md` here. Existing evidence/contracts untouched. No validation, build, install, publication, Git mutation or delegation performed.
