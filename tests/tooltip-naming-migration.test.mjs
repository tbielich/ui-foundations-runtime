import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Tooltip CSS exposes canonical UIF naming with v1 class aliases", async () => {
  const [css, layout] = await Promise.all([
    read("src/ui/patterns/tooltip.css"),
    read("src/core/recipes/layout.css"),
  ]);

  for (const className of ["tooltip", "tooltip-trigger"]) {
    assert.match(css, new RegExp(`:is\\(\\.uif-${className}, \\.${className}\\)`));
  }
  assert.match(layout, /:is\(\.uif-tooltip, \.tooltip\)/);
  assert.match(css, /var\(--uif-tooltip-/);
  assert.doesNotMatch(css, /var\(--tooltip-/);
  assert.doesNotMatch(css, /\.uif-tooltip(?:__|--)/);
});

test("Tooltip Figma export contains canonical tokens without legacy aliases", async () => {
  const tokenExport = await read("figma/exports/Patterns (UI).tokens.json");
  const canonical = tokenExport.match(/var\(--uif-tooltip-/g) ?? [];

  assert.equal(canonical.length, 5);
  assert.doesNotMatch(tokenExport, /var\(--tooltip-/);
});

test("Tooltip-owned emitters produce canonical classes", async () => {
  const sources = await Promise.all([
    read("src/elements/ui-tooltip.js"),
    read("site/_includes/macros/ui.njk"),
    read("site/assets/playground/renderers.js"),
    read("schemas/web-tooltip.figma.ts"),
  ]);

  for (const source of sources) assert.match(source, /uif-tooltip/);
  assert.doesNotMatch(sources[0], /class="tooltip(?:[\s"])/);
  assert.doesNotMatch(sources[3], /class="tooltip(?:[\s"])/);
});

test("Tooltip migration guide and registration use the canonical namespace", async () => {
  const [documentation, element] = await Promise.all([
    read("MIGRATION.md"),
    read("src/elements/ui-tooltip.js"),
  ]);

  assert.match(documentation, /\| Tooltip \|.*`--uif-tooltip-\*`/);
  assert.match(element, /define\("uif-tooltip", UITooltip\)/);
});

test("Tooltip Web Component maintains a stable accessible description relationship", async () => {
  const element = await read("src/elements/ui-tooltip.js");

  assert.match(element, /let tooltipIdSequence = 0;/);
  assert.match(element, /this\._tooltipId = `uif-tooltip-\$\{\+\+tooltipIdSequence\}`/);
  assert.match(element, /return \["text", "placement", "tooltip-id"\];/);
  assert.match(element, /const tooltipId = explicitId \|\| this\._tooltipId;/);
  assert.match(element, /tooltip\.id = tooltipId;/);
  assert.match(element, /trigger\.getAttribute\("aria-describedby"\)/);
  assert.match(element, /describedBy\.add\(tooltipId\);/);
  assert.match(
    element,
    /trigger\.setAttribute\("aria-describedby", Array\.from\(describedBy\)\.join\(" "\)\);/,
  );
});


test("Tooltip exposes bounded delay and pointer behavior across Runtime surfaces", async () => {
  const [element, css, macro, docs, playground, renderer, generators, codeConnect] =
    await Promise.all([
      read("src/elements/ui-tooltip.js"),
      read("src/ui/patterns/tooltip.css"),
      read("site/_includes/macros/ui.njk"),
      read("site/patterns/tooltip.md"),
      read("site/patterns/tooltip-playground.md"),
      read("site/assets/playground/renderers.js"),
      read("site/assets/playground/code-generators.js"),
      read("schemas/web-tooltip.figma.ts"),
    ]);

  assert.match(element, /"show-delay", "hide-delay"/);
  assert.match(element, /--uif-tooltip-show-delay: \$\{showDelay\}ms/);
  assert.match(element, /--uif-tooltip-hide-delay: \$\{hideDelay\}ms/);
  assert.match(css, /\.uif-tooltip, \.tooltip\)::after/);
  assert.match(css, /var\(--size-spacing-200\)/);
  assert.match(css, /--uif-tooltip-show-delay, 300ms/);
  assert.match(css, /--uif-tooltip-hide-delay, 0ms/);
  assert.match(css, /:hover > :is\(\.uif-tooltip, \.tooltip\)/);
  assert.match(css, /:focus-within > :is\(\.uif-tooltip, \.tooltip\)/);
  for (const placement of ["top", "bottom", "left", "right"]) {
    assert.match(css, new RegExp(`data-placement="${placement}"\\]::after`));
  }

  assert.match(macro, /showDelay=300, hideDelay=0, tooltipId=''/);
  assert.match(docs, /show-delay/);
  assert.match(docs, /hide-delay/);
  assert.match(playground, /name: showDelay/);
  assert.match(playground, /name: hideDelay/);
  assert.match(renderer, /tooltip-playground-preview/);
  assert.match(generators, /show-delay=/);
  assert.match(generators, /hide-delay=/);
  assert.match(codeConnect, /aria-describedby="uif-tooltip-code-connect"/);
  assert.match(codeConnect, /id="uif-tooltip-code-connect"/);
});
