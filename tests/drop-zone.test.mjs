import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("drop zone macro emits a labelled native file fallback", () => {
  const html = render('{{ uif.dropZone(id="documents", label="Travel documents", name="documents", accept=".pdf,image/*", multiple=true) }}');
  assert.match(html, /class="uif-drop-zone"/);
  assert.match(html, /<input[^>]+id="documents-input"[^>]+type="file"/);
  assert.match(html, /aria-labelledby="documents-label documents-button-label"/);
  assert.match(html, /aria-describedby="documents-description documents-status"/);
  assert.match(html, /name="documents"/);
  assert.match(html, /accept="\.pdf,image\/\*"/);
  assert.match(html, /multiple/);
  assert.match(html, /id="documents-button-label"[^>]+for="documents-input"[^>]*>Choose files</);
  const status = html.match(/<p class="uif-drop-zone-status"[^>]*>/)?.[0] || "";
  assert.match(status, /role="status"/);
  assert.doesNotMatch(status, /hidden/);
  assert.doesNotMatch(render("{{ uif.dropZone() }}"), /class="uif-drop-zone"/);
});

test("drop zone macro keeps default, custom and localized action labels stable", () => {
  const html = render(`
    {{ uif.dropZone(id="default-zone") }}
    {{ uif.dropZone(id="custom-zone", label="Travel documents", buttonLabel="Browse files") }}
    {{ uif.dropZone(id="localized-zone", label="Reisedokumente", buttonLabel="Dateien auswählen") }}
  `);
  assert.match(html, /id="default-zone-input"[^>]+aria-labelledby="default-zone-label"/);
  assert.doesNotMatch(html, /aria-labelledby="default-zone-label default-zone-button-label"/);
  assert.match(html, /id="custom-zone-input"[^>]+aria-labelledby="custom-zone-label custom-zone-button-label"/);
  assert.match(html, /id="custom-zone-button-label"[^>]*>Browse files</);
  assert.match(html, /id="localized-zone-input"[^>]+aria-labelledby="localized-zone-label localized-zone-button-label"/);
  assert.match(html, /id="localized-zone-button-label"[^>]*>Dateien auswählen</);
  assert.deepEqual(
    Array.from(html.matchAll(/<input[^>]+id="([^"]+-input)"/g), (match) => match[1]),
    ["default-zone-input", "custom-zone-input", "localized-zone-input"],
  );
});

test("drop zone element shares picker and drop validation", () => {
  const source = readFileSync("src/elements/ui-drop-zone.js", "utf8");
  assert.match(source, /input\.addEventListener\("change"/);
  assert.match(source, /target\.addEventListener\("drop"/);
  assert.match(source, /this\._applyFiles\(input\.files, "picker"\)/);
  assert.match(source, /this\._applyFiles\(event\.dataTransfer\?\.files, "drop"\)/);
  assert.match(source, /CustomEvent\("uif-files-selected"/);
  assert.match(source, /File selection cleared\./);
  assert.match(source, /only one file is allowed/);
  assert.match(source, /is not an accepted file type/);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|upload/i);
});

test("drop zone generators preserve file constraints and states", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { label: "Travel documents", description: "PDF only", accept: ".pdf", multiple: true, loading: true, error: "Try again" }, meta: {} };
  const macro = window.UIPlaygroundCodeGenerators.njk["drop-zone"](state);
  const element = window.UIPlaygroundCodeGenerators.wc["drop-zone"](state);
  assert.match(macro, /uif\.dropZone/);
  assert.match(macro, /accept="\.pdf"/);
  assert.match(macro, /multiple=true/);
  assert.match(macro, /loading=true/);
  assert.match(element, /<uif-drop-zone[^>]+accept="\.pdf"[^>]+multiple[^>]+loading/);
});

test("drop zone CSS preserves focus, reflow and forced-color cues", () => {
  const css = readFileSync("src/ui/patterns/drop-zone.css", "utf8");
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(css, /max-width: 30rem/);
  assert.match(css, /min-inline-size: max\(44px/);
  assert.match(css, /uif-drop-zone-input:focus-visible \+ \.uif-drop-zone-button/);
  assert.match(css, /\[data-drag-active\]/);
  assert.match(css, /var\(--uif-drop-zone-container-background, var\(--color-fill-surface\)\)/);
});
