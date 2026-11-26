import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/ui/components/content.js", import.meta.url), "utf8");
const { parseContent, safeContentUrl } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

test("content parser covers assistant answer blocks and nested ordered/unordered lists", () => {
  const nodes = parseContent("# Answer\n\nParagraph with **strong**, *emphasis*, `code` and [link](https://example.com).\n\n1. First\n   - Nested\n     - Deeper\n2. Second\n\n> Quoted answer\n\n| Key | Value |\n| --- | --- |\n| one | two |\n");
  assert.deepEqual(nodes.map(n => n.type), ["heading", "paragraph", "list", "quote", "table"]);
  assert.equal(nodes[2].items.length, 2);
  assert.equal(nodes[2].items[0][1].items[0][1].items[0][0].text, "Deeper");
  assert.equal(nodes[4].rows[0][1], "two");
});

test("fenced code retains tabs, blank lines, spaces, CRLF and literal HTML exactly", () => {
  const code = "\tconst x = '<img src=x onerror=alert(1)>';  \r\n\r\n";
  assert.equal(parseContent("```js\r\n" + code + "```\r\n")[0].text, code);
  assert.equal(parseContent("~~~\na\n~~~\n")[0].text, "a\n");
  assert.equal(parseContent("```\nunterminated")[0].text, "unterminated");
  assert.equal(parseContent("````\n```\n````")[0].text, "```\n");
});

test("unsafe URL schemes and obfuscation never produce approved hrefs", () => {
  for (const value of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "java\nscript:alert(1)", "data:text/html,test", "vbscript:test", "file:///tmp/a", "//evil.example", "\\evil", " javascript:foo", "https:\\evil", "&#106;avascript:foo", "javascript%3Afoo"]) {
    assert.equal(safeContentUrl(value), null, value);
  }
  for (const value of ["https://example.com/a", "http://example.com", "mailto:hello@example.com", "#section", "/docs/", "./docs", "../docs"]) assert.ok(safeContentUrl(value), value);
});

test("unsupported input is preserved and long answers use a bounded plain fallback", () => {
  const input = '<script>alert(1)</script>\n![alt](https://example.com/image.png)\n<div onclick="x">raw</div>';
  assert.equal(parseContent(input)[0].text, input);
  const huge = "*".repeat(200001);
  assert.deepEqual(parseContent(huge), [{ type: "plain", text: huge }]);
  assert.deepEqual(parseContent(""), []);
  assert.throws(() => parseContent(null), TypeError);
});

test("table escaped pipes and ordered start are retained", () => {
  const table = parseContent('| Name | Value |\n| --- | --- |\n| a\\|b | c |')[0];
  assert.equal(table.rows[0][0], "a|b");
  assert.equal(parseContent("3. Third\n4. Fourth")[0].start, 3);
});
