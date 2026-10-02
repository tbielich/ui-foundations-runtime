# Changelog

All notable UI Foundations release changes are documented here.

## 1.1.0 — 2026-10-02

### Added

- Added the Dialog pattern and Web Component, including its Figma schema and
  playground/documentation surface.
- Added a stable `Semantics (Roles)` projection so Patterns can consume
  brand- and scheme-neutral UI roles.
- Added automated token-projection verification and browser contrast coverage
  for interactive Button states.
- Added GitHub Pages pull-request previews and a cloud-ready task template for
  bounded agent execution.

### Changed

- Refined the token architecture to
  **Core → Appearance {Brand, Scheme, Scale} → Semantics → Patterns**.
- Separated Brand, Scheme, and Scale as independent Appearance concerns while
  retaining existing Runtime export filenames and package paths for
  compatibility.
- Aligned Button action Surface, Content, Foreground, and Outline behavior
  across brands, schemes, and interaction states, including dark-mode contrast
  repairs.
- Aligned Runtime, Figma, Playground, and agent guidance with the accepted UIF
  token model. Figma is documented as the design-authoring projection rather
  than the canonical source of truth.
- Improved Tooltip and Tabs behavior and added regression coverage for
  Datepicker interactions.
- Strengthened the npm release workflow with a staged publication gate and
  explicit maintainer approval before public release.

### Compatibility

- Existing public package paths, CSS compatibility exports, and established
  Runtime state naming remain available.
- Historical export filenames such as `Semantics (Brands).tokens.json`,
  `Appearance (Modes).tokens.json`, and `Typography (Fluid).tokens.json`
  remain compatibility adapters; they do not define architectural ownership.

## 1.0.0 — 2026-09-18

### Breaking changes

- Removed the deprecated `ui-foundations/react` entry point and all
  `ui-foundations/react/*` component exports. Web Components are the canonical
  framework-neutral convenience layer.
- Renamed UIF-owned public component token slots to the `--uif-*` namespace.
  v1 does not publish library-owned legacy component-token aliases.
- Renamed autonomous Custom Element tags from `<ui-*>` to `<uif-*>`.
  Legacy tags are not dual-registered.
- Canonical public Nunjucks examples now import the existing macro module with
  the consumer-selected alias `uif` and invoke macros as `uif.*`.

### Changed

- Canonical public component CSS classes use the `.uif-*` namespace.
- Legacy unprefixed class selectors remain deprecated compatibility aliases
  through the v1.x observation window; their removal is reserved for v2.0 or
  later.
- Runtime naming now consumes the Vault Governance Pack 0.8.0 naming contract.
- Tabs now implement the documented keyboard interaction model and synchronize
  the active tab with its controlled panel.
- Tooltip triggers now reference a stable tooltip ID through `aria-describedby`,
  preserving any pre-existing description references.
- Build, naming, token, DTCG, asset, documentation, and package checks are
  included in the repository release gate.

### Migration

Consumer migration guidance:

- `MIGRATION.md` — overall v1 migration boundary and component-family map.
- `docs/migrations/react-to-web-components.md` — removed React exports and
  Web Component alternatives.
- `docs/migrations/public-api-namespace-v1.md` — `ui` → `uif` public API
  namespace migration.

Published as `ui-foundations@1.0.0` on 2026-09-18 via npm staged publishing.
The `latest` dist-tag points to `1.0.0`.
