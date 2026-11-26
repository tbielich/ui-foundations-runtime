import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const read = path => readFileSync(path, "utf8");
const source = read("src/ui/components/symbol.js");
const { SYMBOL_PATHS, normalizeSymbolWeight, renderSymbol } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const macro = (name, weight, className = "") => env.renderString('{% import "macros/ui.njk" as uif %}{{ uif.symbol(name, weight=weight, className=className) }}', { name, weight, className }).trim();
const d = markup => markup.match(/<path d="([^"]+)"/)?.[1];
const weightOf = markup => Number(markup.match(/--uif-symbol-weight: ([^";]+)/)?.[1]);

test("all emitted geometry is exact source SVG geometry with decorative root semantics", () => {
  const files = { checkmark: "checkmark", dash: "minus", chevron: "chevron", plus: "plus", cross: "cross" };
  assert.deepEqual(Object.keys(SYMBOL_PATHS), Object.keys(files));
  for (const [name, file] of Object.entries(files)) {
    const asset = read(`src/assets/icons/${file}.svg`);
    assert.equal(SYMBOL_PATHS[name], d(asset));
    assert.match(asset, /viewBox="0 0 24 24"/);
    assert.match(asset, /stroke-linecap="round" stroke-linejoin="round"/);
    for (const markup of [renderSymbol(name), macro(name, 400)]) {
      assert.equal(d(markup), d(asset));
      assert.match(markup, /^<svg /);
      assert.equal((markup.match(/<path /g) || []).length, 1);
      assert.match(markup, /viewBox="0 0 24 24" aria-hidden="true" focusable="false"/);
      assert.doesNotMatch(markup, /role=|aria-label|vector-effect|transform=|<span/);
    }
  }
});

test("macro and JS normalize decimal weights identically, rejecting invalid and nonfinite input", () => {
  const cases = [undefined, null, true, false, {}, [], [500], ["500"], "", " ", "no", "500px", "500; color:red", "Infinity", Infinity, -Infinity, NaN, "1e999", -1, 0, 99, 100, 400, 500.5, 900, 1000, " 450 ", "+500", ".5", "4e2", "0x200"];
  for (const value of cases) {
    assert.equal(weightOf(macro("plus", value)), normalizeSymbolWeight(value), String(value));
    assert.equal(weightOf(renderSymbol("plus", value)), normalizeSymbolWeight(value));
  }
  assert.equal(normalizeSymbolWeight("500px"), 400);
  assert.equal(normalizeSymbolWeight(50), 100);
  assert.equal(normalizeSymbolWeight(1000), 900);
});

test("unknown motifs and hostile values cannot introduce HTML or CSS", () => {
  for (const name of ["", "unknown", "constructor", "__proto__", "toString", '<svg onload="alert(1)">', null, {}, ["plus"]]) {
    assert.equal(renderSymbol(name), "");
    assert.equal(macro(name, 400), "");
  }
  const hostile = '\" onload=\"alert(1)\"><script>bad</script><svg style=\"color:red';
  const markup = macro("cross", hostile, hostile);
  assert.match(markup, /&quot;/);
  assert.doesNotMatch(markup, /<script>| onload="|style="color:red/);
  assert.equal(weightOf(markup), 400);
});

test("Custom Element forwards only name and weight to the same trusted renderer", () => {
  let Element;
  const values = { name: "plus", weight: "500", label: "bad", style: "bad", onclick: "bad" };
  const context = vm.createContext({
    UIElement: class { getAttr(name, fallback = "") { return values[name] ?? fallback; } },
    define: (name, constructor) => { assert.equal(name, "uif-symbol"); Element = constructor; },
    renderSymbol,
  });
  const elementSource = read("src/elements/ui-symbol.js");
  vm.runInContext(elementSource.replace(/^import .*;\n/gm, "").replace("export { UISymbol };", ""), context);
  const element = new Element();
  element.render();
  assert.equal(element.innerHTML, renderSymbol("plus", 500));
  values.name = "<script>";
  element.render();
  assert.equal(element.innerHTML, "");
  assert.deepEqual(Array.from(Element.observedAttributes), ["name", "weight"]);
});

test("playground uses namespace DOM creation and keeps its duplicate geometry consistent", () => {
  const renderer = read("site/assets/playground/renderers.js");
  const literal = renderer.match(/const symbolPaths = (\{[^;]+\});/)[1];
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInNewContext(`(${literal})`))), SYMBOL_PATHS);
  const slice = renderer.slice(renderer.indexOf("const renderVanillaSymbol"), renderer.indexOf("const renderVanillaIcon"));
  assert.match(slice, /createElementNS\("http:\/\/www.w3.org\/2000\/svg", "svg"\)/);
  assert.match(slice, /createElementNS\("http:\/\/www.w3.org\/2000\/svg", "path"\)/);
  assert.match(slice, /code: host.outerHTML/);
  assert.doesNotMatch(slice, /innerHTML|insertAdjacentHTML/);
  assert.match(renderer, /symbol: renderVanillaSymbol/);
  assert.match(read("site/patterns/symbol-playground.md"), /renderer: symbol/);
});

test("CSS consumes the approved token and package exports the light DOM element", () => {
  const css = read("src/ui/patterns/symbol.css");
  assert.match(css, /@layer components/);
  for (const declaration of ["inline-size: 1em", "block-size: 1em", "inline-size: 1lh", "block-size: 1lh", "fill: none", "stroke: currentColor", "stroke-linecap: round", "stroke-linejoin: round"]) assert.ok(css.includes(declaration));
  assert.match(css, /var\(--uif-symbol-default-glyph-stroke-width-default\) \* var\(--uif-symbol-weight, 400\) \/ 400/);
  assert.doesNotMatch(css, /vector-effect|mask-image|background-color/);
  assert.ok(read("src/ui/index.css").includes('./patterns/symbol.css'));
  assert.ok(read("src/elements/index.js").includes('export { UISymbol } from "./ui-symbol.js"'));
  assert.equal(JSON.parse(read("package.json")).exports["./elements/ui-symbol"], "./dist/elements/ui-symbol.js");
  const reference = read("schemas/web-symbol.figma.ts");
  assert.match(reference, /pending component publication/);
  assert.doesNotMatch(reference, /figma\.connect\s*\(/);
});
