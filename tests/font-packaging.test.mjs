import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? files(location) : [location];
  });
}

test("Runtime source contains no bundled font binaries or automatic font loader", () => {
  const sources = files(path.join(root, "src"));
  assert.deepEqual(sources.filter(file => /\.(?:woff2?|ttf|otf|eot|ttc)$/i.test(file)), []);
  for (const filename of sources.filter(file => file.endsWith(".css"))) {
    const css = fs.readFileSync(filename, "utf8");
    assert.doesNotMatch(css, /@font-face|fonts\.googleapis\.com|fonts\.gstatic\.com/, path.relative(root, filename));
    assert.doesNotMatch(css, /@import[^\n]*\/fonts\.css/, path.relative(root, filename));
  }
});

test("docs opt into their own relative local font loader", () => {
  const css = fs.readFileSync(path.join(root, "site/assets/brand-fonts.css"), "utf8");
  assert.equal([...css.matchAll(/@font-face/g)].length, 7);
  for (const match of css.matchAll(/url\(["']([^"']+)["']\)/g)) {
    assert.ok(match[1].startsWith("./fonts/brand/"));
    assert.ok(fs.existsSync(path.resolve(root, "site/assets", match[1])), match[1]);
  }
  const layout = fs.readFileSync(path.join(root, "site/_includes/layouts/docs.njk"), "utf8");
  assert.match(layout, /href="\/assets\/brand-fonts\.css"/);
});
