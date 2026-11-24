import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("skeleton macro hides every placeholder shape", () => {
  const html = render('{{ uif.skeleton(shape="text", lines=3) }}');
  assert.match(html, /class="uif-skeleton-group" aria-hidden="true"/);
  assert.equal((html.match(/class="uif-skeleton text/g) || []).length, 3);
  assert.doesNotMatch(html, /role="progressbar"/);
});

test("skeleton supports circle and rectangle composition", () => {
  assert.match(render('{{ uif.skeleton(shape="circle") }}'), /uif-skeleton circle/);
  assert.match(render('{{ uif.skeleton(shape="rectangle") }}'), /uif-skeleton rectangle/);
});

test("skeleton CSS stops shimmer and stays visible in forced colors", () => {
  const css = readFileSync("src/ui/patterns/skeleton.css", "utf8");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none/);
  assert.match(css, /forced-colors: active/);
  assert.match(css, /border-color: CanvasText/);
});
