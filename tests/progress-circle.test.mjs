import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("ProgressCircle exposes canonical UIF integration surfaces", async () => {
  const sources = await Promise.all([
    read("src/ui/patterns/progress-circle.css"),
    read("src/elements/ui-progress-circle.js"),
    read("site/_includes/macros/ui.njk"),
    read("site/assets/playground/renderers.js"),
    read("schemas/web-progress-circle.figma.ts"),
  ]);
  for (const source of sources) assert.match(source, /uif-progress-circle/);
});

test("ProgressCircle tokens are owned by the pattern and reference existing layers", async () => {
  const tokenExport = await read("figma/exports/Patterns (UI).tokens.json");
  for (const token of [
    "--uif-progress-circle-track-color",
    "--uif-progress-circle-indicator-color",
    "--uif-progress-circle-stroke-width",
    "--uif-progress-circle-size-sm",
    "--uif-progress-circle-size-md",
    "--uif-progress-circle-size-lg",
  ]) assert.match(tokenExport, new RegExp(token));
  assert.doesNotMatch(tokenExport, /var\(--progress-circle-/);
});

test("ProgressCircle component preserves determinate and indeterminate accessibility semantics", async () => {
  const element = await read("src/elements/ui-progress-circle.js");
  assert.match(element, /role="progressbar"/);
  assert.match(element, /aria-valuenow/);
  assert.match(element, /aria-valuemin="0"/);
  assert.match(element, /aria-valuemax="100"/);
  assert.match(element, /is-indeterminate/);
  assert.match(element, /define\("uif-progress-circle", UIProgressCircle\)/);
});
