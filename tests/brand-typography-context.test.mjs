import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { loadBrandTypographyProjection, renderBrandTypographyContext } from "../scripts/brand-typography-context.mjs";

const root = path.resolve(import.meta.dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

test("optional typography binds every source to the exported semantic ID and WEB syntax", () => {
  const manifest = loadBrandTypographyProjection(root);
  assert.deepEqual(manifest.brands, ["a", "b", "c"]);
  assert.equal(manifest.slots.length, 7);
  const css = renderBrandTypographyContext(manifest);
  assert.match(css, /:where\(:root, \[data-brand\]\)/);
  for (const slot of manifest.slots) assert.ok(css.includes(`${slot.cssVar}: initial;`));
  assert.doesNotMatch(css, /\.uif-button|\.uif-field-label|\.uif-badge/);
  assert.doesNotMatch(css, /font-(family|weight):\s*(Inter|600)/);
});

test("stale semantic source identity fails instead of silently activating a guessed value", () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "uif-typography-projection-"));
  try {
    fs.cpSync(path.join(root, "figma"), path.join(temporary, "figma"), { recursive: true });
    const filename = path.join(temporary, "figma/brand-typography-compatibility.json");
    const manifest = JSON.parse(fs.readFileSync(filename, "utf8"));
    manifest.slots[0].sourceVariableId = "VariableID:missing";
    fs.writeFileSync(filename, JSON.stringify(manifest));
    assert.throws(() => loadBrandTypographyProjection(temporary), /Unbound typography source ID/);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test("selected Brand typography resolves A/B/C families and weights without changing Basic values", () => {
  const nodes = new Map();
  function walk(node, parts = []) {
    if (!node || typeof node !== "object") return;
    if ("$value" in node) { nodes.set(parts.join("/"), node); return; }
    for (const [key, value] of Object.entries(node)) walk(value, [...parts, key]);
  }
  for (const file of Object.values(read("figma/token-projection.json").collectionFiles)) walk(read(`figma/exports/${file}`));
  function resolve(name, brand, seen = new Set()) {
    assert.ok(!seen.has(name), `cycle: ${name}`);
    seen.add(name);
    const node = nodes.get(name);
    assert.ok(node, `missing ${name}`);
    const value = node.$extensions?.["com.figma.modeValues"]?.[`Brand ${brand}`] ?? node.$value;
    return value && typeof value === "object" && "$ref" in value ? resolve(value.$ref, brand, seen) : value;
  }
  const policies = { A: ["Inter", "Roboto Slab", "Bold"], B: ["Exo 2", "Orbitron", "Extra Bold"], C: ["Manrope", "Bricolage Grotesque", "Bold"] };
  for (const [brand, [base, heading, weight]] of Object.entries(policies)) {
    for (const name of ["Typography/Heading/Font Family", "Illustrated Message/Heading/Font Family"]) assert.equal(resolve(name, brand), heading, `${brand}/${name}`);
    for (const name of ["Typography/Body/Font Family", "Button/Font Family", "Badge/Font Family", "Input/Font Family", "Link/Font Family"]) assert.equal(resolve(name, brand), base, `${brand}/${name}`);
    assert.equal(resolve("Typography/Heading/Font Weight", brand), weight);
    for (const name of ["Typography/Body/Font Weight", "Select/Font Weight"]) assert.equal(resolve(name, brand), "Normal", `${brand}/${name}`);
    for (const name of ["Input/Font Weight", "Link/Font Weight", "Button/Font Weight"]) assert.equal(resolve(name, brand), "Semi Bold", `${brand}/${name}`);
  }
  for (const [name, value] of [["Sans", "Inter"], ["Serif", "Rokkitt"], ["Mono", "SF Mono"]]) assert.equal(resolve(`Font/Family/${name}`, "A"), value);
});
