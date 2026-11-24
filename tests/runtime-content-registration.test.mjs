import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const slugs = ["breadcrumbs", "card", "tag", "skeleton"];

test("content primitives are exported through package and aggregate surfaces", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const slug of slugs) {
    assert.equal(pkg.exports[`./elements/ui-${slug}`], `./dist/elements/ui-${slug}.js`);
  }
  const index = read("src/elements/index.js");
  assert.match(index, /UIBreadcrumbs/);
  assert.match(index, /UICard/);
  assert.match(index, /UITag, UITagGroup/);
  assert.match(index, /UISkeleton/);
  const types = read("src/elements/index.d.ts");
  for (const tag of ["uif-breadcrumbs", "uif-card", "uif-tag", "uif-tag-group", "uif-skeleton"]) {
    assert.match(types, new RegExp(`"${tag}"`));
  }
});

test("content CSS, docs, previews and playgrounds are registered", () => {
  const css = read("src/ui/index.css");
  const previews = JSON.parse(read("site/_data/overviewPreviews.json"));
  for (const slug of slugs) {
    assert.match(css, new RegExp(`patterns/${slug}\\.css`));
    assert.equal(previews[`/patterns/${slug}/`], `overview-previews/patterns-${slug}.njk`);
    assert.match(read(`site/patterns/${slug}.md`), new RegExp(`/patterns/${slug}/`));
    assert.match(read(`site/patterns/${slug}-playground.md`), new RegExp(`renderer: ${slug}`));
  }
});

test("content docs record deferred Figma and Code Connect follow-up", () => {
  for (const slug of slugs) {
    const docs = read(`site/patterns/${slug}.md`);
    assert.match(docs, /Figma.*deferred|deferred.*Figma/i);
    assert.match(docs, /Code Connect/i);
  }
});
