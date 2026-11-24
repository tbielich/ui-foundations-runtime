import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source, context = {}) => env.renderString('{% import "macros/ui.njk" as uif %}' + source, context);

test("toast macro exposes one urgency-selected live announcement", () => {
  const polite = render('{{ uif.toast(message="Saved", variant="success") }}');
  assert.match(polite, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(polite, /uif-toast success/);
  assert.match(polite, />Saved</);
  const assertive = render('{{ uif.toast(message="Payment failed", variant="error") }}');
  assert.match(assertive, /role="alert" aria-live="assertive"/);
  assert.doesNotMatch(assertive, /role="status"/);
});

test("toast macro escapes text and renders labelled action and dismiss controls", () => {
  const html = render('{{ uif.toast(message=message, actionLabel=action, dismissLabel=dismiss) }}', {
    message: '<img src=x onerror="alert(1)">',
    action: "Undo <change>",
    dismiss: 'Dismiss "message"',
  });
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /Undo &lt;change&gt;/);
  assert.match(html, /aria-label="Dismiss &quot;message&quot;"/);
  assert.doesNotMatch(html, /<img src=x/);
});

test("toast region macro labels a non-live stack", () => {
  const html = render('{% call uif.toastRegion(label="Booking updates", position="bottom-start") %}{{ uif.toast(message="Saved") }}{% endcall %}');
  assert.match(html, /class="uif-toast-region" role="region" aria-label="Booking updates"/);
  assert.match(html, /data-position="bottom-start"/);
  assert.doesNotMatch(html.match(/<div class="uif-toast-region"[^>]+>/)[0], /aria-live/);
});

test("toast playground generators preserve behavior attributes", () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(readFileSync("site/assets/playground/shared.js", "utf8"), context);
  vm.runInContext(readFileSync("site/assets/playground/code-generators.js", "utf8"), context);
  const state = { props: { message: "Saved & ready", variant: "warning", duration: 0, urgency: "assertive", actionLabel: "Undo" }, meta: {} };
  const njk = window.UIPlaygroundCodeGenerators.njk.toast(state);
  assert.match(render(njk), /uif-toast warning/);
  assert.match(render(njk), /aria-live="assertive"/);
  const wc = window.UIPlaygroundCodeGenerators.wc.toast(state);
  assert.match(wc, /<uif-toast-region/);
  assert.match(wc, /duration="0"/);
  assert.match(wc, /action-label="Undo"/);
});
