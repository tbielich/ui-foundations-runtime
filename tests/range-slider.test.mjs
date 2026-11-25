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
  assert.match(html, /id="price-upper" type="range" name="max" min="200" max="1000" step="50" value="800" aria-valuetext="Maximum: 800"/);
  assert.doesNotMatch(html, /<output/);
  assert.equal((html.match(/aria-describedby="price-error"/g) || []).length, 2);
});

test("range macro normalizes invalid, out-of-range, and crossing values", () => {
  const cases = [
    {
      source: '{{ uif.rangeSlider(id="invalid", min="bad", max="Infinity", step="nope", lower="NaN", upper="-Infinity") }}',
      lower: { min: "0", max: "100", step: "1", value: "0" },
      upper: { min: "0", max: "100", step: "1", value: "100" },
      percentages: ["0", "100"],
    },
    {
      source: '{{ uif.rangeSlider(id="clamped", min=10, max=20, step=0, lower=-5, upper=30) }}',
      lower: { min: "10", max: "20", step: "1", value: "10" },
      upper: { min: "10", max: "20", step: "1", value: "20" },
      percentages: ["0", "100"],
    },
    {
      source: '{{ uif.rangeSlider(id="crossing", min=0, max=100, step=5, lower=80, upper=20) }}',
      lower: { min: "0", max: "80", step: "5", value: "80" },
      upper: { min: "80", max: "100", step: "5", value: "80" },
      percentages: ["80", "80"],
    },
  ];

  for (const { source, lower, upper, percentages } of cases) {
    const html = render(source);
    const inputs = [...html.matchAll(/<input class="uif-range-slider-input[^>]+>/g)].map(([input]) => input);
    assert.equal(inputs.length, 2);
    for (const [input, expected] of [[inputs[0], lower], [inputs[1], upper]]) {
      for (const [name, value] of Object.entries(expected)) assert.match(input, new RegExp(`${name}="${value}"`));
    }
    assert.match(html, new RegExp(`--uif-range-slider-lower: ${percentages[0]}%; --uif-range-slider-upper: ${percentages[1]}%;`));
  }
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
