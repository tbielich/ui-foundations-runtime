# Issue 342 implementation contract

- `ui-foundations/behaviors/content`: `renderContent(target, source, options)` creates semantic DOM from a deliberately bounded Markdown subset; `format: "text"` renders preformatted text. Source is always retained in the return value; failures show the original source as text.
- `headingLevel` (default 2, range 1–6) remaps Markdown heading levels into the host outline, clamping at h6. Copy labels are caller-owned trusted configuration.
- Supported: ATX headings, paragraphs, nested ordered/unordered lists, emphasis/strong, blockquotes, backtick/tilde fenced code, inline code, inline links, simple pipe tables. Unsupported syntax stays readable text; no CommonMark claim. No HTML parser, raw HTML, images, auto-fetch, code execution, streaming or highlighting.
- No parser/sanitizer dependency is introduced. All output is created with DOM APIs and text nodes, with an allowlist for link protocols. Generated text never enters HTML sinks.
- Composition boundary: `.uif-content` + existing Button/Link/Table patterns. `.uif-code` is reusable on pre/code or a native textarea for unchanged Unicode/code output, including the Studio use case. No new token names: reuse existing semantic typography, color, spacing and border tokens after comparing current exports.
- Content rendering has no actions by default. Code blocks expose keyboard-focusable local overflow regions; `copy: true` opts into exact-content Copy buttons, per-block polite status and clipboard failure feedback. A richer Code Block pattern (line numbers, syntax highlighting, toolbar) is separate and not introduced. Labels and region names may be localized.
- Consumers use the published npm capability after release. Studio's dependency is not replaced with a sibling checkout. Pi integration is provided as a concrete patch against the current dirty chat source; original work is preserved. Physical BOOX acceptance remains pending unless hardware can actually be tested.
- Acceptance evidence: pure parser/security fixtures, real DOM security/copy tests, narrow/large-text overflow and all brand/scheme combinations, repository ci:check. No merge or package release is authorized by this implementation request.

## Owner-approved completion scope — 2026-11-26

- Integrated docs stage instead of a separate Content playground. Markdown opens first; Inline code, Code block and Unicode are selectable in a footer with a contextual description. No Anatomy section or duplicate Options table. Stable stage height avoids variant layout shifts.
- Brand left, scheme centre, optional scale right is shared Docs styling. Theme axes stay independent.
- Docs and Studio own font loading. DejaVu Sans Mono 2.37 is the candidate reference font: the inspected built-in repertoire has a single advance (1233/2048 em), including spaces, box drawing, quadrants and arc characters. Do not call these square cells.
- Runtime gains an explicit legacy CSS entry for the bounded BOOX target, generated from the same sources. It is not a universal CSS transpiler or a change to the canonical layer model.
- Merge and public package publication still require explicit final approval. Studio's actual dependency adoption waits for that published package; preparation can proceed without replacing its npm dependency with a sibling checkout.
