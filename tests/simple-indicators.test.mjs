import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = source => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("progress macro preserves zero, clamps finite values and omits fabricated indeterminate percentages", () => {
  assert.match(render('{{ uif.progressBar(value=0, label="Uploading", showValue=true) }}'), /aria-valuenow="0"/);
  assert.match(render('{{ uif.progressBar(value=-10) }}'), /aria-valuenow="0"/);
  assert.match(render('{{ uif.progressBar(value=150) }}'), /aria-valuenow="100"/);
  const unknown = render('{{ uif.progressBar(label="Waiting", showValue=true) }}');
  assert.doesNotMatch(unknown, /aria-valuenow|uif-progress-bar-value|--_progress:/);
  assert.match(unknown, /is-indeterminate/);
  const escaped = render('{{ uif.progressBar(value=50, label=label) }}'.replace('label=label', 'label=\'A "quoted" <task>\''));
  assert.match(escaped, /A &quot;quoted&quot; &lt;task&gt;/);
  assert.doesNotMatch(escaped, /<task>/);
});

test("meter macro keeps native and visual measurements aligned for nonzero, inverted and exceeded ranges", () => {
  const custom = render('{{ uif.meter(label="Storage", min=10, max=30, value=20, valueText="10 GB remaining") }}');
  assert.match(custom, /min="10" max="30" value="20"/);
  assert.match(custom, /inline-size: 50%/);
  assert.match(custom, /aria-valuetext="10 GB remaining"/);
  const clamped = render('{{ uif.meter(min=10, max=30, value=99) }}');
  assert.match(clamped, /value="30"/);
  assert.match(clamped, /inline-size: 100%/);
  const inverted = render('{{ uif.meter(min=10, max=5, value=10.5) }}');
  assert.match(inverted, /min="10" max="11" value="10.5"/);
  assert.match(inverted, /inline-size: 50%/);
  assert.match(render('{{ uif.statusLight("<b>Online</b>", variant="invalid") }}'), /&lt;b&gt;Online&lt;\/b&gt;/);
});

test("indicator playground generators preserve all controls and render usable escaped Nunjucks", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const generators = window.UIPlaygroundCodeGenerators;
  const state = { props: { value: 0, min: 0, max: 200, label: 'A "quote" & <label>', valueText: '0 of 200', variant: 'positive', size: 'sm', showValue: true, indeterminate: false }, children: '<Online>', meta: {} };
  const meter = render(generators.njk.meter(state));
  assert.match(meter, /max="200" value="0"/);
  assert.match(meter, /aria-valuetext="0 of 200"/);
  const progress = render(generators.njk["progress-bar"](state));
  assert.match(progress, /aria-valuenow="0"/);
  assert.match(progress, /uif-progress-bar-value">0%/);
  assert.match(progress, /A &quot;quote&quot; &amp; &lt;label&gt;/);
  assert.match(generators.wc["progress-bar"](state), /value="0"/);
  assert.match(generators.wc["progress-bar"](state), /show-value/);
  assert.doesNotMatch(generators.wc["progress-bar"](state), / indeterminate/);
  assert.match(render(generators.njk["status-light"](state)), /&lt;Online&gt;/);
});

test("restored tokens use existing semantics and declare source reconciliation explicitly", () => {
  const tokens = JSON.parse(readFileSync("figma/exports/Patterns (UI).tokens.json"));
  const semantics = JSON.parse(readFileSync("figma/exports/Semantics (Roles).tokens.json"));
  const projection = JSON.parse(readFileSync("figma/token-projection.json"));
  const provenance = JSON.parse(readFileSync("docs/evidence/simple-components-2026-11-07/token-provenance.json"));
  const walk = (node, path) => {
    if (node.$value !== undefined) {
      assert.ok(projection.codeOnlyExceptions.some(e => e.path === path));
      assert.ok(provenance.tokens.some(e => e.path === path));
      assert.equal(node.$extensions["com.figma.variableId"], undefined);
      if (node.$value.$ref) {
        assert.ok(node.$value.$ref.startsWith("Semantics/"));
        assert.ok(node.$value.$ref.split("/").reduce((v, k) => v?.[k], semantics), node.$value.$ref);
      }
      return;
    }
    for (const [key, value] of Object.entries(node)) if (typeof value === "object") walk(value, `${path}/${key}`);
  };
  for (const group of ["Status Light", "Meter", "Progress Bar"]) walk(tokens[group], group);
});
