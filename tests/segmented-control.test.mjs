import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("segmented macro emits a labelled native radio group", () => {
  const html = render('{{ uif.segmentedControl(label="Results view", name="view", value="grid", options=[{value: "list", label: "List", icon: "list"}, {value: "grid", label: "Grid", disabled: true}]) }}');
  assert.match(html, /<fieldset class="uif-segmented-control md"/);
  assert.match(html, /<legend[^>]*>Results view<\/legend>/);
  assert.equal((html.match(/type="radio" name="view"/g) || []).length, 2);
  assert.match(html, /value="grid" checked disabled/);
  assert.match(html, /aria-hidden="true"/);
});

test("segmented element uses same-name radios and component change event", () => {
  const source = readFileSync("src/elements/ui-segmented-control.js", "utf8");
  assert.match(source, /input\.type = "radio"/);
  assert.match(source, /input\.name = name/);
  assert.match(source, /input\.disabled = option\.disabled/);
  assert.match(source, /CustomEvent\("uif-change"/);
});
