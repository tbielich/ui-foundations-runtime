import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("combo box macro authors labelled options with separate text values", () => {
  const html = render('{{ uif.comboBox(id="destination", label="Destination", name="destination", value="pmi", options=[{value: "pmi", textValue: "Palma", label: "Palma <PMI>"}, {value: "tfs", label: "Tenerife", disabled: true}]) }}');
  assert.match(html, /<uif-combo-box id="destination" label="Destination" name="destination" value="pmi">/);
  assert.match(html, /value="pmi" text-value="Palma">Palma &lt;PMI&gt;/);
  assert.match(html, /value="tfs" text-value="Tenerife" disabled>Tenerife/);
  assert.doesNotMatch(render("{{ uif.comboBox() }}"), /<uif-combo-box/);
});

test("combo box element implements the editable ARIA and commit contracts", () => {
  const source = readFileSync("src/elements/ui-combo-box.js", "utf8");
  assert.match(source, /setAttribute\("role", "combobox"\)/);
  assert.match(source, /setAttribute\("aria-autocomplete", "list"\)/);
  assert.match(source, /aria-activedescendant/);
  assert.match(source, /setAttribute\("role", "listbox"\)/);
  assert.match(source, /setAttribute\("role", "option"\)/);
  assert.match(source, /CustomEvent\("uif-selection"/);
  assert.match(source, /new Event\("input", \{ bubbles: true \}\)/);
  assert.match(source, /new Event\("change", \{ bubbles: true \}\)/);
  assert.match(source, /this\._query = input\.value/);
  assert.match(source, /set options\(options\)/);
  assert.match(source, /visualViewport/);
});

test("combo box generators retain custom options and field states", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { label: "Destination", placeholder: "Search", freeform: true, loading: true, error: "Try again" }, meta: {} };
  const macro = window.UIPlaygroundCodeGenerators.njk["combo-box"](state);
  const element = window.UIPlaygroundCodeGenerators.wc["combo-box"](state);
  assert.match(macro, /uif\.comboBox/);
  assert.match(macro, /freeform=true/);
  assert.match(macro, /loading=true/);
  assert.match(macro, /textValue: "Palma de Mallorca"/);
  assert.match(element, /<uif-combo-box[^>]*freeform[^>]*loading/);
  assert.match(element, /<strong>Palma de Mallorca — PMI<\/strong>/);
});

test("combo box CSS preserves forced-color and reduced-motion behavior", () => {
  const css = readFileSync("src/ui/patterns/combo-box.css", "utf8");
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /var\(--uif-combo-box-popup-background, var\(--color-fill-surface\)\)/);
  assert.match(css, /var\(--uif-combo-box-option-active-background, var\(--color-fill-hover\)\)/);
  assert.match(css, /min-block-size: max\(24px, var\(--uif-semantic-scale-size-target-default\)\)/);
});
