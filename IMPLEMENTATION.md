# UI Foundations — Implementation Guide

This file provides implementation details for working in this repository.

Follow `AGENTS.md` for operational rules and source priority.
Follow `docs/ui-foundations-rules.md` for the canonical governance model covering token layering, naming, brand/mode context, design-to-code parity, review criteria, and agent-readiness.
This file should add implementation detail, not redefine those rules.

---

## Project Overview

This is a token-first design system (`ui-foundations`).\
Figma is a design-authoring projection of the UIF token model. UIF-VLT owns durable architecture and contracts; UIF-RUN owns the consumable runtime projection.

Token flow: Figma Variables → JSON exports → generated CSS/TS/JSON → consumed by components

Tech stack:

- Vanilla CSS (Custom Properties + @layer)
- Node.js
- Eleventy (11ty)
- Light-DOM Web Components
- Nunjucks macros

---

## Figma MCP Integration — Implementation Flow

1. Call `get_design_context` for the target node
2. If truncated:
   - call `get_metadata`
   - then re-fetch specific nodes
3. Call `get_screenshot` and keep it as visual reference
4. Download assets (SVGs/images) from MCP response
   - use localhost URLs directly
5. Translate output into project conventions
6. Validate result against screenshot

Note: MCP output is a design reference, not final code.

This repository uses MCP as the active Figma integration path.
The Figma plugin under `figma/plugin/` is a standalone validation/export tool
loaded directly in Figma. It is not part of the site build or token pipeline, but
it is actively maintained — `scripts/generate-plugin-meta.mjs` generates its
entry file and `tests/plugin-code.test.mjs` covers its color utilities.

---

## Token Architecture

Current bounded projection: Core → Appearance {Brand, Scheme, Scale} →
Semantics → Patterns. See DESIGN.md for the canonical accepted Vault ADR. `figma/token-projection.json` maps physical Figma collections and variable
IDs onto compatible export paths; existing package subpaths remain unchanged.

- Brand: `Semantics (Brands).tokens.json` (compatibility filename)
- Scheme: `Appearance (Modes).tokens.json` (compatibility filename)
- Scale: `Typography (Fluid).tokens.json`; Min/Max compile globally to clamp()
- Roles: `Semantics (Roles).tokens.json`; export paths have a Semantics prefix
  to avoid collisions with legacy scheme paths
- Patterns: `Patterns (UI).tokens.json`; aliases consume Roles

Do not edit generated dist files. Use the ID-aware `tokens:sync` adapter;
new dump mode aliases include target IDs. Partial sync preserves explicitly
recorded code-only siblings. Alpha must survive color serialization.
The previous code-only Liquid endpoints conflicted with Figma and are retained
as historical migration evidence, not as a second live scale.

---

## Token Naming

- Canonical public pattern tokens follow the consumed Vault Naming Contract:
  `Component.variant.part.property.state` → `--uif-component-variant-part-property-state`
- All repository-owned component emitters use canonical `--uif-*` token names.
  Library-owned unprefixed component token aliases are intentionally not
  provided. Deprecated bare classes remain CSS-only compatibility selectors
  through v1.x and are not emitted by owned templates or generators.
- Appearance / Brand owns brand-specific visual identity; brand names do not belong in reusable semantic role names.
- Semantic colors use purpose/role/state paths such as `Color/Action/Surface/Hover`.
- Pattern state is the final segment. Existing Runtime states are `default`, `hover`, `active`, `focus`, and `disabled`; `active` remains the established name for the pressed interaction.
- CSS variables: kebab-case with `--`

---

## CSS Methodology

- Use CSS Custom Properties: `var(--token-name)`
- Use CSS Layers: `reset → base → tokens → context → components`

Runtime switching:

- `data-brand`
- `data-mode`

No:

- Tailwind
- CSS Modules
- styled-components

---

## Pattern Implementation

HTML patterns:

```html
<button class="uif-button solid" type="button">Label</button>
<button class="uif-button outline" type="button">Outline</button>
<input class="uif-input" type="text" />
<a class="uif-link">Link</a>
```

Legacy bare classes such as `.button`, `.input`, and `.link` are retained for
existing artifacts during migration and are reported as deprecated usage by
runtime naming checks. UIF-owned Button emitters use `.uif-button`; `.button`
is a CSS-only compatibility selector through v1.x.

Nunjucks:

```njk
{% import "macros/ui.njk" as uif %}
{{ uif.button("Label") }}
{{ uif.input(type="text") }}
```

Web Component (optional convenience layer):

```html
<uif-button variant="outline">Label</uif-button>
```

The public macro alias and Custom Element tag namespace are canonical `uif`.
The macro module path, element module filenames, JavaScript exports, and package
subpaths retain their existing names.

---

## File Locations

- CSS patterns: `src/ui/patterns/*.css`
- Web Components: `src/elements/*.js`
- Macros: `site/_includes/macros/ui.njk` (source), `dist/macros/ui.njk` (generated copy)
- Code Connect: `schemas/*.figma.ts`
- Token exports: `figma/exports/*.tokens.json`
- Generated tokens: `dist/tokens/`
- Docs: `site/`
- Rule pipeline docs: `docs/agentic/`
- Rule pipeline validation: `docs/validation/rule-pipeline.manifest.json`, `scripts/validate-rule-pipeline.mjs`

---

## Pattern Workflow

1. Update Figma token exports
2. Run: npm run build\:all
3. Add CSS pattern
4. Export pattern
5. Add or update the light-DOM Web Component (if needed)
6. Add Code Connect file
7. Add docs page

---

## Token Pipeline

Figma → exports → generate → dist → build CSS

Commands:

- npm run tokens\:sync — Figma dump → exports → generate (agent workflow)
- npm run tokens\:dump — prints Figma plugin code for MCP export
- npm run tokens\:generate — regenerate dist/ from existing exports
- npm run build\:css — build CSS bundles from generated tokens
- npm run build\:all — icons + tokens + CSS (full rebuild)
- npm run rules\:validate — check rule pipeline traceability
- npm run docs\:site — build documentation site

See `docs/token-sync-workflow.md` for the full agent-assisted sync workflow.

---

## Assets

- Icons: `src/assets/icons/`
- Use MCP-provided assets directly
- Do not add new icon packages
- No placeholders

---

## Validation Checklist

- Layout matches Figma
- Typography correct
- Uses tokens (no hardcoded values)
- States implemented
- Brand/mode switching works

---

## Key References

- docs/foundations/
- docs/agentic/
- Figma file
- Docs site
