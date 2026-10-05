---
schemaVersion: 1
kind: UIFLesson
id: lesson-stitch-bounded-design
status: draft
date: 2026-10-01
owner: ui-foundations
relatedPacks: []
affectedArtifacts:
  - DESIGN.md
  - docs/agentic/stitch/
shouldPromoteToVault: unknown
---

# Bound Stitch design freedom and verify outside the provider

## Context

Exploratory palette/documentation tests in the private
[UIF Stitch project](https://stitch.withgoogle.com/projects/3881338564019815597).
No production integration, token mutation, governed policy change or acceptance.
The original experiment used a local Runtime checkout predating the current
token projection; its observations do not supersede the accepted architecture.

## Observation

- A single 16-palette request failed with a user-observed unexpected error.
  Four smaller requests succeeded; causation by request size was not established.
- HTML checks found all 129 opaque and 20 alpha values from the supplied snapshot.
- Default screens introduced Tailwind, differing fonts and "Status: Festgelegt".
- Nine precomputed contrast rows were copied accurately, including 2.99:1
  remaining FAIL for large text. Browser token labels were nevertheless 11px
  and #8C8C8C, despite the dark-label instruction (about 3.36:1 on white).
- A targeted Brand-A correction preserved all 27 colors, used source CSS
  variables, removed CDNs and yielded observed text at least 14px in #1A1A1A.
- Import of a prose/CSS-only DESIGN.md created asset
  `d0bc5b511ed1471dacd42360effc0c33` with extra colors (surface #f9f9f9,
  primary #54651c, tertiary #7f4c81) and a rewritten token taxonomy.
- Two explicitly asset-bound screens (A/light `e0ef0cec1f3c41ea89e26f8f8db64c3f`,
  B/dark `9a8bc415ba1748d586d074b8a09e2add`) preserved the supplied CSS subset.
  Desktop computed styles confirmed six swatches, 14px minimum text, 32/44px H1,
  expected light/dark surfaces and 4px/2px brand card radii.

These are scoped local observations, not reproducibility or accessibility
certification. No mobile, full context matrix, axe, keyboard, or manual
screenreader validation. Actual Gemini version and rendered Inter font file
were not identified. The source evidence is summarized in
[experiment-summary.json](stitch-experiment-summary.json); transient download
URLs, credentials and generated application HTML are intentionally excluded.

## Decision

Use a small source-derived projection plus an explicit bounded task. Freeze
token values, names, semantics and evidence; allow only named layout changes.
Independently verify artifacts and computed styles. Preserve failures and repair
only the bounded defect. A successful self-report does not establish acceptance.

## Impact

Suitable candidate uses are palette docs, brand comparisons and constrained
documentation layouts. Stitch assets are provider context, not canonical token
sources. Intelligence enforcement remains a proposed integration; this change
only documents the task and verification responsibilities.

The native YAML projections are a follow-up hypothesis with local format/source
checks, not a successful Stitch roundtrip. Test import/readback before assuming
that native format suppresses generated colors.

## Should Flow Back To Vault?

Potential reviewed promotion candidate: provider-neutral bounded design tasks
and independent design verification. Status remains draft/unknown; do not change
Vault governance or its managed packs from this Runtime lesson.

## Affected Artifacts

- [Runtime contract](../../../DESIGN.md)
- [Stitch workflow](../../../docs/agentic/stitch/README.md)
- [Native Brand-A/Light snapshot](../../../docs/agentic/stitch/DESIGN.md)
- [Native Brand-B/Dark snapshot](../../../docs/agentic/stitch/brand-b-dark.DESIGN.md)
