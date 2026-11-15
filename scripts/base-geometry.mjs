import fs from "node:fs";
import path from "node:path";

const references = text => [...text.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)].map(match => match[1]);
const forbidden = name => /color|background|foreground|surface|shadow|radius|corner|font-family|font-base|font-lead|font-heading(?!-font-weight)/i.test(name);

/** Numeric Brand A dependency closure only; no second token source or Figma IDs. */
export function buildBaseGeometry(root, dist) {
  const directory = path.join(dist, "tokens/css");
  const definitions = new Map();
  for (const file of ["core-primitives.tokens.css", "typography-fluid.tokens.css", "semantics-brands.tokens.brand-a.css", "semantics-roles.tokens.css", "patterns-ui.tokens.css"]) {
    const css = fs.readFileSync(path.join(directory, file), "utf8");
    for (const match of css.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+);/g)) definitions.set(match[1], match[2].trim());
  }
  const sizing = fs.readFileSync(path.join(root, "src/base/sizing.css"), "utf8");
  const local = new Set([...sizing.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)].map(match => match[1]));
  const selected = new Map();
  function visit(name, visiting = new Set()) {
    if (local.has(name) || selected.has(name)) return;
    if (forbidden(name)) throw new Error(`Non-geometric Base token: ${name}`);
    if (visiting.has(name)) throw new Error(`Base geometry cycle: ${name}`);
    const value = definitions.get(name);
    if (value === undefined) throw new Error(`Missing Base geometry token: ${name}`);
    if (/#|\brgba?\(|\bhsla?\(|url\(/i.test(value)) throw new Error(`Non-geometric Base value: ${name}`);
    const next = new Set(visiting).add(name);
    for (const dependency of references(value)) visit(dependency, next);
    selected.set(name, value);
  }
  for (const name of references(sizing)) visit(name);
  const css = "/* Generated geometry-only dependency closure from existing Brand A tokens. */\n@layer tokens {\n  :root {\n" + [...selected].map(([name,value]) => `    ${name}: ${value};`).join("\n") + "\n  }\n}\n";
  fs.mkdirSync(path.join(dist, "base"), { recursive: true });
  fs.writeFileSync(path.join(dist, "base/geometry.css"), css);
  return { count: selected.size, names: [...selected.keys()] };
}
