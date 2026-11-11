import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const output = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const [pack] = JSON.parse(output);
const files = pack.files.map(file => file.path);
const binaries = files.filter(file => /\.(?:woff2?|ttf|otf|eot|ttc)$/i.test(file));
const cssFiles = files.filter(file => file.endsWith(".css"));
if (!cssFiles.length || !files.includes("dist/main.css")) throw new Error("Build the Runtime package before checking font ownership");
const loaders = cssFiles.filter(file => /@font-face|fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(fs.readFileSync(path.join(root, file), "utf8")));
if (binaries.length || loaders.length) {
  throw new Error(`Runtime package must leave font loading to consumers. Binaries: ${binaries.join(", ") || "none"}; CSS loaders: ${loaders.join(", ") || "none"}`);
}
console.log(JSON.stringify({ gate: "PASS", packedFiles: files.length, packedCssFiles: cssFiles.length, fontBinaries: binaries.length, automaticFontLoaders: loaders.length }));
