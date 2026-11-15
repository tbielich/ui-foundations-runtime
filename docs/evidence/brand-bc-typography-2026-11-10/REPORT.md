# Approved A/B/C typography implementation

Final verification: 2026-11-11, Europe/Berlin. **Bounded implementation gate: PASS.**

## Repository and authority basis

- RUN: `tbielich/ui-foundations-runtime`, worktree `runtime-brand-a-typography`, branch `feat/339-brand-a-typography`, base SHA `03d195e2c481a1c415b226d21745dae951134f0c`. Changes are local and uncommitted.
- VLT accepted ADR basis: stable snapshot `34a1a4c4c14d0b354e79def7404ef9922b2255b8`. The currently inspected local Vault branch was `docs/add-repository-sanity-workflow` at `f4b9344de6b726377575115ba2f0f7ffe487cb61`; its relevant ADR and typography file hashes matched the stable snapshot. The token-model/projection ADR is accepted; `foundations/typography.md` remains review material.
- Explicit owner decisions select the three pairs, authorize implementation, request Basic fallback families and legal-risk review. No Vault or consumed-governance changes were made.
- Figma source: [UIF Library](https://www.figma.com/design/uqMsy8fV1fPbQdAzgwlmBA/UIF-Library?node-id=2004-103). Existing source IDs retained; current readback confirmed the selected aliases. This is a library-file update, not publication of a library release.

## Implemented policy

| Brand | Body | Selected functional UI | Headings |
| --- | --- | --- | --- |
| A | Inter400 | Inter600 | Roboto Slab700 |
| B | Exo 2 400 | Exo 2 600 | Orbitron800 |
| C | Manrope400 | Manrope600 | Bricolage Grotesque700 |

Both schemes use this typography policy. Functional UI600 covers Button, FieldLabel, Input, Badge and Link. Existing other control weights, helper prose400, Select400, Textarea consumer weight, icon geometry and required markers700 remain intact. Root text, Tabs, Accordion, Avatar and Tooltip now obtain their family from the existing semantic Base role; they no longer force Inter independently of Brand. Their existing weights are retained.

Figma adds four family primitives and Brand/Semantic heading-weight roles: IDs3274:2–3274:7. Brand Base/Lead/Heading and UI weight routes are updated in place. Existing native heading weight3:17 routes through the Brand heading-weight role, retaining text-style IDs. Native Figma probes resolved24 role-context combinations correctly and were removed afterwards. No broad library reconstruction or pixel-perfect all-instance parity claim is made.

The existing Sans/Serif/Mono CSS, JSON and TypeScript compatibility accesses remain. Runtime stacks explicitly append Basic Sans/Inter for text and B/C headings, Basic Serif/Rokkitt for A headings, then generic sans-serif/serif. Code ends in monospace. Figma family values remain single primary families; stacks are an ID-bound Runtime representation in the existing projection manifest. Basic taxonomy migration was not performed. Existing live SF-Mono WEB drift remains recorded and excluded from the partial sync.

All seven Runtime faces are local. Orbitron is the exact original upstream TTF; the other six are WOFF2. Licences, source hashes and notices are included in the package. Bricolage fixes optical size14/width100 to match observed Figma while preserving variable weight. Orbitron lacks uppercase sharp S in its upstream file; actual Inter per-glyph fallback was verified. No Apple SF Mono binary is distributed.

## Necessary repairs demonstrated by checks

1. Exo 2 was emitted as an unquoted CSS family literal; its numeric word made the computed family invalid. The generator now quotes numeric-word family literals in CSS only. JSON/TS literals remain unchanged. Actual-browser checks prove the repair.
2. Brand C's newly selected family/UI weight caused a nowrap Button to overflow320px under reader text-spacing:324.34px versus previous319.14px. Shared Button styling now caps inline size100% and allows normal wrapping. This is an explicit narrow exception to the initial wrapping freeze, required to repair the demonstrated adoption regression. No size/spacing tokens changed. Long A/B labels can now wrap too;12 short-Button comparisons showed no metric differences.

## Validation and evidence

- `npm run tokens:generate`: zero missing WEB, unparseable WEB or duplicate CSS names. Inputs came from the explicit11-ID Figma partial readback, not a broad export overwrite.
- `node --test tests/brand-font-stacks.test.mjs tests/brand-typography-context.test.mjs tests/font-family-compatibility.test.mjs`:9 focused tests passed.
- `npm run test:browser:only -- --grep 'long Button labels|Brand typography|local font delivery'`:8 affected tests passed before final CI.
- `npm run ci:check`, Node22.23.2: exit0; **241 unit and47 Chromium tests passed**. This includes lint, documentation/naming checks, rebuild, smoke, token/usage/DTCG/assets/rules checks, documentation build and browser tests. Exact output: `ci-check.log`.
- Final staged/commit whitespace check: PASS excluding byte-preserved upstream `src/assets/fonts/runtime/*-LICENSE.txt`. The upstream licences contain original trailing spaces/CRLF; those are retained to preserve licence hashes. Earlier unstaged checks did not inspect the then-untracked licence files.
- `npm pack --dry-run --json`: all7 shipping fonts and licences present, original Orbitron TTF present, obsolete Orbitron WOFF2 absent, no SF Mono binary. No package was published.
- Independent verifier:30 normal consumer,24 blocked-font,36 reflow and12 exact-heading cases. Initial C spacing FAIL is preserved as history. After repair:36 affected reflow cases; all18 final cases fit320px;12 short-Button comparisons remain unchanged;8 additional original-Orbitron main/core normal/blocked cases pass. No Google requests observed. `verification/independent-summary.json` and `verification/repair-summary.json` distinguish the two source states.
- Non-font token values were unchanged. A primary faces and normal metrics were preserved, with explicitly added fallback stacks and long-Button wrapping exceptions. Font-loading tests use real HTTP font failures and CDP actual platform fonts, not just computed family names.

Final source aggregate: `fbe5712f5ff9867bb40e36a3e39179d9300e75c259ffdddf5e3d0c859a9a6e70` across59 source files. Final main CSS SHA256: `756a253f5c1927349106aa98eeca746e26034cfdc6568b61f905f81cd81f3ffc`. Current CSS matches the independently frozen repair output ignoring generated timestamps. Full paths/hashes: `final-source-manifest.json`.

## Gates and remaining limits

| Gate | Result |
| --- | --- |
| Selected families/weights, both schemes | PASS |
| Bounded Figma variables/native role resolution | PASS |
| Real local font delivery, Basic/generic and missing-glyph fallback | PASS |
| Non-font token preservation | PASS |
| Demonstrated320px/text-spacing/root-font stress cases after repair | PASS |
| Required Runtime CI and package inventory | PASS |
| Bounded asset/licence technical review | PASS_WITH_NOTES; not a legal opinion |

Only Chromium/macOS was independently exercised. Root font-size200% is not actual browser zoom; true browser zoom was not executed. This does not certify WCAG conformance, all products, all Figma instances or all browsers. Upright font assets are supplied; no comprehensive italic policy is implemented. Font-file pair sizes are A468756B, B144676B, C120284B before additional fallback requests; these are file sizes, not LCP/network benchmarks.

The [legal-risk review](font-legal-review.md) records the removed Google import, current source-based legal context, licence conditions and scope. The older conversation experiment still has an external Google stylesheet and is outside the Runtime/docs shipping gate; it must not be published unchanged. Figma's own service, Studio's separate application, actual deployment hosting and unrelated third-party services were not legally certified.

No commit, push, PR, merge, runtime deployment, npm publication or Figma-library publication was performed. Source state and evidence are sufficient to review the local implementation without relying on chat history.
