import { test } from "node:test";
import assert from "node:assert/strict";
import { score, axeOutcome, validate, loadEvidence, inventory, inventoryHash, ADR } from "../scripts/accessibility-evidence.mjs";
const source = { head: "abc", branch: "feat/test", dirty: false, contentHash: "hash", configHash: "config", inventoryHash };
const scan = (state) => ({ state, results: { testEngine: { version: "4" }, violations: [], incomplete: [], passes: [], inapplicable: [] } });
const fixture = () => ({ schemaVersion: 1, issue: 309, adr: ADR, inventoryHash, scope: inventory.scope, runId: "test", date: new Date().toISOString(), source: { ...source }, executor: {}, tools: {}, results: inventory.criteria.map((c) => ({ ...c, status: "pass", evidence: "test", scans: c.states.map(scan) })) });
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
 const outcomes = fixture(); outcomes.results[0].status = "not-tested"; assert.equal(validate(outcomes, source).button.gate, "BLOCKED");
 outcomes.results[1].status = "fail"; assert.equal(validate(outcomes, source).button.gate, "FAIL");
});
