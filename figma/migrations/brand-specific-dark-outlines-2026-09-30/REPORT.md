# Preserve brand-specific dark Outline borders

The preceding neutral-border fix passed contrast but incorrectly made all brands white. This correction adds one scoped Brand/Color/Border/Brand/Dark projection: A white, B existing Purple/600, C existing Blue/600. Scheme dark Color/Border/Brand consumes it. Neutral Strong Dark remains unchanged; original IDs, public names and palette values remain intact. All original live variable fingerprints and collection contracts match the expected bounded repair; current inventory is 767, of which 763 are projected.

The accepted UIF-VLT token-model ADR now requires brand identity and contrast as independent gates. Figma documentation records this rule and supersedes the shared-white fix. The user-requested durable memory note records the same requirement.

Chromium asserts each brand's exact dark Outline color for Default/Hover/Active/Focus and retains nonzero stroke and >=3:1 surrounding-canvas contrast checks across 24 Outline cases. All 72 enabled Button text contrast cases pass. Full ci:check passes with 182 unit tests and seven Chromium tests. Local Playground verifies purple Brand B and blue Brand C borders; screenshots are included.

Core and UILib remain untouched. Checks are bounded token/rendered evidence, not full component accessibility certification.
