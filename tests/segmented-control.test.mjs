import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);
const checkedValues = (html) => [...html.matchAll(/<input[^>]*value="([^"]*)"[^>]* checked[^>]*>/g)].map((match) => match[1]);

const options = '[{value: "list", label: "List", icon: "list"}, {value: "grid", label: "Grid"}]';

test("segmented macro emits a labelled native radio group", () => {
  const html = render(`{{ uif.segmentedControl(label="Results view", name="view", value="grid", options=${options}) }}`);
  assert.match(html, /<fieldset class="uif-segmented-control md"/);
  assert.match(html, /<legend[^>]*>Results view<\/legend>/);
  assert.equal((html.match(/type="radio" name="view"/g) || []).length, 2);
  assert.deepEqual(checkedValues(html), ["grid"]);
  assert.match(html, /aria-hidden="true"/);
});

test("segmented macro resolves selection to the first enabled option", () => {
  assert.deepEqual(checkedValues(render(`{{ uif.segmentedControl(value="unknown", options=${options}) }}`)), ["list"]);
  assert.deepEqual(checkedValues(render(`{{ uif.segmentedControl(options=${options}) }}`)), ["list"]);
  assert.deepEqual(checkedValues(render('{{ uif.segmentedControl(value="grid", options=[{value: "list", label: "List"}, {value: "grid", label: "Grid", disabled: true}]) }}')), ["list"]);
  assert.deepEqual(checkedValues(render('{{ uif.segmentedControl(options=[{value: "list", label: "List", disabled: true}, {value: "grid", label: "Grid"}]) }}')), ["grid"]);
  assert.deepEqual(checkedValues(render('{{ uif.segmentedControl(options=[{value: "list", label: "List", disabled: true}, {value: "grid", label: "Grid", disabled: true}]) }}')), []);
  assert.deepEqual(checkedValues(render('{{ uif.segmentedControl(options=[]) }}')), []);
});

test("segmented element uses enabled-option fallback and component change event", () => {
  const source = readFileSync("src/elements/ui-segmented-control.js", "utf8");
  assert.match(source, /options\.findIndex\(\(option\) => !option\.disabled && option\.value === requestedValue\)/);
  assert.match(source, /options\.findIndex\(\(option\) => !option\.disabled\)/);
  assert.match(source, /input\.type = "radio"/);
  assert.match(source, /input\.name = name/);
  assert.match(source, /input\.disabled = option\.disabled/);
  assert.match(source, /CustomEvent\("uif-change"/);
});
