import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
const require = createRequire(import.meta.url);
const { loadBrandFontStacks, applyBrandFontStacks } = require("../scripts/brand-font-stacks.js");
const root = path.resolve(import.meta.dirname, "..");
const projection = JSON.parse(fs.readFileSync(path.join(root, "figma/token-projection.json"), "utf8"));

test("each selected family stack binds existing Basic IDs without duplicate primary entries", () => {
  const entries = loadBrandFontStacks(root, projection);
  assert.equal(entries.length, 4);
  const base = entries.find(entry => entry.cssVar === "--brand-font-base");
  const heading = entries.find(entry => entry.cssVar === "--brand-font-heading");
  assert.equal(heading.modeFallbacks.a.cssVar, "--font-family-serif");
  for (const brand of ["b", "c"]) assert.equal(heading.modeFallbacks[brand].cssVar, "--font-family-sans");
  for (const [brand, primary, expected] of [["a", "var(--font-family-sans)", "var(--font-family-sans), sans-serif"], ["b", "var(--font-family-exo-2)", "var(--font-family-exo-2), var(--font-family-sans), sans-serif"]]) {
    const tokens = { typography: { [base.cssVar]: primary } };
    applyBrandFontStacks([base], [{ variableId: base.sourceVariableId, cssVar: base.cssVar }], tokens, { bucket: "brand", id: brand });
    assert.equal(tokens.typography[base.cssVar], expected);
  }
  assert.throws(() => applyBrandFontStacks([base], [{ variableId: base.sourceVariableId, cssVar: base.cssVar }], { typography: { [base.cssVar]: "Primary" } }, { bucket: "brand", id: "unknown" }), /Invalid font-stack Brand context/);
});

test("the existing Mono role gets a terminal without changing its Basic source value", () => {
  const mono = loadBrandFontStacks(root, projection).find(entry => entry.generic === "monospace");
  const tokens = { typography: { [mono.cssVar]: "var(--uif-appearance-projection-font-family-mono)" } };
  applyBrandFontStacks([mono], [{ variableId: mono.sourceVariableId, cssVar: mono.cssVar }], tokens, { bucket: "global", id: "semantics-roles" });
  assert.equal(tokens.typography[mono.cssVar], "var(--uif-appearance-projection-font-family-mono), monospace");
});
