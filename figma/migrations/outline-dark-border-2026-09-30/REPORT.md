# Dark Outline border visibility

Outline used a black Brand A border on a black dark canvas. One Scheme alias slot now resolves Color/Border/Brand Dark to the existing Brand/Color/Border/Strong/Dark contract. Default, Hover, Active and Focus consume this through existing semantic Border roles. No new variables or palette values are introduced; UIF remains separate from UILib.

All 766 live Figma variable metadata/value fingerprints and collection contracts were independently compared against the bounded expected snapshot. Projection verification passes. Chromium checks 72 enabled Button text contrast cases and 24 Outline border cases, requiring nonzero solid stroke and at least 3:1 contrast against the surrounding canvas. Brand A Dark explicitly requires white borders in all four states. Local Playground readback confirms a 1px white solid stroke, white text and black background.

Full ci:check passes: 182 unit tests and all seven Chromium tests. The initial projection check caught a legacy export-path mismatch (Strong/Dark versus Strong Dark); the original failure is retained, and the canonical manifest path is used in the final passing projection.
