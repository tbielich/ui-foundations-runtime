import { test } from "node:test";
import assert from "node:assert/strict";
import { score, axeOutcome, validate, loadEvidence, inventory, inventoryHash, ADR } from "../scripts/accessibility-evidence.mjs";
const source = { repository: "tbielich/ui-foundations-runtime", base: "8c2c2ebd1a2f43270c34f87171a8200fbd38a410", head: "a".repeat(40), branch: "feat/test", dirty: false, contentHash: "b".repeat(64), configHash: "c".repeat(64), inventoryHash };
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
