# Token Pipeline

## Overview

Use this page for pipeline mechanics and generated-output detail.

If you need the shorter developer overview first, start with:

- `docs/architecture.md`
- `docs/foundations/README.md`

Figma is a design-authoring projection of the UIF token model, not its source of truth. Durable architecture and contracts live in UIF-VLT; UIF-RUN provides the consumable runtime projection. `figma/token-projection.json` maps the Figma projection into compatible Runtime exports, and the generation pipeline transforms those exports into DTCG-compliant files consumed by CSS, TypeScript, and JSON tooling.

```
figma/exports/*.tokens.json
        │
        ▼
  npm run tokens:generate
  (scripts/extract-tokens.js)
        │
        ├─► dist/tokens/json/*.json   (DTCG 2025.10 format)
        ├─► dist/tokens/css/*.css     (CSS custom properties)
        ├─► dist/tokens/ts/*.ts       (TypeScript constants)
        └─► dist/tokens/tokens.yaml   (flat index)
```

## Source Format (Figma Exports)

Files in `figma/exports/` are direct Figma Variables REST API exports.

- `$type` uses Figma types: `color`, `number`, `string`
- `$value` aliases use Figma object syntax: `{"$ref": "Path/To/Token"}`
- Color values are Figma objects: `{colorSpace, components, alpha, hex}`
- `$extensions` contains `com.figma.*` metadata (variable IDs, scopes, code syntax, mode values)
- Multi-mode tokens store per-mode values in `$extensions.com.figma.modeValues`

These files are never edited manually. They are replaced on each Figma export.

## Source Files

The architecture and the filenames serve different purposes.

The **architecture** is:

```text
Core → Appearance {Brand, Scheme, Scale} → Semantics → Patterns
```

The Runtime keeps some older export filenames so existing consumers and build
steps do not break. `figma/token-projection.json` is the adapter between the
current Figma collections and those compatibility files.

| Current Figma responsibility | Runtime export file | Meaning |
|---|---|---|
| Core (Primitives) | `Core (Primitives).tokens.json` | Raw reusable values |
| Appearance (Brand) | `Semantics (Brands).tokens.json` | Brand axis; filename retained for compatibility |
| Appearance (Scheme) | `Appearance (Modes).tokens.json` | Light/dark scheme axis; filename retained for compatibility |
| Appearance (Scale) | `Typography (Fluid).tokens.json` | Fluid scale endpoints; filename retained for compatibility |
| Semantics (Roles) | `Semantics (Roles).tokens.json` | Stable, brand-neutral UI roles |
| Patterns (UI) | `Patterns (UI).tokens.json` | Pattern-specific usage tokens consuming semantic roles |

When reading or changing the system, use the **current Figma responsibility** to
reason about ownership. Treat the export filename as a compatibility detail.

## Pipeline Transforms

The generation script applies these transforms in order:

1. **Flatten & scope** — Tokens are extracted with path segments, CSS variable
   names (from `com.figma.codeSyntax.WEB`), and alias metadata.
2. **Mode expansion** — Files with `com.figma.modeValues` are split into
   separate token sets per mode/brand (e.g., light, dark, brand-a, brand-b).
3. **W3C type mapping** — Figma types are converted to DTCG types:
   - `number` → `dimension` (with `{value, unit}`) for spatial values
   - `string` → `fontFamily` for font family paths
   - `string` → `fontWeight` with numeric mapping for weight paths
   - `number` stays `number` for unitless values (z-index, columns)
4. **DTCG alias conversion** — `{"$ref": "Path/To/Token"}` → `"{Path.To.Token}"`
5. **Color normalization** — Figma color objects → hex strings (`#rrggbb` or `#rrggbbaa`)
6. **Extension cleanup** — All `com.figma.*` keys are stripped from `$extensions`
7. **Schema injection** — `$schema` pointing to DTCG 2025.10 is added to each file

## Dist Format (DTCG 2025.10)

Files in `dist/tokens/json/` follow the DTCG Design Tokens Format Module:

- `$schema` declares `https://www.designtokens.org/schemas/2025.10/format.json`
- `$type` uses DTCG types: `color`, `dimension`, `fontFamily`, `fontWeight`, `number`
- `$value` aliases use DTCG syntax: `"{Group.Path.Token}"`
- Color values are hex strings: `"#333333"`, `"#0000004d"`
- No Figma-specific metadata

## Dist Files

Generated files preserve stable package and build paths where changing them
would create unnecessary consumer churn.

| File | Architectural responsibility |
|---|---|
| `core-primitives.tokens.json` | Core primitives |
| `appearance-modes.tokens.mode-light.json` | Appearance / Scheme: Light |
| `appearance-modes.tokens.mode-dark.json` | Appearance / Scheme: Dark |
| `semantics-brands.tokens.brand-a.json` | Appearance / Brand: A (compatibility filename) |
| `semantics-brands.tokens.brand-b.json` | Appearance / Brand: B (compatibility filename) |
| `semantics-brands.tokens.brand-c.json` | Appearance / Brand: C (compatibility filename) |
| `typography-fluid.tokens.mode-min.json` | Appearance / Scale: Min (compatibility filename) |
| `typography-fluid.tokens.mode-max.json` | Appearance / Scale: Max (compatibility filename) |
| `semantics-roles.tokens.json` | Semantics / Roles |
| `patterns-ui.tokens.json` | Patterns |

## Why Some Names Look Older

The 2026-09-30 migration deliberately changed **responsibilities and alias
direction** without forcing a breaking rename of every generated artifact.

For example:

```text
Figma: Appearance (Brand)
        ↓ projection
Runtime compatibility file: Semantics (Brands).tokens.json
```

That does **not** mean Brand is part of the Semantics layer. The canonical
meaning comes from the accepted token model; the old filename remains an
adapter for existing Runtime consumers.

Compatibility guarantees:

- Existing package exports such as `ui-foundations/tokens/brand-a.css` and
  `ui-foundations/tokens/brand-a.json` remain available.
- Existing generated filenames can remain stable while Figma uses the clearer
  Brand, Scheme, Scale, and Roles responsibilities.
- `scripts/sync-figma-tokens.mjs` and `figma/token-projection.json` handle
  the mapping rather than asking consumers to understand migration history.
- Public CSS custom properties are not renamed solely to make internal
  filenames look newer.

This separation lets the architecture become clearer without turning a design
system cleanup into an avoidable breaking change.

## Validation

| Command | What it checks |
|---|---|
| `npm run tokens:validate` | Token file structure, alias resolution, CSS variable consistency |
| `npm run dtcg:validate` | DTCG compliance: alias syntax, color format, type vocabulary, schema |
| `npm run ci:check` | Full pipeline including both validators |
