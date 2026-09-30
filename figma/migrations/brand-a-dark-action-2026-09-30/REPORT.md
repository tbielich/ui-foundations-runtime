# Brand A dark action inversion

Brand A Solid actions incorrectly remained black with white content in Dark mode. The earlier contrast repair passed contrast checks but did not assert the intended inversion.

The scoped `Brand/Color/Action/Surface/Dark` bridge resolves to existing white for Brand A and the existing dark Purple/Blue primitives for Brands B/C. Scheme dark `Color/Fill/Brand` consumes this bridge. Brand A dark On Brand Content resolves to existing black. Light Foreground retains its separate dark-primary contract. No UILib values are introduced.

Independent Figma readback covers all 766 variables. The execution contract permits exactly one addition and two alias-slot changes; all original metadata, collection contracts, IDs and public CSS names are preserved. Projection verification passes, including 72 Surface/Content pairs, 24 Foreground cases and 12 composited action-overlay cases (six disabled pairs remain exempt).

Chromium covers 72 enabled Solid/Outline/Ghost states across three brands and two schemes, and explicitly asserts Brand A Light black/white and Dark white/black. The actual local Playground confirms Dark white surface with black content (21:1); see `brand-a-dark.jpg`.

The initial verification run exposed a case-sensitive state lookup error in the new assertion (`default` versus `Default`); its failure is retained in `verification-first.log`. The corrected assertion passes. These checks provide bounded token and rendered Button evidence, not full component accessibility certification.

Final `npm run ci:check`: PASS, including 182 unit tests and all seven Chromium tests. Full output is retained in `verification-final.log`.
