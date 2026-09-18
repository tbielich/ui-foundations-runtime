import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Dialog uses canonical native naming and behavior", async () => {
  const [element, css, docs, playground, schema, figma] = await Promise.all([
    read("src/elements/ui-dialog.js"),
    read("src/ui/patterns/dialog.css"),
    read("site/components/dialog.md"),
    read("site/components/dialog-playground.md"),
    read("schemas/web-dialog.ts"),
    read("schemas/web-dialog.figma.ts"),
  ]);

  assert.match(element, /define\("uif-dialog", UIDialog\)/);
  assert.match(element, /showModal\(\)/);
  assert.match(element, /uif-dialog-confirm/);
  assert.match(element, /uif-dialog-cancel/);
  assert.match(element, /uif-dialog-close/);
  assert.match(element, /event\.preventDefault\(\)/);

  assert.doesNotMatch(element, /uif-modal/);
  assert.doesNotMatch(element, /variant/);
  assert.doesNotMatch(element, /sizeAttr|sizeClass/);
  assert.doesNotMatch(element, /clickedInside|getBoundingClientRect/);

  assert.match(css, /dialog\.uif-dialog/);
  assert.doesNotMatch(css, /modal-root|modal-overlay|uif-modal/);
  assert.doesNotMatch(css, /\.sm|\.md|\.lg/);

  for (const source of [docs, playground, schema, figma]) {
    assert.doesNotMatch(source, /variant="alert"|size="(?:s|m|l)"|uif-modal/);
  }

  assert.match(docs, /Backdrop clicks do not dismiss/);
  assert.match(docs, /does not force close/);
  assert.match(docs, /consumer decides the appropriate fallback focus target/);
});

test("Dialog integration surfaces use canonical Dialog API", async () => {
  const [index, types, styles, macros, renderers, generators] = await Promise.all([
    read("src/elements/index.js"),
    read("src/elements/index.d.ts"),
    read("src/ui/index.css"),
    read("site/_includes/macros/ui.njk"),
    read("site/assets/playground/renderers.js"),
    read("site/assets/playground/code-generators.js"),
  ]);

  assert.match(index, /ui-dialog\.js/);
  assert.match(types, /class UIDialog/);
  assert.match(types, /"uif-dialog": UIDialog/);
  assert.match(styles, /patterns\/dialog\.css/);
  assert.match(macros, /macro dialog\(/);
  assert.match(renderers, /renderVanillaDialog/);
  assert.match(generators, /dialog: njkDialog/);
  assert.match(generators, /dialog: wcDialog/);
});
