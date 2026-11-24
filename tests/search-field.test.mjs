import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("search macro keeps a visible label and native search semantics", () => {
  const html = render('{{ uif.searchField(label="Search holidays", id="holiday-search", name="query", value="Mallorca", quiet=true) }}');
  assert.match(html, /<label[^>]*for="holiday-search">Search holidays<\/label>/);
  assert.match(html, /type="search" name="query" value="Mallorca"/);
  assert.match(html, /data-quiet/);
  assert.match(html, /aria-label="Clear Search holidays"/);
  assert.doesNotMatch(html, /uif-search-field-clear[^>]*disabled/);
});

test("search element implements clear and search event contracts", () => {
  const source = readFileSync("src/elements/ui-search-field.js", "utf8");
  assert.match(source, /CustomEvent\("uif-search"/);
  assert.match(source, /event\.key === "Enter"/);
  assert.match(source, /new Event\("input", \{ bubbles: true \}\)/);
  assert.match(source, /new Event\("change", \{ bubbles: true \}\)/);
  assert.match(source, /input\.focus\(\)/);
});

test("search generators preserve label and quiet state", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { label: "Search holidays", value: "Mallorca", quiet: true }, meta: {} };
  assert.match(window.UIPlaygroundCodeGenerators.njk["search-field"](state), /uif\.searchField/);
  assert.match(window.UIPlaygroundCodeGenerators.wc["search-field"](state), /<uif-search-field[^>]*quiet/);
});
