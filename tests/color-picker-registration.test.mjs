import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("ColorPicker is exported through package and aggregate element surfaces", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./elements/ui-color-picker"], "./dist/elements/ui-color-picker.js");
  assert.match(read("src/elements/index.js"), /UIColorPicker/);
  const types = read("src/elements/index.d.ts");
  assert.match(types, /class UIColorPicker/);
  assert.match(types, /"uif-color-picker": UIColorPicker/);
});

test("ColorPicker CSS, docs, preview and playground are registered", () => {
  assert.match(read("src/ui/index.css"), /patterns\/color-picker\.css/);
  const previews = JSON.parse(read("site/_data/overviewPreviews.json"));
  assert.equal(previews["/patterns/color-picker/"], "overview-previews/patterns-color-picker.njk");
  assert.match(read("site/patterns/color-picker.md"), /permalink: \/patterns\/color-picker\//);
  assert.match(read("site/patterns/color-picker-playground.md"), /renderer: color-picker/);
  assert.match(read("site/assets/playground/renderers.js"), /"color-picker": renderVanillaColorPicker/);
});

test("ColorPicker docs record deferred design integration without fabricated identifiers", () => {
  const docs = read("site/patterns/color-picker.md");
  assert.match(docs, /Figma.*deferred|deferred.*Figma/i);
  assert.match(docs, /Code Connect/i);
  assert.doesNotMatch(docs, /node[- ]id\s*[:=]/i);
});
