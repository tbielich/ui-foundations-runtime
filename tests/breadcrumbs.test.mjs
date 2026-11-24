import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source, context = {}) => env.renderString('{% import "macros/ui.njk" as uif %}' + source, context);

test("breadcrumbs macro emits labelled ordered navigation and current page", () => {
  const html = render('{{ uif.breadcrumbs(items=items, label="Trip path", separator=">") }}', {
    items: [
      { label: "Home", href: "/" },
      { label: "Trips", href: "/trips" },
      { label: "Booking", current: true },
    ],
  });
  assert.match(html, /<nav class="uif-breadcrumbs" aria-label="Trip path"/);
  assert.match(html, /<ol class="uif-breadcrumbs-list">/);
  assert.match(html, /aria-current="page">Booking/);
  assert.doesNotMatch(html, /aria-label=">"/);
});

test("breadcrumbs macro keeps middle items in a native disclosure", () => {
  const html = render("{{ uif.breadcrumbs(items=items, collapseAt=4) }}", {
    items: ["Home", "Trips", "Europe", "Spain", "Booking"].map((label, index, all) => ({
      label,
      href: index === all.length - 1 ? "" : `/${index}`,
      current: index === all.length - 1,
    })),
  });
  assert.match(html, /<details class="uif-breadcrumbs-disclosure">/);
  assert.match(html, /Show hidden breadcrumb items/);
  assert.match(html, />Trips</);
  assert.match(html, />Europe</);
});

test("breadcrumbs generators expose macro and Custom Element surfaces", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { label: "Location", separator: ">", collapseAt: 3 }, meta: {} };
  assert.match(window.UIPlaygroundCodeGenerators.njk.breadcrumbs(state), /uif\.breadcrumbs/);
  assert.match(window.UIPlaygroundCodeGenerators.wc.breadcrumbs(state), /<uif-breadcrumbs/);
});
