# Components #55 Inline Alert and #62 Illustrated Message — decisions and blockers

Scope: implement the two owner-assigned Runtime components on top of the merged
indicators baseline (`dae8e5e`). Only these two components were touched; no
unrelated refactors. StatusLight, Meter and Progress Bar were read as
implementation and documentation examples and left unchanged.

## Component decisions

### Inline Alert (#55)
- Variants: neutral default plus `info`, `positive`, `negative`, `notice`.
- Parts: icon slot, title, optional description, optional action slot, optional
  dismiss button. Dismiss adds `is-hidden` and dispatches `uif-dismiss`; it does
  not remove the node.
- `role="alert"` on the container; decorative icons are `aria-hidden`; the
  dismiss control carries `aria-label="Dismiss"` and a visible focus ring.
- Default icons per variant: info-circled, checkmark-circled, cross-circled,
  exclamation-mark-circled; the neutral default renders no icon unless one is set.

### Illustrated Message (#62)
- Illustration slot, heading, description, optional action.
- Presets `empty`, `error`, `no-results` provide default heading, description and
  illustration icon (message-info, message-alert, search). Overridable.
- Light-DOM slots `slot="illustration"` and `slot="action"` replace the default
  icon and generated action.
- Retains v1 CSS class aliases via `:is(.uif-illustrated-message, .illustrated-message)`
  per the naming-migration contract for this component family.

## Scaling model
Both components adopt the established container scale context used by the merged
indicators:
- `data-scale` on a container sets `--_uif-context-scale`; the nearest container
  replaces the inherited context and never compounds it.
- A local `.sm` class sets `--_uif-local-scale` to the small factor.
- Typography, line height, spacing, gaps, illustration size and corner radius are
  multiplied by both private factors through the existing helpers.
- Border width is fixed geometry and is never scaled.
- No new public scale tokens were introduced; size factors come from
  `scripts/scale-context.mjs` (`--_uif-scale-small|medium|large`).

## Token provenance
- New pattern slots live under `Inline Alert` and `Illustrated Message` in
  `figma/exports/Patterns (UI).tokens.json` and follow the existing indicator
  discipline: every slot aliases an existing Semantics role, carries no
  `com.figma.variableId`, and is listed in `codeOnlyExceptions` in
  `figma/token-projection.json` (`id: null`).
- Full mapping is in `token-provenance.json` beside this file.
- No new semantic roles and no invented Core or Appearance names were added.

## Figma parity (OWNER-DEFERRED)
- Live Figma read is unavailable for this task. No node ids were fabricated.
- Code Connect files `schemas/web-inline-alert.figma.ts` and
  `schemas/web-illustrated-message.figma.ts` export inactive example renderers
  only and do not call `figma.connect()`, matching the indicator convention.
- Backlog items #55 and #62 remain open. Remaining work for the owner:
  1. Verify Figma component sets and publish them.
  2. Capture real node ids and property names.
  3. Activate `figma.connect()` and reconcile token identity, replacing the
     `codeOnlyExceptions` entries with verified variable ids.

## Known limitation: playground code tabs
- The playground live preview and the HTML code tab work through the registered
  vanilla renderers in `site/assets/playground/renderers.js`.
- The Nunjucks and Web Component code tabs are populated by
  `site/assets/playground/code-generators.js`, which is outside this task's
  allowed paths. No generator entries were added for `inline-alert` or
  `illustrated-message`, so those two tabs render empty for these components.
  The design checklist on each docs page records this honestly.
- Follow-up: add `njk` and `wc` generator entries for both renderers when
  `code-generators.js` is in scope.

## Validation note
Lint, unit and CI checks are run by the orchestrator after return. This agent
has scoped read/write tools only and did not execute tests.
