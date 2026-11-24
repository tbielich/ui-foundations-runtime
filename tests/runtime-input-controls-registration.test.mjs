import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const slugs = ["search-field", "number-field", "segmented-control", "range-slider"];

test("input controls are exported through package and aggregate surfaces", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const slug of slugs) {
    assert.equal(pkg.exports[`./elements/ui-${slug}`], `./dist/elements/ui-${slug}.js`);
  }
  const index = read("src/elements/index.js");
  for (const className of ["UISearchField", "UINumberField", "UISegmentedControl", "UIRangeSlider"]) {
    assert.match(index, new RegExp(className));
  }
  const types = read("src/elements/index.d.ts");
  for (const slug of slugs) assert.match(types, new RegExp(`"uif-${slug}"`));
});

test("input-control CSS, docs, previews and playgrounds are registered", () => {
  const css = read("src/ui/index.css");
  const previews = JSON.parse(read("site/_data/overviewPreviews.json"));
  for (const slug of slugs) {
    assert.match(css, new RegExp(`patterns/${slug}\\.css`));
    assert.equal(previews[`/patterns/${slug}/`], `overview-previews/patterns-${slug}.njk`);
    assert.match(read(`site/patterns/${slug}.md`), new RegExp(`/patterns/${slug}/`));
    assert.match(read(`site/patterns/${slug}-playground.md`), new RegExp(`renderer: ${slug}`));
  }
});

test("input-control docs record deferred Figma and Code Connect follow-up", () => {
  for (const slug of slugs) {
    const docs = read(`site/patterns/${slug}.md`);
    assert.match(docs, /Figma.*deferred|deferred.*Figma/i);
    assert.match(docs, /Code Connect/i);
  }
});
