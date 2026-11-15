# Action label and Outline border parity

Outline label and border now resolve to identical brand-specific Foreground values in Light and Dark, across Default/Hover/Active/Focus. Ghost uses the same label Foreground. Solid remains paired Content on its filled Surface.

Dark Brand A is white; B uses existing Purple/300; C uses existing Blue/300. Brighter existing brand shades satisfy normal text contrast over Dark Hover/Active overlays. Light borders use the existing darker text realization. No palette literals, new IDs or CSS names are introduced. Four alias slots and one scope expansion are explicitly authorized in the execution contract; all 767 live variable fingerprints and collection descriptors match the bounded repair.

Tests require Outline label/border equality, Ghost/Outline Foreground equality, brand-specific dark colors, 24 visible Outline borders and 72 text contrast cases. Full ci:check passes with 182 unit tests and seven Chromium tests. Local B/C preview verifies identical computed label and border colors; screenshots are included.

The first independent projection check caught stale default-alias metadata; its failure is retained. The alias metadata was corrected and the final projection check passes. This is bounded token and Button evidence, not full component accessibility certification. UIF/UILib remain separate.
