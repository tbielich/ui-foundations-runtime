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

test("breadcrumbs macro keeps hidden items in native disclosures", () => {
  const html = render("{{ uif.breadcrumbs(items=items, collapseAt=4) }}", {
    items: ["Home", "Trips", "Europe", "Spain", "Booking"].map((label, index, all) => ({
      label,
      href: index === all.length - 1 ? "" : `/${index}`,
      current: index === all.length - 1,
    })),
  });
  assert.match(html, /<details class="uif-breadcrumbs-disclosure">/);
  assert.match(html, /Show previous breadcrumb items/);
  assert.match(html, />Trips</);
  assert.match(html, />Europe</);
});

test("breadcrumbs macro keeps collapsed current items visible in logical order", () => {
  const labels = ["Home", "Trips", "Europe", "Spain", "Portugal", "Lisbon", "Booking"];

  for (const currentIndex of [0, 3, labels.length - 1]) {
    const html = render("{{ uif.breadcrumbs(items=items, collapseAt=4) }}", {
      items: labels.map((label, index) => ({
        label,
        href: `/${index}`,
        current: index === currentIndex,
      })),
    });
    const details = [...html.matchAll(/<details[\s\S]*?<\/details>/g)].map((match) => match[0]);
    const labelOffsets = labels.map((label) => html.indexOf(`>${label}<`));

    assert.deepEqual([...html.matchAll(/aria-current="page">([^<]+)/g)].map((match) => match[1]), [labels[currentIndex]]);
    assert.ok(details.every((detail) => !detail.includes('aria-current="page"')));
    assert.deepEqual([...labelOffsets].sort((a, b) => a - b), labelOffsets);
  }
});

test("breadcrumbs macro honors an expanded non-final current item", () => {
  const html = render("{{ uif.breadcrumbs(items=items, collapseAt=4) }}", {
    items: [
      { label: "Home", href: "/" },
      { label: "Trips", href: "/trips", current: true },
      { label: "Booking", href: "/booking" },
    ],
  });
  assert.deepEqual([...html.matchAll(/aria-current="page">([^<]+)/g)].map((match) => match[1]), ["Trips"]);
});

test("breadcrumbs macro falls back to the final item", () => {
  const html = render("{{ uif.breadcrumbs(items=items) }}", {
    items: [
      { label: "Home", href: "/" },
      { label: "Booking", href: "/booking" },
    ],
  });
  assert.deepEqual([...html.matchAll(/aria-current="page">([^<]+)/g)].map((match) => match[1]), ["Booking"]);
});

test("breadcrumbs macro normalizes multiple current items to the first", () => {
  const html = render("{{ uif.breadcrumbs(items=items) }}", {
    items: [
      { label: "Home", href: "/" },
      { label: "Trips", href: "/trips", current: true },
      { label: "Booking", href: "/booking", current: true },
    ],
  });
  assert.deepEqual([...html.matchAll(/aria-current="page">([^<]+)/g)].map((match) => match[1]), ["Trips"]);
  assert.match(html, /<a href="\/booking">Booking<\/a>/);
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
