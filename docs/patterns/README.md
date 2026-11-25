# Patterns

## Purpose

Pattern docs describe reusable HTML/CSS composition rules and the implementation
surfaces that apply them.

Patterns are not component-governance pages. Component-facing documentation is
tracked from `docs/components/README.md`.

## Classification policy (WS5)

Runtime pattern/component docs use three explicit statuses:

1. **Implemented pattern** — canonical implementation exists in `site/` and/or
   `src/ui/patterns/`.
2. **Pattern guidance** — reusable guidance exists, but no dedicated runtime
   implementation page is required.
3. **Component placeholder** — reserved location only; not canonical behavior
   guidance until implementation docs exist.

## Pattern and component hierarchy map

| Doc | Classification | Status | Implementation source |
|---|---|---|---|
| `button.md` | Implemented pattern | Active | `site/patterns/button.md`, `src/ui/patterns/button.css`, `src/elements/ui-button.js` |
| `input.md` | Implemented pattern | Active | `site/patterns/input.md`, `src/ui/patterns/input.css`, `src/elements/ui-input.js` |
| `forms.md` | Pattern guidance | Active | `.kiro/steering/pattern-rules/forms.md` |
| `navigation.md` | Pattern guidance | Active | `.kiro/steering/pattern-rules/navigation.md` |
| `cards.md` | Implemented pattern | Active | `site/patterns/card.md`, `src/ui/patterns/card.css`, `src/elements/ui-card.js` |
| `breadcrumbs` | Implemented pattern | Active | `site/patterns/breadcrumbs.md`, `src/ui/patterns/breadcrumbs.css`, `src/elements/ui-breadcrumbs.js` |
| `tag` | Implemented pattern | Active | `site/patterns/tag.md`, `src/ui/patterns/tag.css`, `src/elements/ui-tag.js` |
| `skeleton` | Implemented pattern | Active | `site/patterns/skeleton.md`, `src/ui/patterns/skeleton.css`, `src/elements/ui-skeleton.js` |
| `search-field` | Implemented pattern | Active | `site/patterns/search-field.md`, `src/ui/patterns/search-field.css`, `src/elements/ui-search-field.js` |
| `number-field` | Implemented pattern | Active | `site/patterns/number-field.md`, `src/ui/patterns/number-field.css`, `src/elements/ui-number-field.js` |
| `segmented-control` | Implemented pattern | Active | `site/patterns/segmented-control.md`, `src/ui/patterns/segmented-control.css`, `src/elements/ui-segmented-control.js` |
| `range-slider` | Implemented pattern | Active | `site/patterns/range-slider.md`, `src/ui/patterns/range-slider.css`, `src/elements/ui-range-slider.js` |
| `combo-box` | Implemented pattern | Active | `site/patterns/combo-box.md`, `src/ui/patterns/combo-box.css`, `src/elements/ui-combo-box.js` |
| `feedback.md` | Pattern guidance | Placeholder summary | See TODO in page; no standalone feedback rule yet |
| `layout.md` | Pattern guidance | Placeholder summary | Foundations references only; no standalone layout pattern rule |
| `modal.md` | Component placeholder | Placeholder | No runtime component documentation yet |
| `notification.md` | Implemented pattern | Active | `site/patterns/toast.md`, `src/ui/patterns/toast.css`, `src/elements/ui-toast.js` |
| `popover` | Implemented pattern | Active | `site/patterns/popover.md`, `src/ui/patterns/popover.css`, `src/elements/ui-popover.js` |
| `select.md` | Component placeholder | Placeholder | No standalone select component documentation yet |

## Canonical rules

- `.kiro/steering/pattern-rules/*.md`
- `docs/agentic/rule-pipeline.md`

## Who should read this

- Designers defining reusable structures
- Engineers deciding whether logic belongs at pattern or component level
- Agents proposing new pattern rules

## Related docs

- `docs/components/README.md`
- `docs/principles/README.md`
- `docs/validation/ci.md`

## Reintegrated indicator patterns

StatusLight, Meter and ProgressBar have Runtime implementations, public element exports, Nunjucks macros and playgrounds. Their live Figma parity and active Code Connect mapping remain pending source access; see [bounded reintegration evidence](../evidence/simple-components-2026-11-07/README.md).

- [Status Light](../../site/patterns/status-light.md): named condition with a decorative dot.
- [Meter](../../site/patterns/meter.md): native scalar measurement within a known range.
- [Progress Bar](../../site/patterns/progress-bar.md): task completion and indeterminate loading.
