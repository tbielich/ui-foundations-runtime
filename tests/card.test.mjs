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
  const html = render('{% call uif.card(id="holiday-card", title="Holiday", href="/holiday", actionLabel="View holiday") %}<p>Details</p>{% endcall %}');
  assert.match(html, /<article class="uif-card"[^>]* id="holiday-card"/);
  assert.match(html, /aria-labelledby="holiday-card-title"/);
  assert.match(html, /id="holiday-card-title"/);
  assert.match(html, /<a class="uif-card-control" href="\/holiday">View holiday<\/a>/);
  assert.doesNotMatch(html, /role="button"/);
});

test("card macro keeps repeated titles uniquely associated", () => {
  const html = render('{% call uif.card(id="holiday-card-one", title="Holiday") %}One{% endcall %}{% call uif.card(id="holiday-card-two", title="Holiday") %}Two{% endcall %}');
  assert.match(html, /aria-labelledby="holiday-card-one-title"/);
  assert.match(html, /aria-labelledby="holiday-card-two-title"/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test("card selection state exists only for selectable cards", () => {
  const selectable = render('{% call uif.card(id="selectable-holiday", title="Holiday", selectable=true, selected=true) %}Details{% endcall %}');
  assert.match(selectable, /data-selected="true"/);
  assert.match(selectable, /aria-pressed="true"/);
  const staticCard = render('{% call uif.card(id="static-holiday", title="Holiday", selected=true) %}Details{% endcall %}');
  assert.doesNotMatch(staticCard, /data-selected/);
  assert.doesNotMatch(staticCard, /aria-pressed/);
});

test("card generators keep explicit interaction modes", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { title: "Holiday", layout: "horizontal", selectable: true, selected: true }, meta: {} };
  assert.match(window.UIPlaygroundCodeGenerators.njk.card(state), /id="card-example"/);
  assert.match(window.UIPlaygroundCodeGenerators.njk.card(state), /selectable=true/);
  assert.match(window.UIPlaygroundCodeGenerators.wc.card(state), /selectable selected/);
});
