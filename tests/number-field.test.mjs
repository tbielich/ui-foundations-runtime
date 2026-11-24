import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("number macro preserves native constraints and labelled controls", () => {
  const html = render('{{ uif.numberField(label="Budget", id="budget", value=500, min=0, max=1000, step=50, invalid=true, error="Choose a lower budget") }}');
  assert.match(html, /type="number" name="number" value="500" min="0" max="1000" step="50"/);
  assert.match(html, /aria-label="Decrease Budget"/);
  assert.match(html, /aria-label="Increase Budget"/);
  assert.match(html, /aria-valuetext="500"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="budget-formatted budget-error"/);
});

test("number macro matches Intl decimal, currency, and percent formatting", () => {
  const cases = [
    {
      source: '{{ uif.numberField(id="decimal", value="1234.5", locale="de-DE") }}',
      expected: new Intl.NumberFormat("de-DE").format(1234.5),
    },
    {
      source: '{{ uif.numberField(id="currency", value="1234.5", format="currency", currency="eur", locale="de-DE") }}',
      expected: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(1234.5),
    },
    {
      source: '{{ uif.numberField(id="percent", value="25", format="percent", locale="de-DE") }}',
      expected: new Intl.NumberFormat("de-DE", { style: "percent" }).format(0.25),
    },
  ];

  for (const { source, expected } of cases) {
    const html = render(source);
    assert.ok(html.includes(`aria-valuetext="${expected}"`));
    assert.ok(html.includes(`>${expected}</output>`));
  }
});

test("number macro falls back to en for empty and malformed locales", () => {
  const fallback = new Intl.NumberFormat("en").format(1234.5);
  for (const locale of ["", "de_DE", "en-US-"]) {
    const html = render(`{{ uif.numberField(id="locale-test", value="1234.5", locale="${locale}") }}`);
    assert.ok(html.includes(`aria-valuetext="${fallback}"`));
  }

  const valid = render('{{ uif.numberField(id="valid-locale", value="1234.5", locale="zh-Hant-TW") }}');
  assert.ok(valid.includes(`aria-valuetext="${new Intl.NumberFormat("zh-Hant-TW").format(1234.5)}"`));
});

test("number macro requires unique caller ids for repeated instances", () => {
  const html = render('{{ uif.numberField(id="number-one") }}{{ uif.numberField(id="number-two") }}');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  assert.match(html, /for="number-one"/);
  assert.match(html, /for="number-two"/);
  assert.doesNotMatch(render('{{ uif.numberField(id=" ") }}'), /<input/);
  assert.doesNotMatch(render('{{ uif.numberField() }}'), /<input/);
});

test("number macro normalizes numeric strings and invalid arguments", () => {
  const normalized = render('{{ uif.numberField(id="normalized", value="0500.50", min="000", max="1000.00", step="050") }}');
  assert.match(normalized, /value="500\.5" min="0" max="1000" step="50"/);

  const invalid = render('{{ uif.numberField(id="invalid", value="not-a-number", min="bad", max="Infinity", step="0") }}');
  assert.match(invalid, /value="" step="1" aria-valuetext="No value"/);
  assert.doesNotMatch(invalid, /\smin=/);
  assert.doesNotMatch(invalid, /\smax=/);
  assert.match(invalid, />No value<\/output>/);
});

test("number element keeps normalization and formatting separate from editable state", () => {
  const source = readFileSync("src/elements/ui-number-field.js", "utf8");
  assert.match(source, /new Intl\.NumberFormat/);
  assert.match(source, /format\(value \/ 100\)/);
  assert.match(source, /valueAttribute === null \? 0 : finiteNumber\(valueAttribute\)/);
  assert.match(source, /const step = positiveStep/);
  assert.match(source, /setAttribute\("aria-valuetext", formatted\)/);
  assert.match(source, /stepDown\(\)/);
  assert.match(source, /stepUp\(\)/);
  assert.match(source, /Math\.min\(max, Math\.max\(min, value\)\)/);
});
