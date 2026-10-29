import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { score, axeOutcome, validate, loadEvidence, inventory, inventoryHash, ADR } from "../scripts/accessibility-evidence.mjs";
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = { repository: "tbielich/ui-foundations-runtime", base: "8c2c2ebd1a2f43270c34f87171a8200fbd38a410", baseAvailable: true, changedPaths: ["scripts/accessibility-evidence.mjs"], head: "a".repeat(40), attached: true, branch: "feat/test", ciRef: null, ciHeadRef: null, dirty: false, contentHash: "b".repeat(64), configHash: "c".repeat(64), inventoryHash };
const scan = (state) => ({ state, configuration: "default enabled rules; no exclusions", results: { testEngine: { name: "axe-core", version: "4.13.0" }, violations: [], incomplete: [], passes: [], inapplicable: [] } });
const fixture = () => ({
 schemaVersion: 1, issue: 309, adr: ADR, inventoryHash, scope: inventory.scope, runId: "unit-fixture", date: new Date().toISOString(), source: { ...source },
 executor: { provider: "unit-fixture", independentVerification: "pending", merge: "human gate pending" },
 tools: { node: "v22.22.1", playwright: "1.63.0", axeIntegration: "4.13.0", axe: "4.13.0", os: "test OS", rules: "axe defaults; no disabled rules, tags or exclusions", boundary: "actual macro" },
 browserExitCode: 0, testCounts: { expected: 12, unexpected: 0, flaky: 0, skipped: 0 },
 execution: [...inventory.criteria.map((c) => c.id), "negative controls detect missing name/role and axe violations"].map((id) => ({ id, project: "chromium", status: "expected", attempts: [{ status: "passed", retry: 0 }] })),
 results: inventory.criteria.map((c) => ({ ...c, status: "pass", execution: { title: c.id, status: "passed", retry: 0 }, browser: "149.0.0", scans: c.states.map(scan), evidence: c.states.map((state) => {
   const name = state === "disabled" ? "Disabled" : state === "mixed" ? "Default" : c.component === "button" ? "Get started" : "Toggle me";
   return { state, snapshot: `- ${c.component} "${name}"${state === "disabled" ? " [disabled]" : state === "mixed" ? " [checked=mixed]" : state === "checked" ? " [checked]" : ""}`, target: c.component === "button" ? '<button class="uif-button">' : '<input class="uif-checkbox" type="checkbox">', page: `http://localhost/patterns/${c.component}/`, native: { disabled: state === "disabled", checked: state === "checked", indeterminate: state === "mixed", focused: state !== "disabled" }, actions: { tab: true, keys: ["Space", "Enter"], pointer: true, disabledSkipped: true, clicks: c.id === "button.inert" ? 0 : 2 } };
 }) }))
});
const setOutcome = (r, index, status) => {
 r.results[index].status = status;
 r.execution[index].status = "unexpected"; r.execution[index].attempts[0].status = "failed";
 r.browserExitCode = 1; r.testCounts.expected--; r.testCounts.unexpected++;
};
test("canonical mixed outcomes are 3/6=50 and FAIL", () => {
 const result = score(["pass", "pass", "pass", "fail", "not-tested", "blocked", "not-applicable"].map((status) => ({ status, rationale: "reviewed", reviewedBy: "owner" })));
 assert.equal(result.P, 3); assert.equal(result.A, 6); assert.equal(result.percentage, 50); assert.equal(result.gate, "FAIL");
});
test("zero denominator and skipped/unknown checks never pass", () => {
 assert.equal(score([]).percentage, null); assert.equal(score([]).gate, "BLOCKED");
 assert.equal(score([{ status: "not-tested" }]).gate, "BLOCKED");
 assert.equal(score([{ status: "blocked" }]).gate, "BLOCKED");
 assert.throws(() => score([{ status: "skipped" }]));
});
test("N/A must have reviewed rationale", () => {
 assert.throws(() => score([{ status: "not-applicable" }]));
 assert.throws(() => score([{ status: "not-applicable", rationale: "because" }]));
 assert.equal(score([{ status: "not-applicable", rationale: "reviewed scope", reviewedBy: "owner" }]).gate, "BLOCKED");
});
test("axe incomplete/missing states block, violations fail regardless of severity", () => {
 assert.equal(axeOutcome([scan("enabled")], ["enabled"]), "pass");
 assert.equal(axeOutcome([], ["enabled"]), "blocked");
 const s = scan("enabled"); s.results.incomplete.push({ id: "contrast" });
 assert.equal(axeOutcome([s], ["enabled"]), "blocked");
 s.results.violations.push({ impact: "minor" }); assert.equal(axeOutcome([s], ["enabled"]), "fail");
 assert.equal(axeOutcome([{ state: "enabled", results: {} }], ["enabled"]), "blocked");
});
test("matching reports pass; malformed/stale/mismatched reports reject", () => {
 assert.equal(validate(fixture(), source).button.gate, "PASS");
 for (const key of ["head", "branch", "dirty", "contentHash", "configHash", "inventoryHash"]) { const r = fixture(); r.source[key] = "wrong"; assert.throws(() => validate(r, source)); }
 for (const edit of [r => r.results.pop(), r => r.results.push(r.results[0]), r => r.date = "2000-01-01", r => r.scope = {}, r => r.results[0].evidence = null, r => r.results[4].scans = [], r => r.inventoryHash = "wrong"]) { const r = fixture(); edit(r); assert.throws(() => validate(r, source)); }
 assert.equal(loadEvidence("/does-not-exist", source).available, false);
 assert.equal(loadEvidence("/does-not-exist", source).components.button.gate, "BLOCKED");
});


