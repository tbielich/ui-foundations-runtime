# Stable Pattern typography names

Repository `tbielich/ui-foundations-runtime`, branch `fix/pattern-font-token-names`, base `3fa877f8dffb47be66322c8d102a0d533d45d982`. Owner requested stable public typography names without `compat` for every affected Pattern.

Seven generated default slots now use Button font-family/weight, FieldLabel font-family/weight, Badge font-family/weight and IllustratedMessage heading-font-weight. Existing exported Button/Badge/IllustratedMessage names are reused. Former names remain explicit deprecated override inputs (not generated aliases back to canonical tokens); if both are authored, old input retains priority to preserve consumers. All other Pattern font tokens already had stable names. Semantic ID/WEB bindings remain checked. Neutral context preserves the existing IllustratedMessage label-weight fallback using its verified semantic ID. Basic primitives and Figma values are unchanged.

The build previously stripped import layer(tokens), leaving raw token declarations unlayered. Reusing existing Pattern names exposed that these declarations overrode layered context values. Inlining now retains the declared token layer for unwrapped token exports. This is required for the canonical-name change; full browser coverage checks colors, type, geometry, contrast and behavior.

`npm run ci:check` with Node22.23.2: PASS,244 unit/60 Chromium tests. Includes A/B/C Light/Dark, neutral boundaries, local canonical family overrides, old override inputs and canonical IllustratedMessage weight overrides; npm pack has0 fonts/loaders. `git diff --check`: PASS. Log and source hashes accompany this report. Native rendering is still only verified with Chromium; no Figma or Vault mutation, publication or merge is included.

Owner subsequently requested merge on2026-11-11. Commit/push/PR/merge are authorized for this reviewed scope; npm release and protection changes remain excluded. Independent review: `review.json`.
