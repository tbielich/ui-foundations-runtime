import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("feedback elements are exported through package and aggregate surfaces", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./elements/ui-toast"], "./dist/elements/ui-toast.js");
  assert.equal(pkg.exports["./elements/ui-popover"], "./dist/elements/ui-popover.js");
  const index = read("src/elements/index.js");
  assert.match(index, /export \{ UIToast, UIToastRegion \} from "\.\/ui-toast\.js"/);
  assert.match(index, /export \{ UIPopover \} from "\.\/ui-popover\.js"/);
  const types = read("src/elements/index.d.ts");
  for (const tag of ["uif-toast", "uif-toast-region", "uif-popover"]) {
    assert.match(types, new RegExp(`"${tag}"`));
  }
});

test("feedback CSS, docs, previews and playgrounds are registered", () => {
  const css = read("src/ui/index.css");
  assert.match(css, /patterns\/toast\.css/);
  assert.match(css, /patterns\/popover\.css/);
  const previews = JSON.parse(read("site/_data/overviewPreviews.json"));
  assert.equal(previews["/patterns/toast/"], "overview-previews/patterns-toast.njk");
  assert.equal(previews["/patterns/popover/"], "overview-previews/patterns-popover.njk");
  for (const slug of ["toast", "popover"]) {
    assert.match(read(`site/patterns/${slug}.md`), new RegExp(`/patterns/${slug}/`));
    assert.match(read(`site/patterns/${slug}-playground.md`), new RegExp(`renderer: ${slug}`));
  }
});

test("feedback implementation keeps live regions singular and Figma deferred", () => {
  const toast = read("src/elements/ui-toast.js");
  assert.ok(toast.includes('role="${assertive ? "alert" : "status"}"'));
  assert.doesNotMatch(toast, /uif-toast-region[^\n]+aria-live/);
  for (const slug of ["toast", "popover"]) {
    const docs = read(`site/patterns/${slug}.md`);
    assert.match(docs, /Figma.*deferred|deferred.*Figma/i);
    assert.match(docs, /Code Connect/i);
  }
});
