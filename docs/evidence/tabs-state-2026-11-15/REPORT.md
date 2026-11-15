# Tabs state preservation — 2026-11-15

Repository: `tbielich/ui-foundations-runtime`.
Issue: https://github.com/tbielich/ui-foundations-runtime/issues/36
Branch: `fix/36-tabs-state-preservation`.
Base: `29a183aee6941bc8e85e749ae5c1adbb97ba2f38`.
Scope and selection authority: [contract.json](contract.json).
Validated implementation file identities: [source-manifest.json](source-manifest.json).

## Result

Bounded local validation: **PASS**. Implementation and validation were performed
by the current assistant. There was no separate executor or independent reviewer;
this report does not claim an independent UIF-INT acceptance gate.

The three new real-Chromium tests all failed against the unchanged base Tabs
implementation, then passed against the repair. Before/after logs are retained.
- Attribute changes recreated tab buttons and nested tab-list wrappers.
- Switching panels discarded unsaved input values and attached event listeners.
- Updating a tab label recreated the button, unnecessarily losing its identity.

The repair creates each wrapper/button once, moves existing authored child nodes
rather than serializing their HTML, and updates observed attributes in place.
The regression tests also exercise horizontal/vertical navigation, disabled-tab
skipping, Home/End, Space, focus, selection and panel visibility. Docs describe
state preservation. No tokens, Figma bindings or other components changed.

## Exact validation

Environment: macOS, Node `v22.23.2`, repository lockfile installed with `npm ci`.
Node selected by prepending `/Users/Thomas.Bielich@tui.com/.nvm/versions/node/v22.23.2/bin` to PATH.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run docs:site` then `SITE_PORT=8136 npx playwright test tests/browser/tabs-state.spec.mjs` before repair | exit 1; 3 failed | [before.log](before.log) |
| Same commands after repair | exit 0; 3 passed | [after.log](after.log) |
| `npm run lint` | exit 0 | [lint.log](lint.log) |
| `npm run test:unit` | exit 0; 244 passed, 0 skipped | [unit.log](unit.log) |
| `SITE_PORT=8136 npm run ci:check` | exit 1; 62 browser passes, 1 connection failure | [ci-port-8136.log](ci-port-8136.log) |
| `npm run ci:check` at default port 8099 | exit 0; 244 unit and 63 Chromium tests passed | [ci.log](ci.log) |
| `git diff --check` | exit 0 | empty output |

The first full run used port 8136. Existing `docs-navigation.spec.mjs:58`
hardcodes port 8099, causing ERR_CONNECTION_REFUSED. The unchanged full suite
passed when rerun at its standard port. No test was skipped or rewritten.

Dependency installation reported 9 existing vulnerabilities (4 moderate, 5 high);
no dependency or lockfile was changed under this bounded task. Browser evidence
is Chromium-only; no manual screenreader or cross-browser acceptance is claimed.

## Delivery and remaining scope

Locally changed and validated. No commit, push, PR, merge or release performed.
The primary checkout and its pre-existing `.gitignore` change were untouched.
No additional Codex CLI, Cline or local Qwen calls were needed.

Issue #36 remains open. This slice does not establish complete size-variant,
Figma, Code Connect or full component accessibility acceptance. No GitHub issue
or comment was modified.

## Owner delivery authorization — 2026-11-15

The owner requested merging this fix and implementing the remaining follow-ups.
The local-only delivery statement above records the previous state. Commit,
push, PR and merge of this fix are now authorized. Release remains excluded.
Codex CLI review failed before model execution because its configured model
`gpt-6.1-sol` is unsupported for the current ChatGPT authentication. A local
Qwen Coder review is recorded separately; its findings are advisory and do not
replace the deterministic test results or human merge authorization.

Local Qwen review completed: no actionable introduced defects reported. The
response is retained in `local-qwen-review.json`; 2481 prompt tokens and 385
output tokens were measured by Ollama, total duration 26.67 seconds. This is a
local review with no hosted-model credits; it is not a savings comparison.
