import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("ColorPicker macro emits a safe labelled authored surface", () => {
  const html = render('{{ uif.colorPicker(id="brand", label="Brand <color>", name="brandColor", value="#12345680", swatches="#f00,#0f0", readonly=true, invalid=true, error="Choose a supported color") }}');
  assert.match(html, /<uif-color-picker id="brand" label="Brand &lt;color&gt;"/);
  assert.match(html, /name="brandColor"/);
  assert.match(html, /value="#12345680"/);
  assert.match(html, /swatches="#f00,#0f0"/);
  assert.match(html, /readonly/);
  assert.match(html, /invalid/);
  assert.match(html, /error="Choose a supported color"/);
  assert.doesNotMatch(render("{{ uif.colorPicker() }}"), /<uif-color-picker/);
});

test("ColorPicker element includes synchronized semantic interaction contracts", () => {
  const source = readFileSync("src/elements/ui-color-picker.js", "utf8");
  assert.match(source, /setAttribute\("role", "slider"\)/);
  assert.match(source, /setAttribute\("role", "group"\)/);
  assert.match(source, /_createAreaAxis\(`\$\{baseId\}-saturation`, "Saturation"\)/);
  assert.match(source, /_createAreaAxis\(`\$\{baseId\}-brightness`, "Brightness"\)/);
  assert.doesNotMatch(source, /createElement\("output"\)/);
  assert.match(source, /setAttribute\("role", "grid"\)/);
  assert.match(source, /setAttribute\("role", "gridcell"\)/);
  assert.match(source, /aria-valuetext/);
  assert.match(source, /CustomEvent\("uif-color-change"/);
  assert.match(source, /new Event\(type, \{ bubbles: true \}\)/);
  assert.match(source, /setPointerCapture/);
  assert.match(source, /ArrowLeft|ArrowRight/);
  assert.match(source, /Enter a valid Hex color\./);
});

test("ColorPicker generators retain value and state", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { label: "Brand color", value: "#12345680", readonly: true, error: "Try another color" }, meta: {} };
  const macro = window.UIPlaygroundCodeGenerators.njk["color-picker"](state);
  const element = window.UIPlaygroundCodeGenerators.wc["color-picker"](state);
  assert.match(macro, /uif\.colorPicker/);
  assert.match(macro, /value="#12345680"/);
  assert.match(macro, /readonly=true/);
  assert.match(element, /<uif-color-picker[^>]*value="#12345680"[^>]*readonly/);
});

test("ColorPicker CSS preserves non-color, target, forced-color and reduced-motion cues", () => {
  const css = readFileSync("src/ui/patterns/color-picker.css", "utf8");
  assert.match(css, /aria-selected="true"\]\:\:after/);
  assert.match(css, /data-focus-axis="saturation"/);
  assert.match(css, /data-focus-axis="brightness"/);
  assert.match(css, /content: "✓"/);
  assert.match(css, /max\(44px, var\(--uif-semantic-scale-size-target-default\)\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /--uif-color-picker-container-background/);
});
