import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("Illustrated Message CSS exposes canonical UIF naming with v1 class aliases", () => {
  const css = read("src/ui/patterns/illustrated-message.css");
  for (const className of [
    "illustrated-message",
    "illustrated-message-illustration",
    "illustrated-message-content",
    "illustrated-message-heading",
    "illustrated-message-description",
    "illustrated-message-actions",
  ]) {
    assert.match(css, new RegExp(`:is\\(\\.uif-${className}, \\.${className}\\)`));
  }
  assert.match(css, /var\(--uif-illustrated-message-/);
  assert.doesNotMatch(css, /var\(--illustrated-message-/);
});

test("Illustrated Message CSS is imported into the UI index", () => {
  assert.match(read("src/ui/index.css"), /illustrated-message\.css/);
});

test("Illustrated Message Figma export contains canonical tokens aliased to Semantics", () => {
  const tokenExport = read("figma/exports/Patterns (UI).tokens.json");
  for (const tokenName of [
    "--uif-illustrated-message-gap",
    "--uif-illustrated-message-content-gap",
    "--uif-illustrated-message-heading-text-color",
    "--uif-illustrated-message-description-text-color",
    "--uif-illustrated-message-illustration-color",
    "--uif-illustrated-message-illustration-size",
  ]) {
    assert.match(tokenExport, new RegExp(tokenName.replaceAll("-", "\\-")));
  }
  assert.doesNotMatch(tokenExport, /var\(--illustrated-message-/);

  const tokens = JSON.parse(tokenExport);
  const group = tokens["Illustrated Message"];
  assert.ok(group, "Illustrated Message token group exists");
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

test("Illustrated Message restored tokens are declared as code-only exceptions", () => {
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
  walk(tokens["Illustrated Message"], "Illustrated Message");
  for (const tokenPath of paths) {
    assert.ok(
      projection.codeOnlyExceptions.some((entry) => entry.path === tokenPath),
      `missing codeOnlyException for ${tokenPath}`,
    );
  }
});

test("Illustrated Message-owned emitters produce canonical classes and preset support", () => {
  const sources = [
    read("src/elements/ui-illustrated-message.js"),
    read("site/_includes/macros/ui.njk"),
    read("site/assets/playground/renderers.js"),
    read("schemas/web-illustrated-message.figma.ts"),
  ];
  for (const source of sources) {
    assert.match(source, /uif-illustrated-message/);
  }
  assert.match(sources[0], /slot="illustration"/);
  assert.match(sources[0], /slot="action"/);
  assert.match(sources[0], /empty/);
  assert.match(sources[0], /error/);
  assert.match(sources[0], /no-results/);
  assert.doesNotMatch(sources[0], /class="illustrated-message(?:[\s"])/);
  assert.doesNotMatch(sources[3], /["']illustrated-message["']/);
});

test("Illustrated Message Code Connect stays inactive without a fabricated node id", () => {
  const schema = read("schemas/web-illustrated-message.figma.ts");
  assert.doesNotMatch(schema, /figma\.connect\(/);
  assert.doesNotMatch(schema, /node-id/);
});

test("Illustrated Message public registration and package export use the canonical namespace", () => {
  assert.match(read("src/elements/ui-illustrated-message.js"), /define\("uif-illustrated-message", UIIllustratedMessage\)/);
  assert.match(read("src/elements/index.js"), /UIIllustratedMessage/);
  assert.match(read("src/elements/index.d.ts"), /"uif-illustrated-message": UIIllustratedMessage/);
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./elements/ui-illustrated-message"], "./dist/elements/ui-illustrated-message.js");
});

test("Illustrated Message docs and playground pages exist", () => {
  assert.match(read("site/patterns/illustrated-message.md"), /illustratedMessage|uif-illustrated-message/);
  assert.match(read("site/patterns/illustrated-message-playground.md"), /renderer: illustrated-message/);
});
