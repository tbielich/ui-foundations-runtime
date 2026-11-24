import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("range macro emits two visible labels and constrained native ranges", () => {
  const html = render('{{ uif.rangeSlider(label="Price", id="price", min=0, max=1000, step=50, lower=200, upper=800, invalid=true, error="Adjust the range") }}');
  assert.match(html, /<legend[^>]*>Price<\/legend>/);
  assert.match(html, /for="price-lower">Minimum<\/label>/);
  assert.match(html, /for="price-upper">Maximum<\/label>/);
  assert.match(html, /id="price-lower" type="range" name="min" min="0" max="800" step="50" value="200"/);
  assert.match(html, /id="price-upper" type="range" name="max" min="200" max="1000" step="50" value="800"/);
  assert.equal((html.match(/aria-describedby="price-error"/g) || []).length, 2);
});

test("range macro requires unique caller ids for repeated instances", () => {
  const html = render('{{ uif.rangeSlider(id="range-one") }}{{ uif.rangeSlider(id="range-two") }}');
  for (const id of ["range-one-lower", "range-one-upper", "range-two-lower", "range-two-upper"]) {
    assert.equal((html.match(new RegExp(`id="${id}"`, "g")) || []).length, 1);
  }
  assert.doesNotMatch(html, /id="range-slider-/);
  assert.doesNotMatch(render('{{ uif.rangeSlider(id=" ") }}'), /<input/);
  assert.doesNotMatch(render('{{ uif.rangeSlider() }}'), /<input/);
});

test("range element normalizes values and exposes component change detail", () => {
  const source = readFileSync("src/elements/ui-range-slider.js", "utf8");
  assert.match(source, /if \(source === lowerInput && nextLower > nextUpper\) nextLower = nextUpper/);
  assert.match(source, /if \(source === upperInput && nextUpper < nextLower\) nextUpper = nextLower/);
  assert.match(source, /lowerInput\.max = String\(nextUpper\)/);
  assert.match(source, /upperInput\.min = String\(nextLower\)/);
  assert.match(source, /detail: \{ lower: nextLower, upper: nextUpper \}/);
});