test("skipped passing checks and incomplete axe output cannot earn credit", () => {
 const r = fixture(); r.results[0].skipped = true; assert.throws(() => validate(r, source));
 const incomplete = fixture(); incomplete.results[4].scans[0].results.incomplete.push({ id: "unknown" }); assert.throws(() => validate(incomplete, source));
 const outcomes = fixture(); setOutcome(outcomes, 0, "not-tested"); assert.equal(validate(outcomes, source).button.gate, "BLOCKED");
 setOutcome(outcomes, 1, "fail"); assert.equal(validate(outcomes, source).button.gate, "FAIL");
});

test("independent malformed report and provenance mutations fail closed", () => {
 const malformed = fixture(); malformed.executor = {}; malformed.tools = {};
 malformed.source.head = "arbitrary"; for (const r of malformed.results) r.evidence = "placeholder";
 assert.throws(() => validate(malformed, source));
 for (const edit of [
   r => r.executor = {}, r => r.tools = {}, r => r.tools.node = "unknown",
   r => r.source.repository = "other/repo", r => r.source.base = "arbitrary", r => r.source.head = "arbitrary",
   r => r.results[0].method = "other", r => r.results[0].states = [],
   r => r.results[0].evidence = "placeholder", r => r.results[0].evidence[0].snapshot = "placeholder",
   r => r.results[0].evidence[0].snapshot = '- checkbox "Wrong"',
   r => r.results[7].evidence[0].native.indeterminate = false,
   r => r.results[0].evidence[0].target = "<div>",
   r => r.results[0].status = "not-applicable", r => { r.results[0].status = "not-applicable"; r.results[0].rationale = "scope"; r.results[0].reviewedBy = "self"; },
   r => r.execution = [], r => r.execution[0].attempts[0].status = "skipped",
   r => r.execution[0].attempts.push({ status: "passed", retry: 1 }),
   r => r.execution[0].status = "unexpected", r => r.testCounts.skipped = 1,
   r => r.browserExitCode = 1, r => r.results[0].error = "assertion failed",
   r => r.results[2].evidence[0].actions = {},
 ]) { const r = fixture(); edit(r); assert.throws(() => validate(r, source)); }
});

test("missing or invalid baseline history fails closed and never earns PASS", () => {
 // A shallow CI checkout lacks the accepted baseline object; identity() reports
 // baseAvailable:false and changedPaths:null. Such a report must be rejected
 // (BLOCKED), not crash and not earn PASS from unprovable provenance.
 for (const edit of [
   r => { r.source.baseAvailable = false; r.source.changedPaths = null; },
   r => { r.source.baseAvailable = false; },
   r => { r.source.changedPaths = null; },
   r => { delete r.source.baseAvailable; },
   r => { delete r.source.changedPaths; },
   r => { r.source.changedPaths = "scripts/accessibility-evidence.mjs"; },
 ]) { const r = fixture(); edit(r); assert.throws(() => validate(r, source)); }

 // A report whose declared baseAvailable/changedPaths disagree with the live
 // checkout identity (expected) is stale/mismatched and must be rejected.
 const shallowExpected = { ...source, baseAvailable: false, changedPaths: null };
 assert.throws(() => validate(fixture(), shallowExpected));
 const drifted = fixture(); drifted.source.changedPaths = ["unexpected/path.js"];
 assert.throws(() => validate(drifted, source));

 // loadEvidence surfaces the fail-closed state as BLOCKED rather than throwing.
 const blocked = loadEvidence("/does-not-exist", shallowExpected);
 assert.equal(blocked.available, false);
 assert.equal(blocked.components.button.gate, "BLOCKED");
 assert.equal(blocked.components.checkbox.gate, "BLOCKED");
});

