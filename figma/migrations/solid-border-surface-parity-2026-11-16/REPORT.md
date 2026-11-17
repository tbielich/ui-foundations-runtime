# Solid Button border and surface parity

Owner-requested local repair after identifying the shared border-token coupling introduced by Runtime PR #317. Implementation changes are limited to the Default, Hover, Active, and Focus Solid Button border aliases in `figma/exports/Patterns (UI).tokens.json` and their target metadata. Each now references the same existing semantic Action/Surface role as its matching container background. Variable IDs, CSS names, scopes, Outline/Ghost bindings, shared Appearance roles, disabled behavior, and CSS focus behavior are preserved.

`execution-contract.json` records exact before/after source leaves. A comparison against HEAD confirmed that only these four alias values and their alias metadata changed in the Pattern export. Generated outputs were rebuilt with `npm run build:all`; no generated file was edited manually.

Validation: `npm run ci:check` passed (260 unit tests, 100 browser tests, 12 bounded accessibility tests). `git diff --check` passed. The existing browser contrast matrix now also asserts Solid border/base-background equality for all 24 enabled Brand × Scheme × State combinations while retaining Outline border/text equality, Outline contrast and brand-specific dark-border checks. Existing hover/active overlays are unchanged; this assertion concerns computed base colors, not pixel equality after overlay compositing.

Local Chromium Default-state measurements: Brand B border and fill both `rgb(151, 71, 255)`; Brand C border and fill both `rgb(12, 75, 243)`.

Status at local verification: implementation and live Figma aliases verified. Git commit and PR state are tracked by the repository and its pull request. Library publication was not performed. The initial MCP access denial concerned historical file `3G6kkLVF0AKQO2BeCpixiN`. A read-only inspection of the open Figma desktop window identified the active UIF Library as `uqMsy8fV1fPbQdAzgwlmBA`; MCP access to that file succeeded.

The four live border aliases were updated in place after validating their IDs, names, single mode, and previous targets. A separate readback confirmed that every live border and corresponding live container surface now alias the same semantic variable. IDs, scopes, and WEB syntax were preserved. `figma-mutation.json` records before/after values; `figma-readback.json` records independent parity checks. These four aliases now match the local export. No full-file synchronization or library publication is claimed.
