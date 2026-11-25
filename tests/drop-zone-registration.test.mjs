import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("drop zone is exported through package and aggregate element surfaces", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./elements/ui-drop-zone"], "./dist/elements/ui-drop-zone.js");
  assert.match(read("src/elements/index.js"), /UIDropZone/);
  const types = read("src/elements/index.d.ts");
  assert.match(types, /class UIDropZone/);
  assert.match(types, /"uif-drop-zone": UIDropZone/);
});

test("drop zone CSS, docs, preview and playground are registered", () => {
  assert.match(read("src/ui/index.css"), /patterns\/drop-zone\.css/);
  const previews = JSON.parse(read("site/_data/overviewPreviews.json"));
  assert.equal(previews["/patterns/drop-zone/"], "overview-previews/patterns-drop-zone.njk");
  assert.match(read("site/patterns/drop-zone.md"), /permalink: \/patterns\/drop-zone\//);
  assert.match(read("site/patterns/drop-zone-playground.md"), /renderer: drop-zone/);
  assert.match(read("site/assets/playground/renderers.js"), /"drop-zone": renderVanillaDropZone/);
});

test("drop zone documentation records deferred design integration", () => {
  const docs = read("site/patterns/drop-zone.md");
  assert.match(docs, /Figma.*deferred|deferred.*Figma/i);
  assert.match(docs, /Code Connect/i);
  assert.doesNotMatch(docs, /node[- ]id\s*[:=]/i);
});
