import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const OUTPUT = path.join(ROOT, "artifacts/accessibility");
export const ADR = "c960b3cbb21ed8c3527e0f21b6cd046c8ca3c802";
export const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/validation/accessibility-criteria.json")));
const hash = (s) => createHash("sha256").update(s).digest("hex");
export const inventoryHash = hash(JSON.stringify(inventory));
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

export function identity() {
  const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
  const untracked = git("ls-files", "--others", "--exclude-standard", "-z").split("\0").filter(Boolean);
  const files = [...new Set([...tracked, ...untracked])].sort();
  const content = files.map((f) => `${f}\0${fs.existsSync(path.join(ROOT, f)) ? hash(fs.readFileSync(path.join(ROOT, f))) : "deleted"}`).join("\n");
  return { repository: "tbielich/ui-foundations-runtime", base: "8c2c2ebd1a2f43270c34f87171a8200fbd38a410", head: git("rev-parse", "HEAD"), branch: git("branch", "--show-current"), dirty: !!git("status", "--porcelain"), contentHash: hash(content), inventoryHash, configHash: hash(fs.readFileSync(path.join(ROOT, "playwright.config.js"))), changedPaths: git("diff", "--name-only", "8c2c2ebd1a2f43270c34f87171a8200fbd38a410").split("\n").filter(Boolean) };
}

export function score(results) {
  const counts = Object.fromEntries(["pass", "fail", "not-tested", "blocked", "not-applicable"].map((s) => [s, 0]));
  for (const r of results) {
    if (!(r.status in counts)) throw new Error("Unknown outcome");
    if (r.status === "not-applicable" && (!r.rationale?.trim() || !r.reviewedBy?.trim())) throw new Error("N/A requires reviewed rationale");
    counts[r.status]++;
  }
  const A = results.length - counts["not-applicable"];
  const P = counts.pass;
  return { P, A, percentage: A ? Math.floor(100 * P / A) : null, counts, gate: counts.fail ? "FAIL" : (!A || counts.blocked || counts["not-tested"]) ? "BLOCKED" : "PASS" };
}

export function axeOutcome(scans, states) {
  if (!Array.isArray(scans)) return "blocked";
  if (scans.some((s) => Array.isArray(s.results?.violations) && s.results.violations.length)) return "fail";
  if (scans.length !== states.length || states.some((state) => scans.filter((s) => s.state === state).length !== 1)) return "blocked";
  if (scans.some((s) => !s.results?.testEngine?.version || ["violations", "incomplete", "passes", "inapplicable"].some((k) => !Array.isArray(s.results[k])) || s.results.incomplete.length)) return "blocked";
  return "pass";
}

// Capture the criterion boundary at the time each required state is exercised.
export async function capture(record, target, state, actions = {}) {
  record.evidence.push({ state, snapshot: await target.ariaSnapshot(), ...await target.evaluate((e) => {
    const input = e.matches("input,button") ? e : e.querySelector("input,button");
    return { target: input?.outerHTML, native: { checked: input?.checked ?? null, indeterminate: input?.indeterminate ?? null, disabled: input?.disabled, focused: input === document.activeElement }, page: location.href };
  }), actions });
}

export function executionRows(output) {
  const rows = [];
  const visit = (suite) => {
    for (const spec of suite.specs || []) for (const test of spec.tests || []) {
      rows.push({ id: spec.title, project: test.projectName, status: test.status, attempts: test.results.map((r) => ({ status: r.status, retry: r.retry })) });
    }
    for (const child of suite.suites || []) visit(child);
  };
  for (const suite of output.suites || []) visit(suite);
  return rows;
}

