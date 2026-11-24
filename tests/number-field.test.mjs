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

test("number element keeps formatting separate from editable state", () => {
  const source = readFileSync("src/elements/ui-number-field.js", "utf8");
  assert.match(source, /new Intl\.NumberFormat/);
  assert.match(source, /format\(value \/ 100\)/);
  assert.match(source, /setAttribute\("aria-valuetext", formatted\)/);
  assert.match(source, /stepDown\(\)/);
  assert.match(source, /stepUp\(\)/);
  assert.match(source, /Math\.min\(max, Math\.max\(min, value\)\)/);
});
