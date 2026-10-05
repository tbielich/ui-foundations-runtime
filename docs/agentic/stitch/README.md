# Bounded Stitch design experiments

Status: exploratory Runtime guidance. No new governance, token API, or automatic
Stitch adapter is introduced. UIF remains separate from TUI UILib.

## Ownership and authority

Vault owns durable rules; use applicable stable/accepted sources and their
lifecycle/precedence. Runtime owns the current implementation and token
projection. Intelligence owns bounded execution and independent verification;
the existing contracts do not imply a working Stitch adapter. Provider prompts
are derived guidance and cannot override those authorities.

## Native DESIGN.md projections

[DESIGN.md](DESIGN.md) is a Brand A/Light documentation snapshot.
[brand-b-dark.DESIGN.md](brand-b-dark.DESIGN.md) is the separate Brand B/Dark
snapshot. Both resolve existing token values from Runtime commit `86e1d2a`,
generated from checked-in Figma exports. They are not live Figma reads.

The native format uses YAML frontmatter for colors, typography, rounded and
spacing, followed by Google's ordered Markdown sections. See the
[Google specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md).
Transport keys such as primary, h1 and card are local mappings, not new public
UIF tokens. The primary transport key is heading ink, not brand action-primary.
The source-name mapping must accompany each projection.

Before reusing either snapshot, regenerate tokens from the current exports,
resolve the declared context, and compare every projected value and alias with
its source. If a source changed, update the snapshot and provenance first.
Do not promote values from a Stitch-created asset back into UIF sources.
Brand and Scheme remain independent; these two examples do not establish a
Brand-to-Scheme coupling. Scale is not another data-mode value.

## Bounded execution

Use [task-template.md](task-template.md) for each invocation. Freeze colors,
names, typography, spacing, radii, content and evidence by default. Explicitly
allow only the changes needed for the task. Deliver the small relevant source
subset, projection and constraints together; do not send entire repositories.

If using the MCP design-system route, upload the projection, create the asset,
read back and compare its values, then explicitly pass the asset ID to screen
generation. An asset containing additional colors is not a lossless import.
Retain the discrepancy as evidence and request a bounded correction before
using it for work requiring exact preservation. A prompt prohibition alone is
not enforcement.

## Independent verification

- Compare parsed output tokens and resolved values against the source allowlist.
- Verify the exact Brand/Scheme attributes and separate context selectors.
- Inspect computed styles for swatches, text, surfaces, font sizes and radii.
- Reject newly invented values, roles, statuses or unauthorized dependencies.
- Calculate contrast outside Stitch; compare unrounded thresholds and reported
  PASS/FAIL separately from the rounded display ratio.
- Record source/output identity, checks, findings and manual-evidence gaps.

Treat failed or missing evidence as needs revision. Preserve the original result;
repair only a demonstrated defect within the same scope and declared budget.
No unlimited repair loop or automatic acceptance based on Stitch's summary.
Screenreader status remains manual; color contrast is not full WCAG readiness.

## Evidence and remaining uncertainty

The [local lesson](../../../.uif/workspace/lessons/stitch-bounded-design.md)
records the October 1 experiments. The earlier prose/CSS-only projection produced
two accurate screens despite extra colors in its generated asset. The native
YAML projections in this change have local format/source validation only; they
have not yet been imported into Stitch. Reduced palette invention is a hypothesis,
not a demonstrated effect. A full 2×2 Brand/Scheme matrix remains a future test.