export function validate(report, expected, now = Date.now()) {
  if (!report || report.schemaVersion !== 1 || report.issue !== 309 || report.adr !== ADR || report.inventoryHash !== inventoryHash || JSON.stringify(report.scope) !== JSON.stringify(inventory.scope)) throw new Error("Malformed/mismatched report");
  const text = (v) => typeof v === "string" && !!v.trim() && !/placeholder|unavailable/i.test(v);
  const version = (v) => typeof v === "string" && /^v?\d+\.\d+\.\d+(?:[.-][\w.-]+)?$/.test(v);
  if (!text(report.runId) || !text(report.executor?.provider) || report.executor.independentVerification !== "pending" || report.executor.merge !== "human gate pending" || !text(report.tools?.os) || !text(report.tools?.boundary) || report.tools.rules !== "axe defaults; no disabled rules, tags or exclusions" || ["node", "playwright", "axeIntegration", "axe"].some((k) => !version(report.tools[k])) || !report.source || !Array.isArray(report.results) || !Array.isArray(report.execution)) throw new Error("Missing provenance");
  if (report.source.repository !== "tbielich/ui-foundations-runtime" || report.source.base !== "8c2c2ebd1a2f43270c34f87171a8200fbd38a410" || !/^[a-f0-9]{40}$/.test(report.source.head) || !text(report.source.branch) || typeof report.source.dirty !== "boolean" || ["contentHash", "configHash", "inventoryHash"].some((k) => !/^[a-f0-9]{64}$/.test(report.source[k]))) throw new Error("Invalid source identity");
  if (!Number.isInteger(report.browserExitCode) || report.browserExitCode < 0 || !report.testCounts || ["expected", "unexpected", "flaky", "skipped"].some((k) => !Number.isInteger(report.testCounts[k]) || report.testCounts[k] < 0)) throw new Error("Missing execution outcomes");
  if (report.execution.length !== inventory.criteria.length + 1 || report.execution.some((e) => e.project !== "chromium" || !["expected", "unexpected", "skipped"].includes(e.status) || !Array.isArray(e.attempts) || e.attempts.length !== 1 || e.attempts[0].retry !== 0 || !["passed", "failed", "timedOut", "interrupted", "skipped"].includes(e.attempts[0].status))) throw new Error("Invalid execution records");
  const counts = { expected: 0, unexpected: 0, skipped: 0, flaky: 0 };
  for (const e of report.execution) counts[e.status]++;
  if (Object.keys(counts).some((k) => counts[k] !== report.testCounts[k]) || (counts.unexpected > 0) !== (report.browserExitCode !== 0)) throw new Error("Contradictory execution summary");
  const negative = report.execution.filter((e) => e.id === "negative controls detect missing name/role and axe violations");
  if (negative.length !== 1 || negative[0].status !== "expected" || negative[0].attempts[0].status !== "passed") throw new Error("Missing negative control execution");
  const time = Date.parse(report.date);
  if (!Number.isFinite(time) || time > now + 60_000 || now - time > 86_400_000) throw new Error("Stale run date");
  for (const k of ["repository", "base", "head", "branch", "dirty", "contentHash", "configHash", "inventoryHash"]) if (report.source[k] !== expected[k]) throw new Error(`Stale/mismatched ${k}`);
  if (report.results.length !== inventory.criteria.length) throw new Error("Missing/extra criteria");
  for (const c of inventory.criteria) {
    const rows = report.results.filter((r) => r.id === c.id && r.component === c.component);
    if (rows.length !== 1) throw new Error("Duplicate/missing criterion");
    const r = rows[0];
    score([r]);
    if (r.status === "not-applicable" || r.method !== c.method || r.expected !== c.expected || JSON.stringify(r.states) !== JSON.stringify(c.states)) throw new Error("Unauthorized inventory change");
    const execution = report.execution.filter((e) => e.id === c.id);
    if (execution.length !== 1) throw new Error("Missing/duplicate execution");
    const passed = execution[0].status === "expected" && execution[0].attempts[0].status === "passed";
    if (passed !== (r.status === "pass") || (r.status === "pass" && (r.skipped || r.error || !version(r.browser)))) throw new Error("Contradictory criterion execution");
    if (r.status === "pass") {
      if (!Array.isArray(r.evidence) || c.states.some((state) => !r.evidence.some((e) => e.state === state))) throw new Error("Missing state evidence");
      for (const e of r.evidence) {
        if (!text(e.snapshot) || !text(e.target) || !e.target.includes(c.component === "button" ? "<button" : 'type="checkbox"') || !e.page?.endsWith(`/patterns/${c.component}/`) || !e.native || typeof e.native.disabled !== "boolean" || typeof e.native.focused !== "boolean" || !e.actions || typeof e.actions !== "object") throw new Error("Malformed semantic evidence");
        if (!c.states.includes(e.state)) continue; // additional real toggle outcomes retained
        const name = e.state === "disabled" ? "Disabled" : e.state === "mixed" ? "Default" : c.component === "button" ? "Get started" : "Toggle me";
        if (!e.snapshot.includes(`${c.component} "${name}"`) || e.native.disabled !== (e.state === "disabled") || (e.state === "disabled" && !e.snapshot.includes("[disabled]"))) throw new Error("Contradictory semantics");
        if (c.component === "checkbox" && (typeof e.native.checked !== "boolean" || e.native.indeterminate !== (e.state === "mixed") || (e.state !== "mixed" && e.native.checked !== (e.state === "checked")) || (e.state === "mixed" && !e.snapshot.includes("[checked=mixed]")) || (e.state === "checked" && !e.snapshot.includes("[checked]")))) throw new Error("Contradictory checkbox state");
      }
      if (c.method.includes("keyboard") && !r.evidence.some((e) => e.actions.keys?.includes("Space") && e.actions.tab === true && (c.id.endsWith("inert") ? e.actions.disabledSkipped === true : e.native.focused))) throw new Error("Missing real keyboard outcomes");
      if (c.id === "button.keyboard" && !r.evidence.some((e) => e.actions.clicks === 2 && e.actions.keys.includes("Enter"))) throw new Error("Missing activation outcomes");
      if (c.id === "button.inert" && !r.evidence.some((e) => e.actions.clicks === 0 && e.actions.pointer === true)) throw new Error("Missing inert outcomes");
      if (c.method.includes("pointer") && !r.evidence.some((e) => e.actions.pointer === true)) throw new Error("Missing pointer outcomes");
    }
    if (r.status === "pass" && (r.execution?.title !== c.id || r.execution.status !== "passed" || r.execution.retry !== 0)) throw new Error("Uncorrelated semantic execution");
    if (c.method === "axe-default" && r.status === "pass" && (axeOutcome(r.scans, c.states) !== "pass" || r.scans.some((s) => s.configuration !== "default enabled rules; no exclusions" || s.results.testEngine.name !== "axe-core" || s.results.testEngine.version !== report.tools.axe))) throw new Error("Invalid axe pass");
    if (c.method === "axe-default" && axeOutcome(r.scans, c.states) === "fail" && r.status !== "fail") throw new Error("Unresolved axe violation");
  }
  return Object.fromEntries(["button", "checkbox"].map((component) => [component, { ...score(report.results.filter((r) => r.component === component)), date: report.date, revision: report.source.head, runId: report.runId, dirty: report.source.dirty }]));
}

