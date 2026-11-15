# RUN #339: bounded Brand A typography implementation

Source basis: RUN `main@03d195e2c481a1c415b226d21745dae951134f0c`.
Owner-selected scope: A Headings Roboto Slab 700, Body Inter 400, and the reviewed
Button / Field Label / Input / Badge / Link functional text in Inter 600.
B/C resolved values and actual consumer inheritance remain acceptance constraints.
This is repository-local implementation evidence, not a Vault governance change.

## Canonical value route

The owner read/wrote Figma file `uqMsy8fV1fPbQdAzgwlmBA` and independently read it
back. `figma-before.json`, `figma-state.json`, and `figma-readback.json` retain that
execution's evidence. New values follow Core → Appearance/Brand → Semantics →
Patterns; stable existing variable IDs and compatibility CSS names are retained.

- New Heading family role separates Roboto Slab from shared Lead consumers.
- A Lead becomes Inter; B/C Lead stays Rokkitt. Body remains Inter 400.
- New Brand UI weight resolves A 600 / B,C 400; only Input and Link's existing
  Body-derived weight slots consume it. Select and other Body roles are unchanged.
- Illustrated Message's existing code-only Heading family projection consumes
  the Heading role. An optional weight hook activates A 700 while preserving
  B/C's existing declared 600 weight.

## Enumerated compatibility projection

`figma/token-projection.json` points to `brand-typography-compatibility.json`.
The manifest binds seven optional effective slots to stable semantic variable IDs
and WEB syntax. `scripts/brand-typography-context.mjs` fails closed on missing or
mismatched IDs, source file/path, WEB syntax or non-semantic sources.

Generated context CSS contains only variable assignments. Every root or explicit
Brand boundary resets the slots with the guaranteed-invalid `initial` value;
only the selected A context activates them. No pattern selector contains a Brand
name and no broad Brand-dependent typography override is introduced.

Button and Field Label roots fall back to their previous inherited typography.
Their named text spans and Badge text fall back to previous explicit Body/400,
not `inherit`. Icons and required markers are excluded; the required marker stays
700. Existing unused Button family/weight tokens are not globally activated.
This distinction preserves a B/C consumer's 500-weight monospace Button while
its composed span retains the prior Inter/400 behavior.

The docs snapshot adapter reads the same validated slot list, sets the selected
stage Brand, clears optional and previous snapshot properties, and preserves
unrelated authored inline geometry. This prevents an A root leaking A-only
slots into B/C stages after a nonempty-only token snapshot.

## Font delivery

The original Inter/Rokkitt Google Fonts import is unchanged. Only Roboto Slab is
newly self-hosted, with pinned binary/license/conversion metadata under
`src/assets/fonts/runtime/`. The public core CSS retains base-relative URLs;
flattened main.css rebases that face to package-relative assets. The docs mirror
copies those assets alongside its relocated vendor/main.css. No global Serif
primitive or existing B/C font-loading definition is replaced.

## Frozen and excluded

No color, shape, typography scale, Heading-margin, line-height, wrapping or reflow
repair is included. Textarea retains its prior inherited consumer weight rather
than being normalized to 400. Other Lead consumers follow the selected A Lead
family but receive no blanket UI-weight change. No Figma text-style binding or
unrelated component work is implied.

## Verification posture

Focused source-ID/alias tests and browser tests cover optional activation, B/C
consumer typography, protected marker/icon weights, and A→B→C→A docs transitions.
Computed family assertions are not actual platform-font proof. Independent
verification owns the complete B/C baseline-token/render matrix, actual-font
readback and public loading checks under `verification/`. Final validation and
acceptance remain separate from implementation completion.

## Approved concrete family catalogue and compatibility output

The owner rejected mixing Core category primitives Sans/Serif/Mono with a
concrete Roboto Slab leaf and approved one concrete catalogue: Inter, Rokkitt,
Roboto Slab and SF Mono. Existing variable IDs are reused. Figma names and WEB
syntax are canonical concrete-family names; Brand and semantic roles select them.

The projection deliberately retains the existing JSON paths Font/Family/Sans,
Font/Family/Serif and Font/Family/Mono as deprecated compatibility views. These
paths are not the canonical Figma catalogue. No new Inter/Rokkitt/SF Mono JSON
paths are claimed; Roboto Slab retains its already introduced concrete path.
The three original literal `$value` accessors remain unchanged.

`font-family-compatibility.json` enumerates the three stable source IDs and old
output names. The existing generator derives old CSS aliases and TypeScript
`tokens.typography` literal keys from the same canonical source values. No second
Core variable, authored primitive literal or duplicated canonical ID is added.
Existing Runtime rules and historical alias routes retain their generic CSS
reference syntax as an explicit compatibility projection, not canonical family
identity. The three old root overrides still affect existing consumers and roles.
A canonical concrete primitive override flows through its generic compatibility
alias to those same consumers. The generator emits concrete primitive literals
and old-name aliases in one direction only, avoiding cycles. No new consumer
should introduce additional generic family categories as canonical primitives.
