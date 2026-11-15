import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("InlineAlert CSS exposes canonical UIF naming", () => {
  const css = read("src/ui/patterns/inline-alert.css");
  assert.match(css, /\.uif-inline-alert/);
  assert.match(css, /var\(--uif-inline-alert-/);
  assert.doesNotMatch(css, /var\(--inline-alert-/);
  assert.doesNotMatch(css, /\.uif-inline-alert(?:__|--)/);
});

test("InlineAlert CSS defines info, positive, negative, notice variants", () => {
  const css = read("src/ui/patterns/inline-alert.css");
  assert.match(css, /\.uif-inline-alert\.info/);
  assert.match(css, /\.uif-inline-alert\.positive/);
  assert.match(css, /\.uif-inline-alert\.negative/);
  assert.match(css, /\.uif-inline-alert\.notice/);
});

test("InlineAlert CSS includes dismiss and is-hidden support", () => {
  const css = read("src/ui/patterns/inline-alert.css");
  assert.match(css, /\.uif-inline-alert-dismiss/);
  assert.match(css, /\.uif-inline-alert\.is-hidden/);
});

test("InlineAlert CSS is imported into the UI index", () => {
  assert.match(read("src/ui/index.css"), /inline-alert\.css/);
});

test("InlineAlert Figma token export contains canonical tokens aliased to Semantics", () => {
  const tokenExport = read("figma/exports/Patterns (UI).tokens.json");
  assert.match(tokenExport, /var\(--uif-inline-alert-/);
  assert.doesNotMatch(tokenExport, /var\(--inline-alert-/);
  const tokens = JSON.parse(tokenExport);
  const group = tokens["Inline Alert"];
  assert.ok(group, "Inline Alert token group exists");
  const walk = (node) => {
    if (node.$value !== undefined) {
      if (node.$value && node.$value.$ref) {
        assert.ok(node.$value.$ref.startsWith("Semantics/"), node.$value.$ref);
      }
      assert.equal(node.$extensions?.["com.figma.variableId"], undefined);
      return;
    }
    for (const value of Object.values(node)) {
      if (value && typeof value === "object") walk(value);
    }
  };
  walk(group);
});

test("InlineAlert restored tokens are declared as code-only exceptions", () => {
  const projection = JSON.parse(read("figma/token-projection.json"));
  const tokens = JSON.parse(read("figma/exports/Patterns (UI).tokens.json"));
  const paths = [];
  const walk = (node, prefix) => {
    if (node.$value !== undefined) {
      paths.push(prefix);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (value && typeof value === "object") walk(value, `${prefix}/${key}`);
    }
  };
  walk(tokens["Inline Alert"], "Inline Alert");
  for (const tokenPath of paths) {
    assert.ok(
      projection.codeOnlyExceptions.some((entry) => entry.path === tokenPath),
      `missing codeOnlyException for ${tokenPath}`,
    );
  }
});

test("InlineAlert-owned emitters use canonical classes", () => {
  for (const relativePath of [
    "src/elements/ui-inline-alert.js",
    "site/_includes/macros/ui.njk",
    "site/assets/playground/renderers.js",
    "schemas/web-inline-alert.figma.ts",
  ]) {
    assert.match(read(relativePath), /uif-inline-alert/);
  }
});

test("InlineAlert Code Connect stays inactive without a fabricated node id", () => {
  const schema = read("schemas/web-inline-alert.figma.ts");
  assert.doesNotMatch(schema, /figma\.connect\(/);
  assert.doesNotMatch(schema, /node-id/);
});

test("InlineAlert element is registered and exported", () => {
  const element = read("src/elements/ui-inline-alert.js");
  assert.match(element, /define\("uif-inline-alert", UIInlineAlert\)/);
  const index = read("src/elements/index.js");
  assert.match(index, /UIInlineAlert/);
  assert.match(index, /ui-inline-alert\.js/);
  assert.match(read("src/elements/index.d.ts"), /"uif-inline-alert": UIInlineAlert/);
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./elements/ui-inline-alert"], "./dist/elements/ui-inline-alert.js");
});

test("InlineAlert docs and playground pages exist", () => {
  assert.match(read("site/patterns/inline-alert.md"), /uif-inline-alert|inlineAlert/);
  assert.match(read("site/patterns/inline-alert-playground.md"), /renderer: inline-alert/);
});
