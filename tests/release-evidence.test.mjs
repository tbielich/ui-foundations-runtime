import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  collectEvidence,
  getRequiredCommands,
  parseArgs,
  resolveOutDir,
} from "../scripts/release-evidence.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function freshOutDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "release-evidence-"));
}

let clock = 0;
const nowIso = () => new Date(Date.UTC(2026, 0, 1, 0, 0, (clock += 1))).toISOString();

// A runner that returns scripted outcomes for verification commands and a real,
// deterministic tarball for the `npm pack` invocation so SHA-256 can be checked
// against known bytes without touching the registry or the real package.
function makeRunner({ commandExit = 0, packExit = 0, tarballBytes = Buffer.from("fake-tarball") } = {}) {
  return (command, args, cwd, _outDirForPack) => {
    if (command === "npm" && args[0] === "pack") {
      const destIndex = args.indexOf("--pack-destination");
      const dest = destIndex >= 0 ? args[destIndex + 1] : cwd;
      const filename = "ui-foundations-9.9.9.tgz";
      if (packExit === 0) {
        fs.writeFileSync(path.join(dest, filename), tarballBytes);
      }
      return {
        durationMs: 1,
        stdout: JSON.stringify([
          { name: "ui-foundations", version: "9.9.9", filename, shasum: "deadbeef", integrity: "sha512-x", size: tarballBytes.length, unpackedSize: 10, entryCount: 1 },
        ]),
        stderr: "",
        exitCode: packExit,
        signal: null,
        spawnError: null,
      };
    }
    return {
      durationMs: 1,
      stdout: commandExit === 0 ? "ok" : "",
      stderr: commandExit === 0 ? "" : "intentional failure",
      exitCode: commandExit,
      signal: null,
      spawnError: null,
    };
  };
}

const passingCommands = [
  { id: "a", label: "a", cwd: root, command: "node", args: ["-e", "0"] },
  { id: "b", label: "b", cwd: root, command: "node", args: ["-e", "0"] },
];

test("argument parsing rejects unknown flags and missing values", () => {
  assert.deepEqual(parseArgs(["--ref", "main"]), { out: null, ref: "main" });
  assert.throws(() => parseArgs(["--bogus"]), /Unknown argument/);
  assert.throws(() => parseArgs(["--out"]), /--out requires/);
});

test("resolveOutDir refuses an existing output directory and never deletes it", () => {
  const existing = freshOutDir();
  const sentinel = path.join(existing, "keep.txt");
  fs.writeFileSync(sentinel, "precious");
  assert.throws(() => resolveOutDir(existing, "abc1234"), /Refusing to use existing output path/);
  // The refusal must not have touched the contents.
  assert.equal(fs.readFileSync(sentinel, "utf8"), "precious");
});

