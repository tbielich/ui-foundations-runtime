# Tabs Figma reconciliation — 2026-11-15

Owner requested adapting Figma after the Runtime follow-ups. This explicitly
extends the earlier read-only Figma scope. File: `uqMsy8fV1fPbQdAzgwlmBA`,
component set `2535:286`, page `0:1`. Node identities, Selected variants and Label
property remain unchanged. [contract.json](contract.json) records pre-change state.

## Applied and verified

Both existing components now use their Tabs pattern tokens for inline/block
padding, default/selected text and selected underline. Default underline remains
transparent. They retain the existing Core border width, font size and line
height; font family follows existing Semantic Font/Base. Default weight is now
Medium (500), selected Semi Bold (600), matching Runtime. Existing text nodes and
component APIs were preserved. No variable aliases or collection modes changed.

Medium padding resolves to 16 inline/12 block, font size 16, line height 24 and
bottom border 2. Resulting auto-layout height is 50. The earlier fixed 80×33
components had 12/8 padding, font size 14 and AUTO line height.

The mutation returned changed IDs; a separate readback confirms bindings and
properties. The component screenshot was downloaded and visually inspected:
labels are visible, states are distinct, no clipping observed. See
[binding-write.json](binding-write.json), [readback.json](readback.json) and
[component.png](component.png). This is not a Brand/Scheme or S/M/L visual matrix.

## Open decision and limits

The existing active-color aliases match Runtime's Dark override, but not its
Light default brand surface. No existing Semantic role matches the combined
Runtime behavior across all three brands and both schemes. The owner was asked
whether to extend the Figma role projection while retaining Runtime or change
Runtime to existing Figma roles. This decision remains pending; neither alias
was rewritten.

Figma Appearance Scale currently has Min/Max endpoints. These are fluid source
endpoints, not native container Small/Medium/Large modes. No component-local size
variants or guessed shared context collection was introduced. Complete native
container S/M/L source projection remains open alongside color projection.

Live Figma edits are applied, source binding subset verified. Full Figma/Runtime
parity and publication are not claimed. No Code Connect or library publication.

## Owner decision resolved and color projection completed

The owner selected preserving Runtime behavior and adding the necessary Figma
roles. The pending color discussion above records the prior state and is now
superseded by this section.

Added two Appearance Scheme variables and two corresponding Semantic roles:
- Navigation active foreground: appearance `3303:2`, semantic `3303:3`.
- Navigation active border: appearance `3303:4`, semantic `3303:5`.

Both Scheme variables alias existing Brand source `2006:200` in Light and
existing readable Brand source `3214:2` in Dark. No numeric color values or new
collections were introduced. Existing Tabs active IDs `2789:40` / `2789:43`
now alias the new Semantic roles. Roles and Scheme values have explicit scopes
and WEB syntax. Existing Selected/Label identities remain intact.

The existing ID-aware token sync exported only the six approved changed
variables, merging untouched siblings. New projection entries preserve source
IDs and separate Appearance paths from prefixed Semantic paths. Generation
reports zero missing/unparseable WEB syntax and zero duplicate CSS variables.
The redundant Tabs Dark CSS override is removed. The same shared source chain
now resolves selected colors in Figma and Runtime.

Independent readback resolves all three Brands × both Schemes against the
prior Runtime source choices: PASS. Final comparison of all nine Tab variable
identities, names, WEB syntax and alias targets with exports: PASS. All six
Runtime before/after computed color, border, typography and padding records are
byte-identical. This resolves the earlier two active-color alias differences;
it does not erase the preserved prior FAIL evidence.

A compact review frame (`3305:3805`) contains 12 actual component instances,
two states in each Brand/Scheme context. Its screenshot was visually inspected:
labels and underlines are visible without clipping. No detached components or
extra size variants were created. This is a Medium/color matrix, not native
container S/M/L verification or manual accessibility certification.

Validation (Node 22.23.2, headless Chromium):
- `npm run tokens:sync`: exit 0; generation integrity counters all zero.
- `npm run lint`: exit 0.
- `npm run test:unit`: exit 0; 244 pass.
- `npm run ci:check`: exit 0; 244 unit + 74 Chromium pass.
- After the final documentation paragraph was reconciled, affected checks
  `npm run docs:lint`, `npm run docs:site` and the six color projection browser
  cases were rerun; implementation/export source stayed unchanged.
- `git diff --check`: exit 0.

Native Figma container S/M/L projection and library/Code Connect publication
remain open. No Appearance Scale Min/Max modes were replaced. No release or
follow-up merge is implied. No additional CLI/model executor calls were needed.
