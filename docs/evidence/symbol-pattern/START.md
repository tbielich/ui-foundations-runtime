> Historical proposal. Owner approved token creation and first implementation. Current decisions and results are in REPORT.md and execution-contract.json. The span/CSS approximation below is superseded by the SVG-faithful renderer.

# Symbol Pattern — first slice proposal

Status: proposed, not an implementation contract ready for dispatch.
Mode: implementation of this planning artifact only; no public code or tokens written.
Baseline: `61347ff8fe93f1749d9dacd9ee23dce2be5897a8`.
Owner intent: “ich würde gerne mit dem symbol pattern beginnen”.
Evidence: Runtime #368 / PR #369; decorative-host follow-up at `e84102f2f28693c035bdc42513f5468fb4b71cca`.

The owner's request starts a separate public Pattern work item. The historical PoC's prohibition on public Pattern implementation remains part of that experiment's record; it is not edited retroactively. Production adoption, merge and release remain separate decisions.

## Boundary and first API

Symbol renders elementary parametric geometry. Icon renders authored SVG assets. Both inherit currentColor; Symbol's distinguishing candidate responsibility is adjustable stroke and geometry without replacing asset ownership. This satisfies Foundation-009's distinct rendering responsibility hypothesis; it does not prove production utility for every motif.

Start with the positively reviewed decorative standalone host: one element, five motifs (checkmark, dash, chevron, plus, cross), inherited color, contextual size and controlled stroke. No native Checkbox/Select replacement, pseudo-element adoption requirement, wrapper requirement or universal compiler.

Proposed usage, not an exported API yet:

```html
<span class="uif-symbol plus" aria-hidden="true"></span>
```

Motifs describe geometry, not actions. The surrounding control/text owns meaning, accessible name, focus and interaction. First slice is decorative only; meaningful standalone symbols require a separately explicit naming contract. No independent disabled/hover/pressed state machine.

Contextual size should align with Icon's existing 1lh behavior, with a bounded override for geometry comparisons. Inherited color remains the default. Keep stroke-size separate from font-weight. The 100–900 exploration and 400=size/24 reference remain hypotheses until legibility and raster tests establish usable bounds. No stable public weight scale is declared by this proposal.

## Token naming proposal

Observed: no Symbol token family in the current Patterns (UI) source. Existing Icon currentColor is not evidence of Symbol token authorization.

Runtime `docs/agentic/assistant-behavior-rules.md`, rule 9, requires each new Pattern to have its own pattern-layer tokens and requires absent slots to be proposed in Figma's Patterns (UI) collection. Rule 10 requires aliases to exist. No pattern tokens are borrowed from Checkbox, Select or Button.

Proposed prefix: `--uif-symbol-*`. Candidate design slots for review, not existing exports:

| Proposed slot | Concern | Pending decision |
| --- | --- | --- |
| Symbol.default.glyph.stroke-width.default | Design-owned default stroke | Relative geometry value versus semantic alias; no accepted default yet |
| Symbol.default.glyph.size.default | Contextual size policy | Whether this belongs in tokens or should remain inherited 1lh/runtime sizing |

Color stays inherited currentColor; do not invent a semantic color alias or a redundant color token solely to satisfy a checklist. Motif ratios/angles are implementation geometry, not new Core tokens. No brand names in geometry naming. Review slots against the consumed variant/part/property/state naming contract before export.

The unresolved token decision is concrete: establish legitimate Symbol design slots in the actual Figma source, or explicitly authorize/document a narrow inherited-geometry exception to rule 9. Do not silently treat runtime CSS parameters as approved tokens. Figma file/node identity and exact alias/value choices are not resolved here; no Figma write is performed.

## CSS and integration scope

Proposed complete Runtime slice after the token/API decision:

- `src/ui/patterns/symbol.css`, imported by `src/ui/index.css`, within components layer.
- `src/elements/ui-symbol.js`, aggregate export in `src/elements/index.js`, package subpath export in `package.json`; light DOM and existing base helpers.
- `site/_includes/macros/ui.njk`: matching symbol macro, same semantic output.
- `site/patterns/symbol.md`, `site/patterns/symbol-playground.md`, renderer registration in `site/assets/playground/renderers.js`, entry in `site/patterns/index.md`.
- `schemas/web-symbol.figma.ts` only after a real Figma component/node exists; never fabricate connection IDs.
- `tests/symbol.test.mjs`: meaningful source/output and attribute safety checks following existing conventions.
- Repository-local contract, trace and independent evidence under `docs/evidence/symbol-pattern/`.

This list is a proposed integration inventory, not a finalized allowed-path contract. Materialize exact paths, source identities, validation bindings and budget before executor dispatch. No new dependency, React wrapper, compiler or Icon migration is proposed. Token changes, if chosen, must use the existing source-of-truth workflow; generated dist files are not manually edited.

## Docs and playground acceptance

Docs must distinguish CSS approximation from exact authored SVG geometry and mark experimental status honestly. Playground controls: motif, contextual size, bounded experimental stroke, inherited parent color and scheme. Show the real decorative host as the primary preview. Keep native controls outside this acceptance claim.

Independent acceptance:

- Five motifs at 12/16/24/32/48px; weight exploration only where explicitly exposed, including low/high limits.
- Actual chromatic parent colors as well as light/dark; preserve inherited currentColor.
- No clipping, missing paint or collapse; document border quantization rather than claiming linear raster thickness.
- DPR 1/2/3, zoom 100/200%, Forced Colors: exact observed coverage required, unavailable cells BLOCKED.
- Decorative host hidden from accessibility tree; surrounding label/control keeps accessible meaning. Screenreader and physical E-Ink remain separate actual-device evidence.
- No expanded browser/test infrastructure inferred from a new Pattern. Use existing approved capabilities; additional capability approval remains explicit.
- `npm run lint`, `npm run test:unit`, `npm run ci:check` for implementation changes.
- Re-measure equivalent workloads and geometry when source changes. Byte savings alone do not certify visual quality.

Current authorization covers starting this Pattern and preparing its bounded first slice. The owner's pending preference is contract-first versus direct isolated implementation. Public implementation cannot silently bypass the unresolved token rule. The PoC remains useful evidence and PR #369 remains separate.
