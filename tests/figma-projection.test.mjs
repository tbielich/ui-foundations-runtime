import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeFigmaColor, projectPath, projectModeValue, mergeTokenTree } from "../scripts/figma-projection.mjs";

test("projection resolves same-named cross-collection aliases by stable ID", () => {
  const projection = { variables: {
    scheme: { figmaName: "Color/Border/Default", exportPath: "Color/Border/Default" },
    role: { figmaName: "Color/Border/Default", exportPath: "Semantics/Color/Border/Default" },
  } };
  assert.equal(projectPath("Color/Border/Default", "role", projection), "Semantics/Color/Border/Default");
  assert.throws(() => projectPath("Color/Border/Default", null, projection), /Ambiguous/);
  assert.deepEqual(projectModeValue({ $ref: "Color/Border/Default", $targetId: "scheme" }, projection),
    { $ref: "Color/Border/Default" });
});

test("alpha survives color export in literals and mode overrides", () => {
  const transparent = { r: 0, g: 0, b: 0, a: 0 };
  const overlay = { r: 1, g: 1, b: 1, a: 0.5 };
  assert.equal(encodeFigmaColor(transparent), "#00000000");
  assert.equal(projectModeValue(overlay, null), "#ffffff80");
  assert.equal(encodeFigmaColor({ r: 1, g: 1, b: 1, a: 1 }), "#ffffff");
});

test("partial sync preserves code-only sibling projections and replaces incoming leaves", () => {
  const existing = { Pattern: { retained: { $type: "number", $value: 2 },
    changed: { $type: "number", $value: 1, $extensions: { stale: true } } } };
  const incoming = { Pattern: { changed: { $type: "number", $value: 3 } } };
  const result = mergeTokenTree(existing, incoming);
  assert.deepEqual(result.Pattern.retained, existing.Pattern.retained);
  assert.deepEqual(result.Pattern.changed, incoming.Pattern.changed);
  assert.equal(existing.Pattern.changed.$value, 1);
});
