# Notification

## Status

Implemented as the Runtime Toast pattern.

## Purpose

Toast provides transient, stacked feedback with info, success, warning and error variants. It supports configurable auto-dismiss timing, pause during pointer or focus interaction, an optional action, explicit dismissal and polite or assertive announcements selected by urgency.

## Canonical implementation

- Pattern documentation: `site/patterns/toast.md`
- CSS: `src/ui/patterns/toast.css`
- Custom Elements: `src/elements/ui-toast.js`
- Nunjucks macros: `toastRegion` and `toast` in `site/_includes/macros/ui.njk`
- Browser evidence: `tests/browser/toast-popover.spec.mjs`

Live Figma reconciliation and Code Connect publication are deferred. No Figma identity is recorded by this technical implementation.

## Related docs

- `docs/components/README.md`
- `docs/public-api.md`
- `docs/validation/README.md`
