import fs from "node:fs";
import path from "node:path";

/** Runtime context ratios derived from existing Core typography, not new token values. */
export function scaleRatios(core) {
  const sizes = core.Font?.Size;
  const values = ["xs", "sm", "md"].map(key => sizes?.[key]?.$value);
  if (values.some(value => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Container scale requires positive Core Font/Size xs, sm and md values");
  }
  const [small, medium, large] = values;
  if (!(small < medium && medium < large)) throw new Error("Container scale requires ordered typography anchors");
  return { small: small / medium, medium: 1, large: large / medium };
}

export function buildScaleContext(root, dist) {
  const core = JSON.parse(fs.readFileSync(path.join(root, "figma/exports/Core (Primitives).tokens.json"), "utf8"));
  const ratios = scaleRatios(core);
  const defaults = Object.entries(ratios).map(([name, value]) => `    --_uif-scale-${name}: ${value};`).join("\n");
  const rules = fs.readFileSync(path.join(root, "src/core/context/scale.css"), "utf8");
  fs.writeFileSync(path.join(dist, "core/context/scale.css"),
    `/* Generated from Core Font/Size xs, sm, md; implementation ratios, not new Figma tokens. */\n@layer context {\n  :root {\n${defaults}\n  }\n}\n${rules}`);
}
