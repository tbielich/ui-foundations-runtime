---
title: Foundation-001 – Token Layering Projection
status: active
type: foundation-decision
---

# Foundation-001: Runtime Token Layering Projection

The owner-authorized 2026-09-30 migration projects Core → Appearance
{Brand, Scheme, Scale} → Semantics → Patterns. Canonical decision rationale
lives in the [Vault ADR](https://github.com/tbielich/ui-foundations-vault/blob/main/decisions/token-model-and-figma-projection.md) (accepted via Vault PR #49). This is a bounded Runtime adoption,
not acceptance of a new governance pack.

The former foundation conflated Brand appearance with Semantics and described
an alias order inconsistent with the actual file. Its previous implementation
is available in Git history. The owner instruction takes precedence for this
bounded migration; consumed `.uif/packs/` are unchanged.

The Runtime adapter is `figma/token-projection.json`. It retains stable IDs,
WEB syntax and compatibility export filenames. Projection and verification
results are recorded in `figma/migrations/token-model-2026-09-30/`.

Patterns alias Roles; Roles alias an Appearance axis; Scheme may alias Brand
or Core; Brand and Scale alias Core. Existing literal pattern slots and
code-only projections are enumerated exceptions. See `verification.json` for
the independent Figma readback, resolved-value preservation and contrast results.

The separately authorized contrast repair is recorded in
`figma/migrations/contrast-repair-2026-09-30/REPORT.md`. Its current token pair,
Foreground, overlay and enabled Button state checks pass. The historical
migration verification remains preserved; bounded contrast checks do not
certify full component accessibility.
