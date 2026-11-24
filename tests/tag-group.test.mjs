import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("tag macros expose a named list and labelled removal", () => {
  const html = render('{% call uif.tagGroup(label="Selected filters") %}{{ uif.tag(label="Family", removable=true, icon="user") }}{% endcall %}');
  assert.match(html, /role="list" aria-label="Selected filters"/);
  assert.match(html, /role="listitem"/);
  assert.match(html, /aria-label="Remove Family"/);
  assert.match(html, /aria-hidden="true"/);
});

test("tag element source implements roving keys and stable removal event", () => {
  const source = readFileSync("src/elements/ui-tag.js", "utf8");
  for (const key of ["ArrowRight", "ArrowLeft", "Home", "End", "Delete", "Backspace"]) {
    assert.match(source, new RegExp(key));
  }
  assert.match(source, /CustomEvent\("uif-remove"/);
  assert.match(source, /Math\.min\(index, this\._tags\(\)\.length - 1\)/);
});

test("tag generators preserve removable and size options", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { label: "Family", size: "sm", removable: true }, meta: {} };
  assert.match(window.UIPlaygroundCodeGenerators.njk.tag(state), /removable=true/);
  assert.match(window.UIPlaygroundCodeGenerators.wc.tag(state), /size="sm" removable/);
});
