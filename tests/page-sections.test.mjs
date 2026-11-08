import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { pageSections } = createRequire(import.meta.url)("../site/lib/page-sections.js");

test("pattern hero includes all introduction markup and ends immediately before Anatomy", () => {
  const intro = '<div class="docs-hero"><h2>Preview title</h2></div><p>Introduction</p>';
  const body = '<h2 id="anatomy">Anatomy</h2><p>Parts</p>';
  assert.deepEqual(pageSections(intro + body, true), { hero: intro, body });
});

test("other pages and patterns without Anatomy retain their complete body", () => {
  const html = '<h2 id="options">Options</h2><p>Content</p>';
  assert.deepEqual(pageSections(html, true), { hero: "", body: html });
  assert.deepEqual(pageSections(html), { hero: "", body: html });
});

test("pattern previews without Anatomy stay in the hero before Options", () => {
  const intro = '<div class="docs-hero"><div class="docs-hero-preview">Tooltip example</div></div>';
  const body = '<h2 id="options">Options</h2><p>Placement</p>';
  assert.deepEqual(pageSections(intro + body, true), { hero: intro, body });
});

test("Calendar content starts at Usage even when Anatomy appears later", () => {
  const intro = '<div class="docs-hero"><div>Calendar example</div></div>';
  const body = '<h2 id="usage">Usage</h2><p>Instructions</p><h2 id="anatomy">Anatomy</h2>';
  assert.deepEqual(pageSections(intro + body, true), { hero: intro, body });
});
