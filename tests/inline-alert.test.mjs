import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const render = (source) => env.renderString('{% import "macros/ui.njk" as uif %}' + source);

test("inline alert macro renders role=alert, variant class and a dismiss button", () => {
  const html = render('{{ uif.inlineAlert(title="Saved", description="All good", variant="positive", dismissible=true) }}');
  assert.match(html, /class="uif-inline-alert positive"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /uif-inline-alert-title">Saved</);
  assert.match(html, /uif-inline-alert-description">All good</);
  assert.match(html, /uif-inline-alert-dismiss/);
  assert.match(html, /aria-label="Dismiss"/);
});

test("inline alert macro escapes user text and omits empty title and description", () => {
  const escaped = render('{{ uif.inlineAlert(title=t, description=d, variant="info") }}'
    .replace("title=t", 'title=\'<b>Hi</b>\'').replace("description=d", 'description=\'A "quote" & <tag>\''));
  assert.match(escaped, /&lt;b&gt;Hi&lt;\/b&gt;/);
  assert.match(escaped, /A &quot;quote&quot; &amp; &lt;tag&gt;/);
  assert.doesNotMatch(escaped, /<b>Hi<\/b>/);

  const titleOnly = render('{{ uif.inlineAlert(title="Only", variant="info") }}');
  assert.match(titleOnly, /uif-inline-alert-title/);
  assert.doesNotMatch(titleOnly, /uif-inline-alert-description/);
});

test("inline alert macro picks the variant default icon and honors an override", () => {
  const info = render('{{ uif.inlineAlert(title="Info", variant="info") }}');
  assert.match(info, /info-circled\.svg/);
  const negative = render('{{ uif.inlineAlert(title="Err", variant="negative") }}');
  assert.match(negative, /cross-circled\.svg/);
  const override = render('{{ uif.inlineAlert(title="Custom", variant="info", icon="bell") }}');
  assert.match(override, /bell\.svg/);
});

test("inline alert macro falls back to neutral and renders no icon by default", () => {
  const neutral = render('{{ uif.inlineAlert(title="Neutral", variant="made-up") }}');
  assert.match(neutral, /class="uif-inline-alert"/);
  assert.doesNotMatch(neutral, /uif-inline-alert-icon/);
});

test("inline alert macro applies the sm local size class", () => {
  const small = render('{{ uif.inlineAlert(title="Small", variant="info", size="sm") }}');
  assert.match(small, /class="uif-inline-alert info sm"/);
});

 test("inline-alert action URLs reject executable schemes and escape labels", () => {
  for (const href of ["javascript:alert(1)", "java\tscript:alert(1)", "data:text/html,test", "vbscript:msgbox(1)", " javascript:alert(1)"]) {
    const html = env.renderString('{% import "macros/ui.njk" as uif %}{{ uif.inlineAlert(actionLabel=label, actionHref=href) }}', { label: '<b>Retry</b>', href });
    assert.match(html, /href="#"/);
    assert.match(html, /&lt;b&gt;Retry&lt;\/b&gt;/);
  }
  for (const href of ["https://example.com", "http://example.com", "mailto:test@example.com", "tel:123", "/retry?x=1&y=2", "#retry"]) {
    const html = env.renderString('{% import "macros/ui.njk" as uif %}{{ uif.inlineAlert(actionLabel="Retry", actionHref=href) }}', { href });
    assert.ok(html.includes('href="' + href.replaceAll('&', '&amp;') + '"'));
  }
 });

test("inline alert optional action supports button, link and omission", () => {
  assert.match(render('{{ uif.inlineAlert(actionLabel="Retry") }}'), /<button type="button" class="uif-button outline">Retry<\/button>/);
  assert.match(render('{{ uif.inlineAlert(actionLabel="Retry", actionHref="/retry") }}'), /<a class="uif-button outline" href="\/retry">Retry<\/a>/);
  assert.doesNotMatch(render('{{ uif.inlineAlert(title="Hello") }}'), /uif-inline-alert-action/);
});
