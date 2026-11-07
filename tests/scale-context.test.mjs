import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scaleRatios } from "../scripts/scale-context.mjs";

test("container ratios derive from current typography anchors and follow source changes", () => {
  const core = JSON.parse(readFileSync("figma/exports/Core (Primitives).tokens.json"));
  const ratios = scaleRatios(core);
  assert.equal(ratios.small, core.Font.Size.xs.$value / core.Font.Size.sm.$value);
  assert.equal(ratios.medium, 1);
  assert.equal(ratios.large, core.Font.Size.md.$value / core.Font.Size.sm.$value);
  const changed = structuredClone(core);
  changed.Font.Size.md.$value *= 2;
  assert.equal(scaleRatios(changed).large, ratios.large * 2);
  changed.Font.Size.sm.$value = 0;
  assert.throws(() => scaleRatios(changed), /positive Core/);
});