test("real detached-HEAD provenance is accepted; contradictory branch provenance rejected", () => {
 // Real GitHub PR CI checks out a detached HEAD: no attached branch, branch is null,
 // the head SHA is real, and optional env refs are present. This must validate.
 const detachedExpected = { ...source, attached: false, branch: null, ciRef: "refs/pull/312/merge", ciHeadRef: "fix/accessibility-pilot-verification" };
 const detached = fixture();
 detached.source = { ...detached.source, attached: false, branch: null, ciRef: "refs/pull/312/merge", ciHeadRef: "fix/accessibility-pilot-verification" };
 assert.equal(validate(detached, detachedExpected).checkbox.gate, "PASS");

 // Contradictory or fabricated provenance must be rejected regardless of expected identity.
 for (const edit of [
   r => { r.source.attached = true; r.source.branch = null; },            // claims attached but no branch
   r => { r.source.attached = false; r.source.branch = "feat/test"; },    // detached yet names a branch
   r => { r.source.attached = "yes"; },                                   // non-boolean attached
   r => { r.source.branch = ""; },                                        // empty branch while attached
   r => { r.source.ciRef = ""; },                                         // empty env ref string
   r => { r.source.ciHeadRef = "   "; },                                  // blank env ref string
 ]) { const r = fixture(); edit(r); assert.throws(() => validate(r, source)); }

 // A detached report whose declared refs drift from the live checkout is stale/mismatched.
 assert.throws(() => validate(detached, source));
});

// Deterministic real-checkout fixtures. These clone this repo into a throwaway
// directory and overlay the working-tree script, so they exercise the current
// identity() logic against a genuine git checkout without mutating this worktree.
// Hooks export GIT_DIR/GIT_INDEX_FILE and related variables. A cwd alone does
// not isolate git: remove inherited git targeting before operating on fixtures.
const fixtureEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", env: fixtureEnv }).trim();
function makeCheckout(tmp, name, { shallow = false, detach = null } = {}) {
  const dest = path.join(tmp, name);
  const args = ["clone", "--quiet"];
  if (shallow) args.push("--depth", "1");
  execFileSync("git", [...args, pathToFileURL(path.join(REPO_ROOT, ".git")).href, dest], { encoding: "utf8", env: fixtureEnv });
  if (detach) git(dest, "checkout", "--quiet", "--detach", detach);
  // Overlay the working-tree script so the clone runs the code under test, not committed code.
  fs.copyFileSync(path.join(REPO_ROOT, "scripts/accessibility-evidence.mjs"), path.join(dest, "scripts/accessibility-evidence.mjs"));
  return dest;
}
const probe = (dest, expr) => execFileSync(process.execPath, ["--input-type=module", "-e",
  `import(${JSON.stringify(pathToFileURL(path.join(dest, "scripts/accessibility-evidence.mjs")).href)}).then(m=>{process.stdout.write(JSON.stringify((${expr})(m)));});`],
  { encoding: "utf8", env: fixtureEnv });

test("real detached full checkout yields truthful branch:null provenance", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "a11y-detached-"));
  try {
    const head = git(REPO_ROOT, "rev-parse", "HEAD");
    const dest = makeCheckout(tmp, "full", { detach: head });
    const id = JSON.parse(probe(dest, "m=>m.identity()"));
    // Genuine detached HEAD: no attached branch, null branch, real 40-hex SHA, base present.
    assert.equal(id.attached, false);
    assert.equal(id.branch, null);
    assert.equal(id.head, head);
    assert.match(id.head, /^[a-f0-9]{40}$/);
    assert.equal(id.baseAvailable, true);
    assert.ok(Array.isArray(id.changedPaths));
    // A report carrying this real detached identity validates against itself.
    assert.ok(id.attached === false && id.branch === null, "detached identity is self-consistent");
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test("real shallow checkout missing baseline renders BLOCKED without crashing", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "a11y-shallow-"));
  try {
    const dest = makeCheckout(tmp, "shallow", { shallow: true });
    const out = JSON.parse(probe(dest, "m=>{const id=m.identity();const ev=m.loadEvidence('/does-not-exist', id);return {baseAvailable:id.baseAvailable, changedPaths:id.changedPaths, available:ev.available, button:ev.components.button.gate, checkbox:ev.components.checkbox.gate};}"));
    // Missing accepted baseline fails closed: no crash, explicit BLOCKED, never PASS.
    assert.equal(out.baseAvailable, false);
    assert.equal(out.changedPaths, null);
    assert.equal(out.available, false);
    assert.equal(out.button, "BLOCKED");
    assert.equal(out.checkbox, "BLOCKED");
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
