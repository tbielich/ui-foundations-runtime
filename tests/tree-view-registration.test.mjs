import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("TreeView is exported through package and aggregate element surfaces", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./elements/ui-tree-view"], "./dist/elements/ui-tree-view.js");
  assert.match(read("src/elements/index.js"), /UITreeItem, UITreeView/);
  const types = read("src/elements/index.d.ts");
  assert.match(types, /class UITreeView/);
  assert.match(types, /class UITreeItem/);
  assert.match(types, /"uif-tree-view": UITreeView/);
  assert.match(types, /"uif-tree-item": UITreeItem/);
});

test("TreeView CSS, docs, preview and playground are registered", () => {
  assert.match(read("src/ui/index.css"), /patterns\/tree-view\.css/);
  const previews = JSON.parse(read("site/_data/overviewPreviews.json"));
  assert.equal(previews["/patterns/tree-view/"], "overview-previews/patterns-tree-view.njk");
  assert.match(read("site/patterns/tree-view.md"), /permalink: \/patterns\/tree-view\//);
  assert.match(read("site/patterns/tree-view-playground.md"), /renderer: tree-view/);
  assert.match(read("site/assets/playground/renderers.js"), /"tree-view": renderVanillaTreeView/);
});

test("TreeView documentation records deferred design integration without IDs", () => {
  const docs = read("site/patterns/tree-view.md");
  assert.match(docs, /Figma.*deferred|deferred.*Figma/i);
  assert.match(docs, /Code Connect/i);
  assert.doesNotMatch(docs, /node[- ]id\s*[:=]/i);
});
