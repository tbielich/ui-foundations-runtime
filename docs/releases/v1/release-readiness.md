# UI Foundations v1 Release Readiness

This is the only release-tracking document that should be updated during implementation.

## Status

- Governance Baseline: frozen
- Audit Baseline: frozen in `docs/audits/v1/`
- Execution mode: implementation

## Critical path

- E1 Foundation: Governance Baseline
- E2 Foundation: Specification Lifecycle & Versioning
- E3 Runtime: Reproducible Release Pipeline
- E4 Intelligence: MCP Contract Hardening
- E6 Runtime: Accessibility Baseline

## Release-readiness dry-run (non-publishing)

A manually dispatched, read-only workflow produces revision-bound release
evidence without publishing, staging, versioning, tagging, or deploying.

- Workflow: `.github/workflows/release-readiness.yml`
  (`workflow_dispatch`, `permissions: contents: read`, no publish credentials).
- Collector: `scripts/release-evidence.mjs`
  (also runnable locally via `npm run release:evidence`).

How it works:

1. Dispatch the workflow with an explicit `ref` (branch, tag, or SHA). The job
   resolves and records the immutable checked-out source SHA. The dispatch
   input is bound to an environment variable and never interpolated into a
   shell command.
2. It runs the existing, source-fixed verification surface and records each
   command's real exit code, duration, and full stdout/stderr:
   - `npm run lint`
   - `npm run test:unit`
   - `npm run ci:check`
   - `npm run pack:check` (covers `release:check` together with `ci:check`)
   - `npm run build` and `npm run test:mcp` in `packages/mcp-server`
   The command list is fixed in `scripts/release-evidence.mjs`; there is no
   environment override that could substitute an empty or weakened set.
3. It produces a **real** tarball with `npm pack` into the evidence directory
   and records the SHA-256 computed from the tarball bytes, retaining the
   tarball alongside npm's own name/version/SHA-1/SHA-512 metadata. `npm pack`
   is local only; nothing is published.
4. It writes an evidence bundle (`summary.json`, `summary.sha256`, `report.md`,
   the retained tarball, and per-command `logs/`) and uploads it as a CI
   artifact on every run, including failures. The default output directory is a
   unique run directory **outside the repository** (under the OS temp dir; the
   workflow uses the runner temp). This keeps the measured source clean and, in
   particular, avoids the repo's `test-results/` tree, which `ci:check`
   (Playwright) clears at the start of each browser run. A user-supplied
   `--out` must be a new, non-symlinked path; existing directories are refused
   and never deleted.

Honest status (fail-closed): the overall status is `PASS` only when every
required command exits 0, the real tarball and its SHA-256 are captured, the
immutable source SHA resolves, **and** the tracked/untracked source is clean before and after verification, with the same SHA. A
failed command, a failed pack, a missing SHA, a dirty source, or an empty
command list all force `FAIL` (verified by `tests/release-evidence.test.mjs`,
which includes these negative cases). The workflow surfaces a non-`PASS` status
as a red job while still uploading the evidence.

This dry-run does not approve a final release. It produces evidence for the
"Release dry-run" gate below; remaining gates stay pending until satisfied and
signed off.

## v1 release gates

- [ ] Critical epics complete (E1, E2, E3, E4)
- [ ] Accessibility baseline complete (E6)
- [ ] No release-blocking vulnerabilities
- [ ] Release workflow dry-run evidence linked
- [ ] Spec lifecycle metadata complete for foundation specs
- [ ] MCP contracts and compatibility policy published
- [ ] Required CI checks green for release candidate
- [ ] Final sign-off recorded

## Breaking changes

- React wrapper exports (`ui-foundations/react` and
  `ui-foundations/react/*`) are removed in v1. Consumers must migrate using
  `docs/migrations/react-to-web-components.md` before upgrading.
- The canonical `uif.*` macro usage and `<uif-*>` Custom Element namespace are
  implemented under #197. Legacy `<ui-*>` registrations are removed without
  compatibility aliases; consumers must follow
  `docs/migrations/public-api-namespace-v1.md`.

## Evidence log

| Gate | Evidence | Status |
|---|---|---|
| Critical epics complete |  | Pending |
| Accessibility baseline | #309 / #311 and PRs #310 / #312 own this chain; not completed here | Pending |
| Vulnerability status |  | Pending |
| Release dry-run | `.github/workflows/release-readiness.yml` dispatch artifact (evidence written outside the checkout, uploaded as CI artifact) | Mechanism ready; run + review pending |
| Spec metadata completeness |  | Pending |
| MCP contract readiness | Runtime MCP tests/build run by the collector; cross-repository contract publication and compatibility policy remain separate gates | Pending |
| CI status |  | Pending |
| Final sign-off |  | Pending |

## Naming status

Naming migration is not repeated by this work: #145 is completed; #156 and #195
completed the CSS/token naming waves; #197 covers the public API namespace.
v1.x CSS compatibility is preserved.
