# Mobile documentation and Playground navigation

The shared docs shell uses Core `Breakpoint/200` (Tablet Small, `max-width: 760px`) to replace
its left sidebar with a Menu button and a left modal drawer. Above that threshold,
the existing desktop sidebar and navigation remain unchanged. The original sidebar
node is moved into the native dialog; search, active links and expanded groups are
reused. No navigation markup or runtime pattern API is duplicated.

The Menu button exposes `aria-controls` and `aria-expanded`. Opening focuses the
Close button at the same viewport position and size as the Menu trigger; native modal dialog behavior contains focus and makes the background
inert. Close, Escape and a backdrop tap restore focus to Menu and restore the body's
previous inline overflow setting. Resizing to desktop closes the drawer and returns
the sidebar to its original position. Without JavaScript or native dialog support,
the original mobile navigation remains visible as a fallback.

This is docs-only composition under Foundation-009, using the existing docs palette
and sizing conventions (assistant rule 13), not a new UIF pattern or token family.
The 760px media-query literal mirrors the verified Figma export and generated
`--breakpoint-200` value; CSS custom properties cannot be used in media conditions.
CSS remains the sole owner of the breakpoint; JavaScript reads the toolbar's computed
display. Native dialog top-layer placement avoids a new z-index exception.

Verification: `tests/browser/docs-navigation.spec.mjs` exercises focus, dismissal,
scroll-lock cleanup, the 760/761px boundary, node reuse, and the no-JavaScript fallback
in headless Chromium. Safari/iOS and assistive-technology verification remain manual.

The generated “On this page” navigation moves into a slot immediately below
the breadcrumb and before the page title on mobile, with all links vertically stacked. Desktop keeps the sticky right
column. The same heading links and scroll spy are reused; no second TOC is created.