test("resolveOutDir refuses to write through a symlinked ancestor under the repo root", () => {
  // Stage under the already-ignored test-results/ tree so the symlink lives
  // below the repo root (the only region the guard inspects) and is cleaned up.
  fs.mkdirSync(path.join(root, "test-results"), { recursive: true });
  const base = fs.mkdtempSync(path.join(root, "test-results", "rez-sym-"));
  try {
    const realTarget = path.join(base, "real");
    fs.mkdirSync(realTarget);
    const link = path.join(base, "link");
    fs.symlinkSync(realTarget, link);
    assert.throws(() => resolveOutDir(path.join(link, "child"), "abc1234"), /symlink/);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("default output directory lives outside the repository (no self-dirt)", () => {
  const dir = resolveOutDir(null, "abc1234");
  const rel = path.relative(root, dir);
  // A path outside the repo resolves to something starting with "..".
  assert.ok(rel.startsWith(".."), `expected outside-repo path, got ${rel}`);
  assert.ok(dir.includes("uif-release-readiness"), dir);
});

test("passing commands + real tarball bytes produce PASS only when source is clean", () => {
  const outDir = freshOutDir();
  const bytes = Buffer.from("deterministic-tarball-content");
  const summary = collectEvidence({
    commands: passingCommands,
    outDir,
    dispatchRef: "test-ref",
    runner: makeRunner({ tarballBytes: bytes }),
    nowIso,
  });

  // SHA-256 is computed from the actual tarball bytes on disk.
  const expected = crypto.createHash("sha256").update(bytes).digest("hex");
  assert.equal(summary.package.sha256, expected);
  const onDisk = fs.readFileSync(path.join(outDir, summary.package.tarballFile));
  assert.equal(crypto.createHash("sha256").update(onDisk).digest("hex"), expected);
  assert.equal(summary.package.tarballCaptured, true);
  assert.match(summary.source.sha, /^[0-9a-f]{40}$/);

  // PASS is only legitimate when the checked-out source is clean. In this
  // worktree the source carries the #325 changes, so the collector must fail
  // closed with an explicit dirty-source reason rather than inventing success.
  if (summary.source.workingTreeClean) {
    assert.equal(summary.overallStatus, "PASS");
  } else {
    assert.equal(summary.overallStatus, "FAIL");
    assert.ok(summary.failureReasons.some((r) => /dirty/.test(r)));
  }
});

test("an empty command list can never earn PASS", () => {
  const outDir = freshOutDir();
  const summary = collectEvidence({
    commands: [],
    outDir,
    dispatchRef: null,
    runner: makeRunner(),
    nowIso,
  });
  assert.equal(summary.overallStatus, "FAIL");
  assert.ok(summary.failureReasons.some((r) => /command/.test(r)));
});

test("a failing command fails closed with preserved logs and real exit code", () => {
  const outDir = freshOutDir();
  const commands = [
    passingCommands[0],
    { id: "boom", label: "boom", cwd: root, command: "node", args: ["-e", "1"] },
  ];
  const summary = collectEvidence({
    commands,
    outDir,
    dispatchRef: null,
    runner: (cmd, args, cwd) => (args[0] === "pack" || args.includes("-e") && args[1] === "0"
      ? makeRunner()(cmd, args, cwd)
      : { durationMs: 1, stdout: "", stderr: "boom failure", exitCode: 7, signal: null, spawnError: null }),
    nowIso,
  });
  assert.equal(summary.overallStatus, "FAIL");
  const failing = summary.commands.find((c) => c.id === "boom");
  assert.equal(failing.exitCode, 7);
  assert.equal(failing.passed, false);
  const log = fs.readFileSync(path.join(outDir, "logs", "boom.log"), "utf8");
  assert.match(log, /exitCode: 7/);
  assert.match(log, /boom failure/);
});

test("a failed pack (no tarball / no SHA-256) fails closed", () => {
  const outDir = freshOutDir();
  const summary = collectEvidence({
    commands: passingCommands,
    outDir,
    dispatchRef: null,
    runner: makeRunner({ packExit: 1 }),
    nowIso,
  });
  assert.equal(summary.package.tarballCaptured, false);
  assert.equal(summary.overallStatus, "FAIL");
  assert.ok(summary.failureReasons.some((r) => /tarball|SHA-256/.test(r)));
});

test("summary.json has a matching self-checksum sidecar", () => {
  const outDir = freshOutDir();
  collectEvidence({ commands: passingCommands, outDir, dispatchRef: null, runner: makeRunner(), nowIso });
  const summaryRaw = fs.readFileSync(path.join(outDir, "summary.json"), "utf8");
  const sidecar = fs.readFileSync(path.join(outDir, "summary.sha256"), "utf8").trim();
  const [recorded] = sidecar.split(/\s+/);
  const actual = crypto.createHash("sha256").update(summaryRaw).digest("hex");
  assert.equal(recorded, actual);
});

test("the fixed required command list covers root release:check and MCP build/test", () => {
  const ids = getRequiredCommands().map((c) => c.id);
  for (const id of ["root-lint", "root-test-unit", "root-ci-check", "root-pack-check", "mcp-build", "mcp-test"]) {
    assert.ok(ids.includes(id), `missing required command ${id}`);
  }
});


test("missing SHA, dirty source and changes during verification fail closed", () => {
  const sha = "a".repeat(40);
  for (const scenario of ["missing", "dirty", "changed"]) {
    let headReads = 0;
    const summary = collectEvidence({
      commands: passingCommands, outDir: freshOutDir(), dispatchRef: null,
      runner: makeRunner(), nowIso,
      readGit: (args) => {
        if (args[0] === "status") return scenario === "dirty" ? " M package.json" : "";
        if (args.includes("--short")) return sha.slice(0, 7);
        headReads += 1;
        if (scenario === "missing") return null;
        return scenario === "changed" && headReads > 1 ? "b".repeat(40) : sha;
      },
    });
    assert.equal(summary.overallStatus, "FAIL", scenario);
    assert.ok(summary.failureReasons.length > 0, scenario);
  }
});
