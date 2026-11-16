import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
const require = createRequire(import.meta.url);
const { loadFontFamilyCompatibility, compatibilityForTokenFile, applyLegacyFamilyReferences } = require("../scripts/font-family-compatibility.js");
const root = path.resolve(import.meta.dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

test("one concrete Figma catalogue retains explicit legacy JSON views by stable ID", () => {
  const projection = read("figma/token-projection.json");
  const entries = loadFontFamilyCompatibility(root, projection);
  assert.equal(entries.length, 3);
  const core = read("figma/exports/Core (Primitives).tokens.json");
  for (const entry of entries) {
    const leaf = entry.legacyExportPath.split("/").reduce((node, key) => node[key], core);
    assert.equal(leaf.$extensions["com.figma.variableId"], entry.sourceVariableId);
    assert.equal(leaf.$extensions["com.figma.variableName"], entry.canonicalFigmaName);
    assert.equal(leaf.$extensions["com.figma.codeSyntax"].WEB, `var(${entry.canonicalCssVar})`);
  }
  const ids = Object.values(core.Font.Family).map(node => node.$extensions["com.figma.variableId"]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 8);
});

test("old JSON literal accessors and TypeScript keyed values remain exact", () => {
  const json = read("dist/tokens/json/core-primitives.tokens.json");
  const source = fs.readFileSync(path.join(root, "dist/tokens/ts/core-primitives.tokens.ts"), "utf8");
  const tokens = JSON.parse(source.match(/export const tokens = ([\s\S]+?) as const;/)[1]);
  for (const [legacy, canonical, value] of [["Sans", "inter", "Inter"], ["Serif", "rokkitt", "Rokkitt"], ["Mono", "sf-mono", "SF Mono"]]) {
    assert.equal(json.Font.Family[legacy].$value, value);
    assert.equal(tokens.typography[`--font-family-${legacy.toLowerCase()}`], value);
    assert.equal(tokens.typography[`--font-family-${canonical}`], value);
  }
});

test("an ID/WEB mismatch or occupied legacy key cannot create a compatibility view", () => {
  const entry = { sourceVariableId: "id", legacyExportPath: "Font/Family/Sans", canonicalCssVar: "--font-family-inter", legacyCssVar: "--font-family-sans" };
  const token = { variableId: "id", path: "Font/Family/Sans", cssVar: "--font-family-inter" };
  const values = { typography: { "--font-family-inter": "Inter" } };
  assert.deepEqual(compatibilityForTokenFile([entry], [token], values)[0].value, "Inter");
  assert.throws(() => compatibilityForTokenFile([entry], [{ ...token, cssVar: "--wrong" }], values), /identity\/value mismatch/);
  assert.throws(() => compatibilityForTokenFile([entry], [token], { typography: { ...values.typography, "--font-family-sans": "Other" } }), /collides/);
});


test("legacy references are one-way projections while primitive definitions stay concrete", () => {
  const entry = { sourceVariableId: "id", legacyExportPath: "Font/Family/Sans", canonicalCssVar: "--font-family-inter", legacyCssVar: "--font-family-sans" };
  const token = { variableId: "id", path: "Font/Family/Sans", cssVar: "--font-family-inter", cssVarRef: "var(--font-family-inter)", value: "Inter" };
  applyLegacyFamilyReferences([entry], [token]);
  assert.equal(token.cssVar, "--font-family-inter");
  assert.equal(token.value, "Inter");
  assert.equal(token.cssVarRef, "var(--font-family-sans)");
});
