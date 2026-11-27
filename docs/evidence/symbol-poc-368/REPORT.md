# UIF-RUN #368 — awaiting human review

Codex implemented the bounded PoC after the owner confirmed Kiro credits were exhausted and authorized substitution. Kiro receipts remain historical. No production integration is proposed.

Baseline: `61347ff8fe93f1749d9dacd9ee23dce2be5897a8`. Candidate implementation revision: `6e75a617e4deb84565de714360776a94d96424c6`. Candidate source hashes and required validation commands/results are in candidate-state.json. Later evidence commits do not change the CSS, HTML or measurement script at this implementation revision.

## Findings and recommendation

Continue the internal decorative-host candidate, focusing on adjustable stroke and inherited color. The owner explicitly prefers this host after inspecting the comparison: “Candidate decorative host funktioniert definitiv besser, stroke und color”. This is owner visual feedback; independent computed-style observations are recorded in decorative-host-observations.json. Keep existing Checkbox/Select implementations pending their own evidence. Public Symbol Pattern remains HOLD. All five candidate motifs reuse declarations across decorative spans and button::before; checkmark and dash also use native Checkbox::after. Select uses a separate progressive picker-icon adapter and retains native fallback. CSS caps, joins, proportions and dash sizing differ from baseline; these are approximations, not exact Figma or SVG fidelity.

For the declared modular cold-cache workload (100 repeats, each five decorative motifs plus checked input), footprint.json records baseline 1591 gzip / 1055 Brotli bytes and candidate 1066 gzip / 708 Brotli bytes. Candidate CSS alone costs more: 712 gzip / 600 Brotli bytes versus baseline 617 / 494. These resource-level figures exclude shared control/token CSS and HTTP overhead, assume compression and caching per documented resource, and do not model the production flat bundle. Different geometry and incomplete visual coverage prevent an adoption inference. Conservative whitespace/comment minification is not a production optimizer. Timing is unmeasured.

## Decorative-host follow-up

The owner authorized documenting this preference and focusing the next checks on the decorative host. No CSS, HTML or measurement source changed. Six interactive configurations cover five motifs at five sizes, weights 100/400/900, in light/dark (150 computed-style samples). All inherit the parent color and remain aria-hidden. At size24, checkmark/dash/chevron computed borders change from 0.5 to 1 to 2px; the theoretical stroke is 0.25/1/2.25px, demonstrating browser quantization. Plus/cross paint with currentColor gradients. These observations support parameter control, not complete raster-quality or cross-browser acceptance.

The source SVG mask Icon already supports currentColor; color inheritance is not exclusive to this candidate. The Select data URI is a separate image context. The owner preference concerns the visible decorative-host result and adjustable stroke, not a measured universal color advantage.

Next verification priority: decorative-host legibility/clipping at small sizes and weight extremes; DPR 1/2/3 and 100/200% zoom; Forced Colors; controlled chromatic parent colors. Keep equivalent-geometry and workload cost comparisons explicit. Actual screenreader/E-Ink and other hosts remain separately outstanding. No new browser infrastructure or Select automation is authorized by this focus change.

## Independent verification

- PASS: npm run lint; npm run test:unit (260 tests); npm run ci:check including existing browser and accessibility checks. Existing checks do not establish candidate matrix coverage.
- PASS: final production paths, token sources, assets, manifests, exports and root README match baseline.
- PASS, bounded smoke only: screenshots preview-light.png and preview-dark.png; actual visible native Checkbox state changes via Space; named and disabled control exposure. browser-observations.json records exact coverage.
- FAIL then repaired: pseudo-elements nested inside :is() did not paint; actual token filenames and brand context were wrong. repair-1-findings.json precedes the scoped repair; 1 of 2 repair iterations used.
- BLOCKED: full representative weight/DPR/zoom/Forced Colors matrix, live Figma fidelity, manual screenreader, physical E-Ink, additional Select automation. No new framework, browser matrix infrastructure or dependency was added.

Canonical overall VerificationResult is needs_revision / defer because required research quality evidence remains missing and the execution boundary incident is not erased. The narrower supplied-result required-check verifier is accepted; it does not certify the broader PoC.

## Execution incident and retained failures

Codex reported a transient unintended root README edit and restoration. The final root README equals baseline, but before/after snapshots do not prove transient compliance. Preserve this incident for human review; do not label execution fully scope-compliant. The existing Codex adapter uses a workspace sandbox and post-execution snapshots, not ACP-style per-file native enforcement.

Initial unit validation failed because generated dist JSON was absent. The first CI run used SITE_PORT=8168, while an existing test hardcodes 8099, causing connection refusal. Original logs are retained with initial- prefixes. Validation passed after normal generated outputs existed and the standard 8099 port was used. No production or test repair was performed.

## Human gate

Review the isolated artifact and evidence. This draft does not close #368, approve an internal shared utility, authorize public Pattern/API/tokens, or authorize merge/release. Further verification needs the stated available capability or applicable approval. Kiro raw RPC error remains sanitized; the owner's credit exhaustion explanation is attributed to the owner.
