import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("card macro uses an article and one explicit navigation control", () => {
  const html = render('{% call uif.card(title="Holiday", href="/holiday", actionLabel="View holiday") %}<p>Details</p>{% endcall %}');
  assert.match(html, /<article class="uif-card"/);
  assert.match(html, /aria-labelledby=/);
  assert.match(html, /<a class="uif-card-control" href="\/holiday">View holiday<\/a>/);
  assert.doesNotMatch(html, /role="button"/);
});

test("card selection state exists only for selectable cards", () => {
  const selectable = render('{% call uif.card(title="Holiday", selectable=true, selected=true) %}Details{% endcall %}');
  assert.match(selectable, /data-selected="true"/);
  assert.match(selectable, /aria-pressed="true"/);
  const staticCard = render('{% call uif.card(title="Holiday", selected=true) %}Details{% endcall %}');
  assert.doesNotMatch(staticCard, /data-selected/);
  assert.doesNotMatch(staticCard, /aria-pressed/);
});

test("card generators keep explicit interaction modes", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { title: "Holiday", layout: "horizontal", selectable: true, selected: true }, meta: {} };
  assert.match(window.UIPlaygroundCodeGenerators.njk.card(state), /selectable=true/);
  assert.match(window.UIPlaygroundCodeGenerators.wc.card(state), /selectable selected/);
});
