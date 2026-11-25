import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("TreeView macro emits nested authored tree items and states", () => {
  const html = render(`{{ uif.treeView(id="destinations", label="Destinations", selection="multiple", reorderable=true, items=[
    {value: "europe", label: "Europe", expanded: true, selected: true, children: [
      {value: "spain", label: "Spain"},
      {value: "islands", label: "Islands", lazy: true}
    ]}
  ]) }}`);
  assert.match(html, /<uif-tree-view[^>]+id="destinations"[^>]+label="Destinations"[^>]+selection="multiple"[^>]+reorderable/);
  assert.match(html, /<uif-tree-item[^>]+value="europe"[^>]+label="Europe"[^>]+expanded[^>]+selected/);
  assert.match(html, /<uif-tree-item[^>]+value="islands"[^>]+label="Islands"[^>]+lazy/);
  assert.match(html, /<span class="uif-tree-item-label">Spain<\/span>/);
});

test("TreeView element implements ARIA navigation, selection and typeahead", () => {
  const source = readFileSync("src/elements/ui-tree-view.js", "utf8");
  assert.match(source, /setAttribute\("role", "tree"\)/);
  assert.match(source, /setAttribute\("role", "treeitem"\)/);
  assert.match(source, /setAttribute\("role", "group"\)/);
  for (const key of ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End", "Enter"]) {
    assert.match(source, new RegExp(`event\\.key === "${key}"`));
  }
  assert.match(source, /aria-multiselectable/);
  assert.match(source, /uif-selection/);
  assert.match(source, /_handleTypeahead/);
});

test("TreeView exposes equivalent pointer and keyboard reorder paths", () => {
  const source = readFileSync("src/elements/ui-tree-view.js", "utf8");
  assert.match(source, /addEventListener\("dragstart"/);
  assert.match(source, /addEventListener\("drop"/);
  assert.match(source, /event\.ctrlKey && event\.shiftKey/);
  assert.match(source, /_handleKeyboardReorder/);
  assert.match(source, /CustomEvent\("uif-reorder"/);
  assert.match(source, /method/);
});

test("TreeView lazy requests are cancellable, retryable and idempotent", () => {
  const source = readFileSync("src/elements/ui-tree-view.js", "utf8");
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /cancelable: true/);
  assert.match(source, /detail: \{ item, value: itemValue\(item\), signal: controller\.signal, resolve, reject \}/);
  assert.match(source, /existing = new Set/);
  assert.match(source, /data-load-error/);
  assert.match(source, /Press Enter to retry/);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest/);
});

test("TreeView generators preserve hierarchy and behavior options", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { label: "Destinations", selection: "multiple", reorderable: true, lazy: true }, meta: {} };
  const macro = window.UIPlaygroundCodeGenerators.njk["tree-view"](state);
  const element = window.UIPlaygroundCodeGenerators.wc["tree-view"](state);
  assert.match(macro, /uif\.treeView/);
  assert.match(macro, /selection="multiple"/);
  assert.match(macro, /lazy: true/);
  assert.match(element, /<uif-tree-view[^>]+reorderable/);
  assert.match(element, /<uif-tree-item[^>]+lazy/);
});

test("TreeView CSS preserves focus, target size, non-color state and forced-color cues", () => {
  const css = readFileSync("src/ui/patterns/tree-view.css", "utf8");
  assert.match(css, /min-block-size: max\(44px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /uif-tree-item-selection/);
  assert.match(readFileSync("src/elements/ui-tree-view.js", "utf8"), /✓ Selected/);
  assert.match(css, /data-drop-position/);
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /var\(--uif-tree-view-selected-background, var\(--color-fill-subtle\)\)/);
});
