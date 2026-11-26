import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLegacyCss } from "../scripts/build-legacy-css.mjs";

test("legacy bundle orders UIF layers and retains nested rules, comments and quoted braces", () => {
  const css = '@layer components { .control { content: "}"; color: red; } }\n' +
    '@layer reset { /* } */ @media (prefers-reduced-motion: reduce) { * { animation: none !important; } } }\n' +
    '@layer tokens { :root { --x: "{text}"; } }\n.external { color: blue; }';
  const out = buildLegacyCss(css);
  assert.ok(out.indexOf("@media") < out.indexOf(":root"));
  assert.ok(out.indexOf(":root") < out.indexOf(".control"));
  assert.ok(out.indexOf(".control") < out.indexOf(".external"));
  assert.ok(out.includes('content: "}"'));
  assert.ok(out.includes('/* } */'));
  assert.ok(!out.includes("@layer"));
});

test("unsupported layers and malformed sources fail instead of silently losing rules", () => {
  for (const css of ['@layer unknown { .x {} }', '@layer base;', '@layer base { @layer nested {} }', '@layer base { .x { color: red; }', '@layer base { .x { content: "broken; } }']) {
    assert.throws(() => buildLegacyCss(css));
  }
});
