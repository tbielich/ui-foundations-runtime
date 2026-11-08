import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("illustrated message macro renders preset defaults and data-preset", () => {
  const empty = render('{{ uif.illustratedMessage(preset="empty") }}');
  assert.match(empty, /class="uif-illustrated-message"/);
  assert.match(empty, /data-preset="empty"/);
  assert.match(empty, /Nothing here yet/);
  assert.match(empty, /message-info\.svg/);

  const noResults = render('{{ uif.illustratedMessage(preset="no-results") }}');
  assert.match(noResults, /data-preset="no-results"/);
  assert.match(noResults, /No results found/);
  assert.match(noResults, /search\.svg/);
});

test("illustrated message macro falls back to the empty preset for unknown values", () => {
  const fallback = render('{{ uif.illustratedMessage(preset="made-up") }}');
  assert.match(fallback, /data-preset="empty"/);
  assert.match(fallback, /Nothing here yet/);
});

test("illustrated message macro renders a button or link action and escapes text", () => {
  const button = render('{{ uif.illustratedMessage(preset="empty", actionLabel="Create item") }}');
  assert.match(button, /uif-illustrated-message-actions/);
  assert.match(button, /<button class="uif-button solid" type="button">Create item<\/button>/);

  const link = render('{{ uif.illustratedMessage(preset="error", actionLabel="Retry", actionHref="/retry", actionVariant="outline") }}');
  assert.match(link, /<a class="uif-button outline" href="\/retry">Retry<\/a>/);

  const noAction = render('{{ uif.illustratedMessage(preset="empty") }}');
  assert.doesNotMatch(noAction, /uif-illustrated-message-actions/);

  const escaped = render('{{ uif.illustratedMessage(preset="empty", heading=h) }}'.replace("heading=h", 'heading=\'<x>&"\''));
  assert.match(escaped, /&lt;x&gt;&amp;&quot;/);
  assert.doesNotMatch(escaped, /<x>/);
});

test("illustrated message macro honors overrides and the sm local size", () => {
  const override = render('{{ uif.illustratedMessage(preset="empty", heading="Custom", description="Detail", illustrationIcon="star") }}');
  assert.match(override, /uif-illustrated-message-heading">Custom</);
  assert.match(override, /uif-illustrated-message-description">Detail</);
  assert.match(override, /star\.svg/);

  const small = render('{{ uif.illustratedMessage(preset="empty", size="sm") }}');
  assert.match(small, /class="uif-illustrated-message sm"/);
});

 test("illustrated-message action URLs reject executable schemes and escape labels", () => {
  for (const href of ["javascript:alert(1)", "java\tscript:alert(1)", "data:text/html,test", "vbscript:msgbox(1)", " javascript:alert(1)"]) {
    const html = env.renderString('{% import "macros/ui.njk" as uif %}{{ uif.illustratedMessage(actionLabel=label, actionHref=href) }}', { label: '<b>Retry</b>', href });
    assert.match(html, /href="#"/);
    assert.match(html, /&lt;b&gt;Retry&lt;\/b&gt;/);
  }
  for (const href of ["https://example.com", "http://example.com", "mailto:test@example.com", "tel:123", "/retry?x=1&y=2", "#retry"]) {
    const html = env.renderString('{% import "macros/ui.njk" as uif %}{{ uif.illustratedMessage(actionLabel="Retry", actionHref=href) }}', { href });
    assert.ok(html.includes('href="' + href.replaceAll('&', '&amp;') + '"'));
  }
 });
