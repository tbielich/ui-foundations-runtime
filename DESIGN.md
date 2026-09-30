# UI Foundations — DESIGN.md

## Source of Truth

This file is an agent-facing design contract.
It does not replace token files, Figma variables, ADRs, or component documentation.

Canonical sources:

- `AGENTS.md`
- `docs/ui-foundations-rules.md`
- `docs/foundations/`
- `figma/exports/*.tokens.json`
- `dist/tokens/css/*.css`
- `dist/tokens/json/*.json`

## Design Philosophy

UI Foundations is a token-first, Figma-aligned design system built for reliable
design-to-code parity. The system prioritises semantic intent over visual
guesswork.

## Token Architecture

The owner-authorized migration follows Core → Appearance {Brand, Scheme, Scale}
→ Semantics → Patterns. Durable rationale lives in the [Vault ADR](https://github.com/tbielich/ui-foundations-vault/blob/agent/uif-token-projection-migration/decisions/token-model-and-figma-projection.md)
(review; not a governance-pack promotion). Runtime's explicit projection is
`figma/token-projection.json`; collection labels and compatibility export paths
are different concerns. Brand and Scheme remain orthogonal; Scale endpoints
compile to global fluid values, not `data-mode="min"` or `data-mode="max"`.

Agents must never invent token names.
Use existing CSS custom properties from `codeSyntax.WEB` or exported token files.

## Context Model

Brand and appearance mode are orthogonal:

- `data-brand`
- `data-mode`

Brand and appearance must not be hardcoded into patterns.

## Color Rules

Use semantic tokens for UI decisions.
Do not use raw hex values in patterns unless explicitly documented.

## Typography Rules

Use existing typography tokens.
Do not infer font stacks, line heights, or weights from screenshots.

## Spacing Rules

Prefer semantic spacing intent where available.
Avoid arbitrary pixel values.

## Pattern Rules

Patterns must:

- use existing tokens
- support theming
- respect accessibility
- avoid hardcoded brand-specific styling
- match Figma/code naming where possible

## Accessibility

Generated UI must meet WCAG expectations.
Colour choices must preserve contrast.
Interactive states must be explicit.

## Agent Rules

Before creating UI:

1. Read this file.
2. Read `AGENTS.md`.
3. Inspect token exports.
4. Reuse existing tokens/patterns.
5. Validate with available scripts.
