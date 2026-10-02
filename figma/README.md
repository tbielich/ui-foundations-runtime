# UI Foundations — Figma Library

This Figma file is the single source of truth for the UI Foundations design system.

## Structure

The Figma file mirrors the same responsibilities used by Runtime. Collection
names describe where a decision belongs; they are not just folders.

| Page | Content |
|---|---|
| README | This overview |
| Tokens | Core, Appearance, Semantics, and Pattern variables |
| Components | Button, Input, Checkbox, Switch, Icon, Label, Link |
| Examples | Composed layouts and usage patterns |
| Assets | Icons and other exportable assets |

## Variable Collections

```text
Core
  ↓
Appearance
  ├─ Brand
  ├─ Scheme
  └─ Scale
  ↓
Semantics
  ↓
Patterns
```

| Collection | What it answers | Modes |
|---|---|---|
| Core (Primitives) | What raw values are available? | — |
| Appearance (Brand) | Which brand-specific values apply? | Brand A, Brand B, Brand C |
| Appearance (Scheme) | How does the current light/dark scheme resolve? | Light, Dark |
| Appearance (Scale) | How does the fluid scale resolve? | Min, Max |
| Semantics (Roles) | What does the value mean in the UI? | Value |
| Patterns (UI) | Where does a semantic role apply in a UI pattern? | Value |
| Interaction (States) | Local interaction/demo helpers; not a canonical token layer | — |

Brand, Scheme, and Scale are independent Appearance axes. Semantics stays
brand- and scheme-neutral so the same role can be used everywhere.

A Button hover color should therefore read as a chain of intent:

```text
Core color
  → Appearance (Brand + Scheme)
  → Color / Action / Surface / Hover
  → Button / … / Background / Hover
```

## Token Naming

Names should tell a reader what a token means without requiring them to know its
resolved color or brand.

Semantic color roles follow:

```text
Color/<Purpose>/<Role>/<State>
```

The default canvas pair may use the shorter `Color/<Role>/<State>` form.
Pattern tokens keep interaction state as the final segment:

```text
<Family>/<Variant?>/<Part?>/<Property>/<State?>
```

Examples:

- `Color/Action/Surface/Hover`
- `Color/Action/Content/Hover`
- `Color/Action/Foreground/Active`
- `Button/Solid/Container/Background/Hover`

UIF keeps `Active` as the established Runtime name for the pressed
interaction. Do not introduce `Pressed` as a competing state name.

`Surface` and `Content` form an accessibility pair for a specific state.
`Foreground` is for standalone action content such as text, icons, strokes, or
outlines when there is no paired filled action surface.

## Code Syntax (WEB)

Every variable should have a `codeSyntax.WEB` value set (e.g. `var(--uif-button-border-radius)`). This is how the token pipeline maps Figma variables to CSS Custom Properties.

## Token Foundry Plugin

Token Foundry is the companion plugin for this library. Install it from the organization plugin list.

### Validate

1. Select a component on the canvas
2. Open Token Foundry → Validate tab
3. Drop the project's `dist/main.css` or a token JSON file
4. Click "Validate Selection"

The plugin checks every variable binding against the CSS tokens and shows matches, mismatches, and wrong bindings. Use the Fix button to correct issues directly.

### Export

1. Open Token Foundry → Export tab
2. Click "Load Collections"
3. Download individual collections or all as ZIP

Place the exported JSON files in `figma/exports/` in the code repo, then run `npm run build:all`.

## Workflow

```
Design in Figma → Export via Token Foundry → figma/exports/*.json → npm run build:all → dist/
```

1. Design components using variables from the collections above
2. Set `codeSyntax.WEB` on every new variable
3. Export tokens via Token Foundry plugin
4. Hand off JSON files to the code repo
5. Code repo generates CSS, JSON, TypeScript, and docs automatically

## Links

- Documentation: https://ui-foundations.netlify.app/
- npm package: https://www.npmjs.com/package/ui-foundations
- Starter template: https://github.com/tbielich/ui-foundations-starter
- Code repo: https://github.com/tbielich/ui-foundations

## Token projection migration (2026-09-30)

Physical collections now distinguish Brand, Scheme, Scale and Roles.
`token-projection.json` records each variable ID, current Figma display name and
compatible export path. New semantic export paths are qualified with Semantics
because legacy scheme paths can share their names. `tokens:sync` uses this
adapter and preserves code-only sibling projections on partial imports.

`migrations/token-model-2026-09-30/` contains the bounded execution contract,
before/after Figma reads, reconciliation and verification evidence. The older
Liquid scale conflicted with Figma; its prior values are preserved as evidence.
