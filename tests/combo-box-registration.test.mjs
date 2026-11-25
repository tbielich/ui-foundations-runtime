import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("combo box is exported through package and aggregate element surfaces", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./elements/ui-combo-box"], "./dist/elements/ui-combo-box.js");
  assert.match(read("src/elements/index.js"), /UIComboBox, UIComboBoxOption/);
  const types = read("src/elements/index.d.ts");
  assert.match(types, /class UIComboBox/);
  assert.match(types, /"uif-combo-box": UIComboBox/);
  assert.match(types, /"uif-combo-box-option": UIComboBoxOption/);
});

test("combo box CSS, docs, preview and playground are registered", () => {
  assert.match(read("src/ui/index.css"), /patterns\/combo-box\.css/);
  const previews = JSON.parse(read("site/_data/overviewPreviews.json"));
  assert.equal(previews["/patterns/combo-box/"], "overview-previews/patterns-combo-box.njk");
  assert.match(read("site/patterns/combo-box.md"), /permalink: \/patterns\/combo-box\//);
  assert.match(read("site/patterns/combo-box-playground.md"), /renderer: combo-box/);
  assert.match(read("site/assets/playground/renderers.js"), /"combo-box": renderVanillaComboBox/);
});

test("combo box documentation records deferred design integration", () => {
  const docs = read("site/patterns/combo-box.md");
  assert.match(docs, /Figma.*deferred|deferred.*Figma/i);
  assert.match(docs, /Code Connect/i);
  assert.doesNotMatch(docs, /node[- ]id\s*[:=]/i);
});
