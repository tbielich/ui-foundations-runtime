const fs = require("node:fs");
const path = require("node:path");

/** ID-bound legacy output views; never additional canonical primitive tokens. */
function loadFontFamilyCompatibility(root, projection) {
  const pointer = projection?.fontFamilyCompatibility;
  if (!pointer) return [];
  if (pointer.schemaVersion !== 1 || !/^[a-z0-9-]+\.json$/.test(pointer.manifest || "")) {
    throw new Error("Invalid fontFamilyCompatibility manifest pointer");
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "figma", pointer.manifest), "utf8"));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.exports)) {
    throw new Error("Invalid font-family compatibility manifest");
  }
  const seenIds = new Set(), seenVars = new Set();
  for (const entry of manifest.exports) {
    const source = projection.variables[entry.sourceVariableId];
    if (!source || source.file !== "Core (Primitives).tokens.json" || source.exportPath !== entry.legacyExportPath || source.figmaName !== entry.canonicalFigmaName ||
        !/^Font\/Family\/[^/]+$/.test(entry.canonicalFigmaName || "") ||
        !/^--font-family-[a-z0-9-]+$/.test(entry.canonicalCssVar || "") ||
        !/^--font-family-[a-z0-9-]+$/.test(entry.legacyCssVar || "") || entry.canonicalCssVar === entry.legacyCssVar ||
        seenIds.has(entry.sourceVariableId) || seenVars.has(entry.legacyCssVar)) {
      throw new Error(`Unbound or duplicate font-family compatibility export: ${entry.sourceVariableId}`);
    }
    seenIds.add(entry.sourceVariableId); seenVars.add(entry.legacyCssVar);
  }
  return manifest.exports;
}

function compatibilityForTokenFile(entries, tokenList, tokens) {
  const result = [];
  for (const entry of entries) {
    const source = tokenList.find(token => token.variableId === entry.sourceVariableId);
    if (!source) continue;
    const value = tokens.typography?.[entry.canonicalCssVar];
    if (source.cssVar !== entry.canonicalCssVar || source.path !== entry.legacyExportPath || typeof value !== "string" || value.includes("var(")) {
      throw new Error(`Canonical font-family identity/value mismatch: ${entry.sourceVariableId}`);
    }
    if (Object.prototype.hasOwnProperty.call(tokens.typography, entry.legacyCssVar)) {
      throw new Error(`Legacy font-family view collides with canonical output: ${entry.legacyCssVar}`);
    }
    result.push({ ...entry, value });
  }
  return result;
}

function applyLegacyFamilyReferences(entries, tokenList) {
  for (const entry of entries) {
    const source = tokenList.find(token => token.variableId === entry.sourceVariableId);
    if (!source || source.cssVar !== entry.canonicalCssVar || source.path !== entry.legacyExportPath) {
      throw new Error(`Unbound legacy family reference projection: ${entry.sourceVariableId}`);
    }
    // The canonical primitive still emits its concrete literal. Only historical
    // alias routes use this syntax, keeping old root overrides operational.
    source.cssVarRef = `var(${entry.legacyCssVar})`;
  }
}

module.exports = { loadFontFamilyCompatibility, compatibilityForTokenFile, applyLegacyFamilyReferences };
