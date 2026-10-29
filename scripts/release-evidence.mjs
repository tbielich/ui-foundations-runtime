#!/usr/bin/env node
// Release-readiness evidence collector (non-publishing dry-run).
//
// Runs a FIXED set of read-only verification commands, captures their real
// stdout / stderr / exit code / duration, records the immutable source SHA,
// produces a REAL npm pack tarball and records its SHA-256 computed from the
// tarball bytes, and writes an evidence bundle (per-command logs, a
// machine-readable summary.json, a self-checksum, and a human-readable
// report.md).
//
// Design contract (UIF Runtime #325):
//   - It NEVER publishes, stages, versions, tags, or deploys. It only reads
//     and packs locally. `npm pack` writes a tarball to disk but does not
//     contact any registry.
//   - It NEVER fabricates success. Overall status is PASS only when every
//     required command exits 0, the tarball + SHA-256 were captured, AND the
//     source identity is trustworthy (resolved SHA present and the tracked
//     source is clean). A failed command or dirty/unknown source fails closed.
//   - It ALWAYS writes the evidence bundle, even when commands fail, so logs
//     and truthful failure statuses are preserved for artifact upload.
//   - Its own process exit code is non-zero when the status is not PASS, so a
//     CI job surfaces an honest red status. Artifact upload in the workflow
//     runs with `if: always()` and is independent of this exit code.
//
// The production command list is fixed in source. There is no environment
// override that could substitute an empty or weakened command set and still
// earn PASS. Unit tests exercise the collector by injecting a command runner
// through the exported `collectEvidence` function; they never alter the list
// used by the CLI.
//
// Usage:
//   node scripts/release-evidence.mjs [--out <dir>] [--ref <git-ref-label>]
//
// Default output: test-results/release-readiness/run-<timestamp>-<sha>, which
// is already git-ignored (test-results/) so the collector never dirties the
// tracked or untracked source it is measuring.

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const mcpServerDir = path.join(repoRoot, "packages", "mcp-server");

// Fixed, required verification commands. Each MCP command runs from its own
// package, matching the issue scope. `root release:check` is decomposed into
// its two documented parts (ci:check + pack:check) so each produces an
// independently inspectable log and status while covering the same surface.
export function getRequiredCommands() {
  return [
    { id: "root-lint", label: "root: npm run lint", cwd: repoRoot, command: "npm", args: ["run", "lint"] },
    { id: "root-test-unit", label: "root: npm run test:unit", cwd: repoRoot, command: "npm", args: ["run", "test:unit"] },
    { id: "root-ci-check", label: "root: npm run ci:check", cwd: repoRoot, command: "npm", args: ["run", "ci:check"] },
    { id: "root-pack-check", label: "root: npm run pack:check", cwd: repoRoot, command: "npm", args: ["run", "pack:check"] },
    { id: "mcp-build", label: "mcp-server: npm run build", cwd: mcpServerDir, command: "npm", args: ["run", "build"] },
    { id: "mcp-test", label: "mcp-server: npm run test:mcp", cwd: mcpServerDir, command: "npm", args: ["run", "test:mcp"] },
  ];
}

export function parseArgs(argv) {
  const args = { out: null, ref: null };
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (current === "--out") {
      args.out = argv[(i += 1)];
      if (args.out === undefined) throw new Error("--out requires a directory argument");
    } else if (current === "--ref") {
      args.ref = argv[(i += 1)];
      if (args.ref === undefined) throw new Error("--ref requires a value");
    } else {
      throw new Error(`Unknown argument: ${current}`);
    }
  }
  return args;
}

