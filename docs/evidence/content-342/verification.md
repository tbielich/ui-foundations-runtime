# Content and BOOX completion review — 2026-11-26

Baseline: Runtime `61347ff8fe93f1749d9dacd9ee23dce2be5897a8`, branch `feat/safe-content-342`. Exact candidate source hashes are in `completion-source-manifest.json`. This report supersedes earlier completion notes and the initial hardware failure status; historical device measurements remain in `boox/`.

## Result

Content renders a bounded Markdown subset using semantic DOM and text nodes. It preserves the source, rejects unsafe URL protocols, keeps raw HTML/images inert, and falls back to preformatted source on formatting failure or oversized input. Fenced code preserves line endings and whitespace. Copy is opt-in (`copy: true`), off by default, and reports clipboard failure accessibly. No parser dependency, Code Block toolbar, line numbers or syntax-highlighting capability was introduced.

The docs use one integrated stage: Markdown initially, then selectable Inline code, Code block and Unicode examples in a footer with contextual explanation. Stable stage height prevents variant shifts. There is no extra Playground, Anatomy section, duplicate Options table or external documentation link inside the example. Brand/scheme/optional scale alignment is shared Docs CSS, not a Content-only theme implementation.

## Font and legacy CSS

Docs load unmodified DejaVu Sans Mono 2.37 as a consumer-owned asset. Licence and source hash are beside the font. `font-selection.json` records coverage and one advance width for the tested built-in Drawpad repertoire, including spaces, box lines, arcs and quadrant blocks. The cells are not square, and arbitrary custom Unicode is outside that coverage claim. The existing Figma SF Mono primitive and Runtime token projection were not changed. The packed Runtime still contains no fonts or automatic font loaders.

`ui-foundations/legacy.css` is an opt-in fallback generated from the same sources in UIF layer order. It removes only the known top-level layer wrappers and fails on unsupported/nested layers or malformed source. It is not a universal CSS compiler, JavaScript polyfill or guarantee of identical cascade semantics. Normal specificity and important priority differ from layered CSS; see the public API boundary. Docs select it on the older WebView.

## Actual BOOX results

Max2Pro, Android 6.0.1, built-in Chrome 88 WebView, connected over USB. Local Content preview and a separate local Studio integration diagnostic were tested; production was unchanged.

- Content: fallback stylesheet loaded, tokens nonempty, DejaVu loaded, all three six-character rectangle rows measured 115.59375 CSS px at 32px. One-em row height applied; screenshot shows connected Unicode lines. Four variants switch with identical footer Y position and no page-wide overflow. Default rendering has no Copy button.
- Studio diagnostic: grid and subgrid gradients resolve to real colors, UIF controls are styled, source output uses DejaVu, Unicode uses compact line height while JSON returns to normal code line height. Weights remain 100–900, initial 400. A physical `adb input tap` changed Grid pressed state to false and removed guides; a second tap restored them. Output screenshot shows aligned Unicode joins.
- The first Studio diagnostic exposed an ordering defect: appending the flat bundle after the font-role override reset it to SF Mono. The prepared patch now inserts the fallback before the consumer font stylesheet; repeat measurements and screenshot passed. Baseline CSS corner joins also improve when the shared border-box reset is restored, but full renderer equivalence is not claimed.
- Clipboard denial remains an existing device limitation. Optional Copy keeps its tested failure feedback. Screenreader behavior, e-ink ghosting and stylus latency were not reassessed by this run.

Raw device measurements/screenshots: `boox/completion.json`, `boox/completion.png`, `boox/studio-completion.json`, `boox/studio-completion.png`, `boox/studio-output.png`, `boox/studio-physical-tap.json`.

## Validation

- `npm run ci:check`: exit 0; 267 unit, 129 Chromium and 12 bounded accessibility checks. Includes lint, docs, naming, build, token, asset, font-package and rule checks. `completion-ci.log` is the final serial run; its hash is recorded in `checks.json`.
- Initial runs identified stale fixed expectations for seven docs font faces and sixteen pattern cards. They now account for the added consumer font and Content card; no safety assertion was disabled.
- `npm pack --dry-run --json --ignore-scripts`: Content behavior/CSS and legacy CSS included; no Runtime font binaries. Full output in `package-dry-run.json`.
- Studio patch passes `git apply --check` against its recorded input and applies in a disposable fixture. The real Studio source, pinned npm package and public deployment remain unchanged. Pi patch keeps explicit opt-in Copy; consumer files were not overwritten.
- `git diff --check` and docs drift checks passed.

## Remaining sequence

Review Runtime PR → human-approved merge → approved npm release (proposed minor 1.2.0) → Studio installs that exact published package and applies the prepared integration with consumer font assets → consumer verification and separate Studio PR/deploy review.

No merge, release, production deploy or issue closure is claimed. Issue 342 also requires actual Pi adoption, which remains a prepared patch. Studio/npm adoption is distinct from the local integration diagnostic. Symbol work and TUI UILib are outside this change.
