---
inclusion: fileMatch
fileMatchPattern: "figma/exports/**"
---

# Token Export Rules

When working with files in `figma/exports/`, these rules apply:

## Structure
- Each file follows DTCG-like schema: `$type`, `$value`, `$extensions`
- `$extensions.com.figma.codeSyntax.WEB` defines the CSS variable name
- `$value.$ref` creates an alias to another token

## Alias Validation (Rule 10)

- Resolve aliases against the current Figma projection, not historical collection labels.
- Pattern tokens should reference `Semantics (Roles)` by default.
- Check `dist/tokens/css/semantics-roles.tokens.css` for reusable roles.
- Use `figma/token-projection.json` when a generated compatibility filename differs from the current Figma collection name.
- Never invent token names or variable IDs.
- If a needed semantic role does not exist, flag it for Figma creation instead of bypassing Semantics.

## Layer Rules

Canonical flow:

```text
Core → Appearance {Brand, Scheme, Scale} → Semantics → Patterns
```

For new work, Pattern tokens consume **Semantics (Roles)**. Direct Pattern
aliases to Appearance or Core are retained only where the migration explicitly
records a compatibility exception.

Pattern tokens must **NEVER**:

- Reference another Pattern token. Shared meaning belongs in Semantics.
- Introduce a direct Appearance/Core dependency merely to avoid defining a semantic role.
- Contain hardcoded color or design values where a token contract exists.
- Guess a target variable ID.

### No Cross-Pattern References (STRICT)

If two patterns need the same intent, both reference the same semantic role.

| Correct | Wrong |
|---|---|
| `Button/Border/Radius` → `Semantics/Shape/Corner/Control` | Button radius → another Pattern's radius |
| Calendar control radius → `Semantics/Shape/Corner/Control` | Calendar radius → Button radius |
| Input radius → `Semantics/Shape/Corner/Field` | Input radius → raw Brand corner token |
| Default border width → `Semantics/Size/Border/Default` | Pattern border width → raw Core value |

### Shape References

Brand owns the visual choice; Semantics exposes the reusable purpose.

| Semantic role | Typical use |
|---|---|
| `Semantics/Shape/Corner/Control` | Buttons and control-like surfaces |
| `Semantics/Shape/Corner/Field` | Inputs and field-like controls |
| `Semantics/Shape/Corner/Panel` | Cards and panels |
| `Semantics/Shape/Corner/Dialog` | Dialog/modal surfaces |
| `Semantics/Shape/Corner/Container` | General containers |
| `Semantics/Shape/Corner/Floating` | Floating surfaces such as tooltips |

Do not alias a Pattern directly to `Brand/Shape/*` for new work. The semantic
shape role is the stable contract.

### Size And Spacing References

Use the reusable semantic size roles where they match the intended purpose:

- `Semantics/Size/Border/None`
- `Semantics/Size/Border/Default`
- `Semantics/Size/Border/Thick`
- `Semantics/Size/Spacing/Tight`
- `Semantics/Size/Spacing/Component`
- `Semantics/Size/Spacing/Comfortable`
- `Semantics/Size/Spacing/Spacious`

Existing migration exceptions remain valid until separately migrated. Do not
copy an exception into a new Pattern.

## After Changes
- Run `npm run tokens:generate` and verify zero "missing alias targets"
- Run `npm run ci:check` to validate the full pipeline

## Creating New Pattern Tokens (CRITICAL)

When adding new tokens to `figma/exports/Patterns (UI).tokens.json`:

- **NEVER invent `targetVariableId` values.** The pipeline resolves aliases
  ID-first. A fake ID that collides with an existing token causes silent
  mis-resolution (e.g. spacing resolving to font-size).
- **Omit `targetVariableId`** from `com.figma.aliasData` if you don't know the
  real Figma variable ID. The pipeline will fall back to path-based resolution
  using the `$ref` value, which is always correct.
- Only use real IDs from Figma dumps or the Figma Plugin API.
- Keep `targetVariableName`, `targetVariableSetId`, and `targetVariableSetName`
  for documentation, but they are not used for resolution.

## Code Syntax Naming (codeSyntax.WEB)

The CSS variable name is derived from `codeSyntax.WEB` in Figma, NOT from the
JSON key structure. Common pitfalls:

- **Double segments**: If a Figma variable path is `Input/Border/Border Color Default`,
  the auto-generated syntax becomes `--input-border-border-color-default` (doubled).
  Fix: manually set codeSyntax to `var(--input-border-color-default)`.
- **Title Case duplicates**: Figma allows both `Badge/font-size/sm` and
  `Badge/Font Size Sm` — they produce the same CSS var name and cause duplicates.
  Fix: delete the redundant variable in Figma.
- **Validation**: `npm run tokens:generate` reports duplicates. Zero duplicates
  is required for CI to pass.

## On-Color Token Pattern

For text on colored surfaces, use `--color-text-on-*` tokens (not `--color-text-inverse`):

| Token | Use on |
|-------|--------|
| `--color-text-on-brand` | `--color-fill-brand` |
| `--color-text-on-danger` | `--color-fill-danger` |
| `--color-text-on-success` | `--color-fill-success` |
| `--color-text-on-subtle` | `--color-fill-subtle` |
| `--color-text-on-active` | `--color-fill-active` |
| `--color-text-on-disabled` | `--color-fill-disabled` |

These resolve per brand and mode. Prefer them over generic `--color-text-inverse`
in component tokens. Example: `--button-solid-text-color-default` references
`--color-text-on-brand`, not `--color-text-inverse`.
