import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source, context = {}) => env.renderString('{% import "macros/ui.njk" as uif %}' + source, context);

test("popover macro binds a labelled trigger and dialog", () => {
  const html = render('{% call uif.popover(triggerId="booking-help", triggerLabel="Booking help", label="Booking details", placement="top") %}<a href="/help">Read help</a>{% endcall %}');
  assert.match(html, /id="booking-help"/);
  assert.match(html, /class="uif-button outline uif-popover-trigger"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /<uif-popover trigger="booking-help" label="Booking details" placement="top">/);
  assert.match(html, /<a href="\/help">Read help<\/a>/);
});

test("popover macro escapes labels and constrains placement", () => {
  const html = render('{% call uif.popover(triggerId="help", triggerLabel=trigger, label=label, placement="sideways") %}Text{% endcall %}', {
    trigger: "More <details>",
    label: 'Details "panel"',
  });
  assert.match(html, /More &lt;details&gt;/);
  assert.match(html, /label="Details &quot;panel&quot;"/);
  assert.match(html, /placement="bottom"/);
});

test("popover playground generators preserve trigger relationship and content", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { triggerLabel: "Open details", label: "Trip details", placement: "left", content: "Flexible fare" }, meta: {} };
  const njk = window.UIPlaygroundCodeGenerators.njk.popover(state);
  assert.match(render(njk), /trigger="popover-example-trigger"/);
  assert.match(render(njk), /Flexible fare/);
  const wc = window.UIPlaygroundCodeGenerators.wc.popover(state);
  assert.match(wc, /aria-controls="popover-example"/);
  assert.match(wc, /placement="left"/);
});
