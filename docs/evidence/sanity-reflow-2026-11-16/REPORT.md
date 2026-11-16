# Docs controls reflow repair — 2026-11-16

Main CI run [43770437412](https://github.com/tbielich/ui-foundations-runtime/actions/runs/43770437412), source `5dbed07a80c611448e3200a7f7f4ea4edb3cea27`, failed the Tabs playground check at 320 px with 200% root text on Node 22. Node 20 passed. The PR checks had passed before merge.

## Reproduced cause

The overflow belongs to the docs Brand switch and HTML/Nunjucks/Web Component code selector groups, not to the Tabs pattern. Their `transition: all` includes font geometry. An immediate assertion sampled an arbitrary transition frame and could pass before enlarged text exceeded the unwrapped controls.

On headless Chromium with 6x CPU throttling, three of ten unchanged runs measured document width 442 px in a 320 px viewport. The offending Brand group measured about 387 px and the code selector about 413 px. The original local test passed ten times without throttling. After waiting for finite animations to finish, the unchanged source fails deterministically.

## Repair and validation

Both docs-only groups now wrap and are bounded by their available inline size. No overflow hiding, token changes, Tabs pattern changes or brand-specific overrides are introduced. Reader text remains enlarged and all controls remain available.

The existing regression retains its overflow assertion and now waits for finite animations to finish before measuring enlarged geometry. The strengthened test fails on the prior CSS and passes ten consecutive times on the repair. Ten throttled diagnostic runs all measure 320/320 px. A 320 px / 200% screenshot was visually inspected for readable, wrapped Brand/Scheme/Scale controls.

The 200% root-font check is not a claim of real browser-zoom or cross-browser certification. Full repository and hosted validation are recorded separately on the PR and must pass before merge. Source hashes for the two affected files are in `source-manifest.json`.
