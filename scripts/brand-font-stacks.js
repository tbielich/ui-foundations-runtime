const fs = require("node:fs");
const path = require("node:path");
const { loadFontFamilyCompatibility } = require("./font-family-compatibility.js");

/** Runtime stack representation of single-family Figma values; no extra primitives. */
function loadBrandFontStacks(root, projection) {
  const pointer = projection?.codeOnlyBrandTypography;
  if (!pointer) return [];
  if (!/^[a-z0-9-]+\.json$/.test(pointer.manifest || "")) throw new Error("Invalid font-stack manifest pointer");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "figma", pointer.manifest), "utf8"));
  const entries = manifest.fontStacks || [];
  const basics = loadFontFamilyCompatibility(root, projection);
  const seen = new Set();
  for (const entry of entries) {
    const source = projection.variables[entry.sourceVariableId];
    if (!source || !/^--[a-z0-9-]+$/.test(entry.cssVar) || seen.has(entry.cssVar)) throw new Error("Unbound or duplicate font-stack target");
    seen.add(entry.cssVar);
    if (entry.modeFallbacks) {
      if (source.file !== "Semantics (Brands).tokens.json" || ["a", "b", "c"].some(brand => !entry.modeFallbacks[brand])) throw new Error("Incomplete Brand font-stack projection");
      for (const fallback of Object.values(entry.modeFallbacks)) {
        const basic = basics.find(item => item.sourceVariableId === fallback.sourceVariableId);
        if (!basic || basic.legacyCssVar !== fallback.cssVar || !["sans-serif", "serif"].includes(fallback.generic)) throw new Error("Unbound Basic fallback identity");
      }
    } else if (source.file !== "Semantics (Roles).tokens.json" || entry.generic !== "monospace") {
      throw new Error("Only the existing Mono role has a global terminal projection");
    }
  }
  return entries;
}

function applyBrandFontStacks(entries, tokenList, tokens, scope) {
  for (const entry of entries) {
    const source = tokenList.find(token => token.variableId === entry.sourceVariableId);
    if (!source) continue;
    if (source.cssVar !== entry.cssVar) throw new Error(`Font-stack target WEB mismatch: ${entry.sourceVariableId}`);
    const group = Object.values(tokens).find(values => values && Object.prototype.hasOwnProperty.call(values, entry.cssVar));
    if (!group || typeof group[entry.cssVar] !== "string") throw new Error("Missing primary font-family projection");
    const fallback = entry.modeFallbacks ? entry.modeFallbacks[scope.id] : { generic: entry.generic };
    if (!fallback || (entry.modeFallbacks && scope.bucket !== "brand")) throw new Error("Invalid font-stack Brand context");
    const values = [group[entry.cssVar], ...(fallback.cssVar ? [`var(${fallback.cssVar})`] : []), fallback.generic];
    group[entry.cssVar] = [...new Set(values)].join(", ");
  }
}

module.exports = { loadBrandFontStacks, applyBrandFontStacks };