// Resolve the output directory safely.
//   - A user-supplied --out must NOT already exist (we never touch, reuse, or
//     recursively delete pre-existing directories) and must not be a symlink
//     or traverse through one.
//   - The default is a unique run directory OUTSIDE the repository, under the
//     OS temp dir. This avoids dirtying the source being measured and, in
//     particular, avoids the repo's `test-results/` tree, which `npm run
//     ci:check` (Playwright) clears at the start of every browser run. A run
//     under the repo would otherwise have its logs wiped mid-collection.
export function resolveOutDir(requestedOut, sourceShaShort) {
  if (requestedOut) {
    const resolved = path.resolve(repoRoot, requestedOut);
    // Primary safety property first: never reuse or delete an existing path.
    if (fs.existsSync(resolved)) {
      throw new Error(
        `Refusing to use existing output path: ${resolved}. ` +
          "Choose a new --out directory; existing contents are never modified or deleted.",
      );
    }
    // Then reject a crafted path that would write through a symlink introduced
    // at or below the repo root (system-level symlinks such as macOS /var,
    // which sit above the repo, are not attacker-controlled and are ignored).
    assertNoSymlinkBelowRoot(resolved);
    return resolved;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runId = `run-${stamp}-${sourceShaShort || "unknown"}`;
  return path.join(os.tmpdir(), "uif-release-readiness", runId);
}

// Reject a target whose existing ancestors at or below the repo root include a
// symlink, so a crafted --out cannot redirect writes outside the intended tree.
// Ancestors above the repo root are system paths (e.g. macOS /var -> /private)
// that are not attacker-controlled, so they are not inspected.
function assertNoSymlinkBelowRoot(target) {
  const segments = [];
  let current = target;
  while (true) {
    segments.unshift(current);
    const parent = path.dirname(current);
    if (parent === current || current === repoRoot) break;
    current = parent;
  }
  for (const segment of segments) {
    // Only inspect segments at or below the repo root. Ancestors above the root
    // are system paths that are not attacker-controlled.
    const rel = path.relative(repoRoot, segment);
    if (rel.startsWith("..") || path.isAbsolute(rel)) continue;
    let stat;
    try {
      stat = fs.lstatSync(segment);
    } catch {
      continue; // does not exist yet; nothing to traverse
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to write through symlink: ${segment}`);
    }
  }
}

// Default command runner: spawn a child process and capture its result.
function defaultRunner(command, args, cwd) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: process.env,
  });
  const durationMs = Date.now() - started;
  return {
    durationMs,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    // status null means the process was killed by a signal; treat as failure.
    exitCode: result.status === null ? 1 : result.status,
    signal: result.signal || null,
    spawnError: result.error ? String(result.error.message || result.error) : null,
  };
}

function captureGit(args) {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  if (result.status !== 0) return null;
  return (result.stdout || "").trim();
}

// Produce a REAL tarball with `npm pack` into the evidence directory and record
// its SHA-256 computed from the file bytes. The tarball is retained in the
// bundle. `npm pack` is a local operation and does not publish.
export function capturePackageTarball(outDir, runner) {
  const result = runner("npm", ["pack", "--pack-destination", outDir, "--json"], repoRoot);
  const raw = result.stdout || "";
  let metadata = null;
  try {
    const json = JSON.parse(raw);
    const entry = Array.isArray(json) ? json[0] : json;
    if (entry) {
      metadata = {
        name: entry.name ?? null,
        version: entry.version ?? null,
        filename: entry.filename ?? null,
        npmShasum: entry.shasum ?? null,
        npmIntegrity: entry.integrity ?? null,
        size: entry.size ?? null,
        unpackedSize: entry.unpackedSize ?? null,
        entryCount: entry.entryCount ?? null,
      };
    }
  } catch {
    metadata = null;
  }

  let tarballPath = null;
  let sha256 = null;
  let byteLength = null;
  if (metadata && metadata.filename) {
    const candidate = path.join(outDir, metadata.filename);
    if (fs.existsSync(candidate)) {
      const bytes = fs.readFileSync(candidate);
      sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
      byteLength = bytes.length;
      tarballPath = metadata.filename;
    }
  }

  return {
    exitCode: result.exitCode,
    raw: `${raw}\n===== STDERR =====\n${result.stderr || ""}\nexitCode: ${result.exitCode}\n`,
    metadata,
    tarball: { path: tarballPath, sha256, byteLength },
  };
}

// Core, testable collector. `runner` is injected so unit tests can supply
// deterministic commands without touching the production list. The CLI always
// passes the fixed required commands and the real spawn runner.
export function collectEvidence({ commands, outDir, dispatchRef, runner, nowIso, readGit = captureGit }) {
  const logsDir = path.join(outDir, "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const writeLog = (id, content) => fs.writeFileSync(path.join(logsDir, `${id}.log`), content, "utf8");

  const sourceSha = readGit(["rev-parse", "HEAD"]);
  const sourceShaShort = readGit(["rev-parse", "--short", "HEAD"]);
  const gitStatus = readGit(["status", "--porcelain"]);

  const nodeVersion = process.version;
  const npmVersionResult = spawnSync("npm", ["--version"], { encoding: "utf8" });
  const npmVersion = (npmVersionResult.stdout || "").trim() || null;

  const startedAt = nowIso();
  const commandResults = [];

  for (const entry of commands) {
    const outcome = runner(entry.command, entry.args, entry.cwd);
    const header = [
      `# ${entry.label}`,
      `command: ${entry.command} ${entry.args.join(" ")}`,
      `cwd: ${path.relative(repoRoot, entry.cwd) || "."}`,
      `exitCode: ${outcome.exitCode}`,
      `signal: ${outcome.signal ?? "none"}`,
      `durationMs: ${outcome.durationMs}`,
      outcome.spawnError ? `spawnError: ${outcome.spawnError}` : null,
      "",
      "===== STDOUT =====",
      outcome.stdout,
      "===== STDERR =====",
      outcome.stderr,
      "",
    ]
      .filter((line) => line !== null)
      .join("\n");
    writeLog(entry.id, header);
    commandResults.push({
      id: entry.id,
      label: entry.label,
      command: `${entry.command} ${entry.args.join(" ")}`,
      cwd: path.relative(repoRoot, entry.cwd) || ".",
      exitCode: outcome.exitCode,
      signal: outcome.signal,
      durationMs: outcome.durationMs,
      passed: outcome.exitCode === 0 && !outcome.spawnError,
      spawnError: outcome.spawnError,
      logFile: path.posix.join("logs", `${entry.id}.log`),
    });
  }

  const pkg = capturePackageTarball(outDir, runner);
  writeLog("package-pack", pkg.raw);

  const finalSha = readGit(["rev-parse", "HEAD"]);
  const finalStatus = readGit(["status", "--porcelain"]);
  const sourceUnchanged = finalSha === sourceSha && finalStatus === "";
  const finishedAt = nowIso();

  const allCommandsPassed = commandResults.length > 0 && commandResults.every((entry) => entry.passed);
  const tarballCaptured =
    pkg.exitCode === 0 &&
    pkg.tarball.path !== null &&
    typeof pkg.tarball.sha256 === "string" &&
    pkg.tarball.sha256.length === 64;
  const sourceShaPresent = typeof sourceSha === "string" && /^[0-9a-f]{40}$/.test(sourceSha);
  const sourceClean = gitStatus === "";
  // Fail closed: PASS requires passing commands, a real tarball + SHA-256, a
  // resolved immutable source SHA, and a clean tracked/untracked source.
  const overallStatus =
    allCommandsPassed && tarballCaptured && sourceShaPresent && sourceClean && sourceUnchanged ? "PASS" : "FAIL";

  const failureReasons = [];
  if (!allCommandsPassed) failureReasons.push("one or more required commands failed");
  if (!tarballCaptured) failureReasons.push("tarball or SHA-256 not captured");
  if (!sourceShaPresent) failureReasons.push("source SHA could not be resolved");
  if (!sourceClean) failureReasons.push("source tree is dirty (tracked or untracked changes)");

  if (!sourceUnchanged) failureReasons.push("source changed or became dirty during verification");

  const summary = {
    schema: "uif.release-readiness.evidence/v2",
    generatedAt: finishedAt,
    nonPublishing: true,
    dispatchRef: dispatchRef ?? null,
    source: {
      sha: sourceSha,
      shaShort: sourceShaShort,
      workingTreeClean: sourceClean,
      workingTreeStatus: gitStatus || null,
      finalSha,
      finalWorkingTreeStatus: finalStatus,
      unchangedDuringRun: sourceUnchanged,
    },
    runtime: { node: nodeVersion, npm: npmVersion },
    window: { startedAt, finishedAt },
    package: {
      tarballCaptured,
      packExitCode: pkg.exitCode,
      tarballFile: pkg.tarball.path,
      sha256: pkg.tarball.sha256,
      byteLength: pkg.tarball.byteLength,
      ...(pkg.metadata || {}),
    },
    commands: commandResults,
    overallStatus,
    passed: overallStatus === "PASS",
    failureReasons,
  };

  const summaryJson = `${JSON.stringify(summary, null, 2)}\n`;
  fs.writeFileSync(path.join(outDir, "summary.json"), summaryJson, "utf8");
  const summarySha256 = crypto.createHash("sha256").update(summaryJson).digest("hex");
  fs.writeFileSync(path.join(outDir, "summary.sha256"), `${summarySha256}  summary.json\n`, "utf8");

  writeReport(outDir, summary, pkg);
  return summary;
}

function writeReport(outDir, summary, pkg) {
  const statusMark = (passed) => (passed ? "pass" : "FAIL");
  const lines = [
    "# Release Readiness Evidence (non-publishing dry-run)",
    "",
    `- Generated: ${summary.generatedAt}`,
    `- Dispatch ref: ${summary.dispatchRef ?? "(not provided)"}`,
    `- Source SHA: \`${summary.source.sha ?? "unknown"}\` (${summary.source.shaShort ?? "?"})`,
    `- Working tree clean: ${summary.source.workingTreeClean ? "yes" : "no"}`,
    `- Node: ${summary.runtime.node} / npm: ${summary.runtime.npm ?? "unknown"}`,
    `- Overall status: **${summary.overallStatus}**`,
    summary.failureReasons.length ? `- Failure reasons: ${summary.failureReasons.join("; ")}` : null,
    "",
    "This report is generated evidence. Do not hand-edit it. It records a",
    "non-publishing dry-run only and does not approve a final release.",
    "",
    "## Package identity (real tarball, local pack)",
    "",
    summary.package.tarballCaptured
      ? [
          `- name: \`${summary.package.name}\``,
          `- version: \`${summary.package.version}\``,
          `- tarball: \`${summary.package.tarballFile}\` (retained in this bundle)`,
          `- SHA-256 (of tarball bytes): \`${summary.package.sha256}\``,
          `- byte length: ${summary.package.byteLength}`,
          `- npm shasum (SHA-1): \`${summary.package.npmShasum}\``,
          `- npm integrity (SHA-512): \`${summary.package.npmIntegrity}\``,
          `- unpacked size: ${summary.package.unpackedSize} bytes / files: ${summary.package.entryCount}`,
        ].join("\n")
      : `- package tarball NOT captured (pack exit ${pkg.exitCode})`,
    "",
    "## Command results",
    "",
    "| Command | cwd | Exit | Duration (ms) | Status |",
    "| --- | --- | --- | --- | --- |",
    ...summary.commands.map(
      (entry) =>
        `| \`${entry.command}\` | \`${entry.cwd}\` | ${entry.exitCode} | ${entry.durationMs} | ${statusMark(entry.passed)} |`,
    ),
    "",
    "Per-command logs (including failures) are in `logs/`.",
    "",
    "## Remaining gates (not satisfied by this dry-run)",
    "",
    "- Naming status: #145 completed; #156 / #195 completed CSS/token naming",
    "  waves; #197 covers the public API namespace. No migration repeated here.",
    "- MCP: `test:mcp` includes integration and property suites; any non-zero",
    "  exit is recorded truthfully above and must not be read as release",
    "  approval.",
    "- Accessibility: #309 / #311 and PRs #310 / #312 own the accessibility",
    "  chain. This evidence does not modify or complete that work.",
    "- Human sign-off: final v1 release approval remains a pending manual gate.",
    "",
  ].filter((line) => line !== null);
  fs.writeFileSync(path.join(outDir, "report.md"), `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const cliArgs = parseArgs(process.argv.slice(2));
  const dispatchRef = cliArgs.ref || process.env.RELEASE_EVIDENCE_REF || null;
  const sourceShaShort = captureGit(["rev-parse", "--short", "HEAD"]);
  const requestedOut = cliArgs.out || process.env.RELEASE_EVIDENCE_OUT || null;
  const outDir = resolveOutDir(requestedOut, sourceShaShort);

  const summary = collectEvidence({
    commands: getRequiredCommands(),
    outDir,
    dispatchRef,
    runner: defaultRunner,
    nowIso: () => new Date().toISOString(),
  });

  process.stdout.write(
    `Release evidence written to ${path.relative(repoRoot, outDir)} (status: ${summary.overallStatus})\n`,
  );
  for (const entry of summary.commands) {
    process.stdout.write(`  ${entry.passed ? "pass" : "FAIL"}  ${entry.label} (exit ${entry.exitCode})\n`);
  }
  if (summary.failureReasons.length) {
    process.stdout.write(`  reasons: ${summary.failureReasons.join("; ")}\n`);
  }
  process.exitCode = summary.overallStatus === "PASS" ? 0 : 1;
}

// Direct-execution guard: only run the CLI when invoked as a script, not when
// imported by tests.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
