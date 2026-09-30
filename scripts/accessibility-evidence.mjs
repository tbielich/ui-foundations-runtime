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

export function validate(report, expected, now = Date.now()) {
  if (!report || report.schemaVersion !== 1 || report.issue !== 309 || report.adr !== ADR || report.inventoryHash !== inventoryHash || JSON.stringify(report.scope) !== JSON.stringify(inventory.scope)) throw new Error("Malformed/mismatched report");
  if (!report.runId || !report.executor || !report.tools || !report.source || !Array.isArray(report.results)) throw new Error("Missing provenance");
  const time = Date.parse(report.date);
  if (!Number.isFinite(time) || time > now + 60_000 || now - time > 86_400_000) throw new Error("Stale run date");
  for (const k of ["head", "branch", "dirty", "contentHash", "configHash", "inventoryHash"]) if (report.source[k] !== expected[k]) throw new Error(`Stale/mismatched ${k}`);
  if (report.results.length !== inventory.criteria.length) throw new Error("Missing/extra criteria");
  for (const c of inventory.criteria) {
    const rows = report.results.filter((r) => r.id === c.id && r.component === c.component);
    if (rows.length !== 1) throw new Error("Duplicate/missing criterion");
    const r = rows[0];
    score([r]);
    if (r.status === "pass" && (r.skipped || !r.evidence || JSON.stringify(r.states) !== JSON.stringify(c.states))) throw new Error("Incomplete passing evidence");
    if (c.method === "axe-default" && r.status === "pass" && axeOutcome(r.scans, c.states) !== "pass") throw new Error("Invalid axe pass");
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
  fs.appendFileSync(path.join(OUTPUT, "commands.jsonl"), JSON.stringify({ command: args.join(" "), started, exitCode: result.status, error: result.error?.message }) + "\n");
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
  report.components = validate(report, source);
  fs.writeFileSync(path.join(OUTPUT, "result.json"), JSON.stringify(report, null, 2));
  const docsExit = command(["npm", "run", "docs:build"]);
  process.exitCode = exit || docsExit || (Object.values(report.components).every((c) => c.gate === "PASS") ? 0 : 1);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await run();