export function loadEvidence(file, expected = identity()) {
  try { const report = JSON.parse(fs.readFileSync(file)); return { available: true, report, components: validate(report, expected) }; }
  catch (error) { return { available: false, reason: error.message, components: Object.fromEntries(["button", "checkbox"].map((c) => [c, { gate: "BLOCKED", percentage: null, P: 0, A: inventory.criteria.filter((r) => r.component === c).length }])) }; }
}


function command(args) {
  const started = new Date().toISOString();
  const result = spawnSync(args[0], args.slice(1), { cwd: ROOT, encoding: "utf8", env: process.env });
  fs.appendFileSync(path.join(OUTPUT, "commands.jsonl"), JSON.stringify({ command: args.join(" "), environment: { CI: process.env.CI || null, SITE_PORT: process.env.SITE_PORT || null }, started, exitCode: result.status, error: result.error?.message }) + "\n");
  fs.writeFileSync(path.join(OUTPUT, `command-${Date.now()}.log`), (result.stdout || "") + (result.stderr || ""));
  process.stdout.write(result.stdout || ""); process.stderr.write(result.stderr || "");
  return result.status ?? 1;
}

async function run() {
  fs.mkdirSync(OUTPUT, { recursive: true });
  fs.rmSync(path.join(OUTPUT, "result.json"), { force: true });
  fs.rmSync(path.join(OUTPUT, "criteria"), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUTPUT, "criteria"));
  const source = identity();
  let exit = 0;
  if (process.argv.includes("--build")) exit = command(["npm", "run", "docs:site"]);
  if (!exit) exit = command(["npx", "playwright", "test", "tests/browser/accessibility"]);
  const results = inventory.criteria.map((c) => {
    try { return JSON.parse(fs.readFileSync(path.join(OUTPUT, "criteria", `${c.id}.json`))); }
    catch { return { id: c.id, component: c.component, states: c.states, status: "not-tested", evidence: "Browser execution did not produce criterion evidence" }; }
  });
  const version = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules", name, "package.json"))).version;
  let session = {};
  try { session = JSON.parse(fs.readFileSync(path.join(OUTPUT, "session.json"))); } catch { /* CI identity comes from the runner, not a fabricated local session. */ }
  const report = { schemaVersion: 1, issue: 309, adr: ADR, inventoryHash, scope: inventory.scope, runId: process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}` : `local-${Date.now()}`, date: new Date().toISOString(), source, executor: { session: process.env.CI ? null : session.sessionId || null, provider: process.env.CI ? "github-actions" : session.provider || "local-command", model: process.env.CI ? null : session.model || null, pr: process.env.GITHUB_REF || null, artifactRun: process.env.GITHUB_RUN_ID || null, independentVerification: "pending", merge: "human gate pending" }, tools: { node: process.version, os: `${os.platform()} ${os.release()} ${os.arch()}`, playwright: version("@playwright/test"), axeIntegration: version("@axe-core/playwright"), axe: version("axe-core"), rules: "axe defaults; no disabled rules, tags or exclusions", boundary: "Only selected macro button or checkbox label; docs shell not included" }, browserExitCode: exit, results };
  try { report.testCounts = JSON.parse(fs.readFileSync(path.join(OUTPUT, "playwright.json"))).stats; } catch { report.testCounts = null; }
  try { report.execution = executionRows(JSON.parse(fs.readFileSync(path.join(OUTPUT, "playwright.json")))); } catch { report.execution = []; }
  try { report.components = validate(report, source); } catch (error) { report.validationError = error.message; exit ||= 1; }
  // Retain malformed/failed raw reports too; consumers reject them fail-closed.
  fs.writeFileSync(path.join(OUTPUT, "result.json"), JSON.stringify(report, null, 2));
  const docsExit = command(["npm", "run", "docs:build"]);
  process.exitCode = exit || docsExit || (Object.values(report.components || {}).length === 2 && Object.values(report.components).every((c) => c.gate === "PASS") ? 0 : 1);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await run();
