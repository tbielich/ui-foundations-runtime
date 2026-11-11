import fs from "node:fs";
import path from "node:path";

/** Enumerated Runtime compatibility projection; Figma remains the value source. */
export function loadBrandTypographyProjection(root) {
  const projection = JSON.parse(fs.readFileSync(path.join(root, "figma/token-projection.json"), "utf8"));
  const pointer = projection.codeOnlyBrandTypography;
  if (!pointer) return { schemaVersion: 1, brand: null, slots: [] };
  if (pointer.schemaVersion !== 1 || !/^[a-z0-9-]+\.json$/.test(pointer.manifest || "")) {
    throw new Error("Invalid codeOnlyBrandTypography manifest pointer");
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "figma", pointer.manifest), "utf8"));
  const brands = manifest.brands || (manifest.brand ? [manifest.brand] : []);
  if (manifest.schemaVersion !== 1 || !brands.length || new Set(brands).size !== brands.length ||
      brands.some(brand => !/^[a-z][a-z0-9-]*$/.test(brand)) || !Array.isArray(manifest.slots) || !manifest.slots.length) {
    throw new Error("Invalid Brand typography compatibility manifest");
  }
  const entries = new Map();
  function visit(node, segments, file) {
    if (!node || typeof node !== "object") return;
    if ("$value" in node) {
      const id = node.$extensions?.["com.figma.variableId"];
      if (id) entries.set(id, { node, file, exportPath: segments.join("/") });
      return;
    }
    Object.entries(node).forEach(([key, child]) => visit(child, [...segments, key], file));
  }
  for (const file of Object.values(projection.collectionFiles)) {
    visit(JSON.parse(fs.readFileSync(path.join(root, "figma/exports", file), "utf8")), [], file);
  }
  const seen = new Set();
  for (const slot of manifest.slots) {
    if ((!/^--uif-[a-z0-9-]+-font-(family|weight)$/.test(slot.cssVar || "") || slot.cssVar.includes("-compat-") || !/^--uif-[a-z0-9-]+-compat-[a-z0-9-]+$/.test(slot.legacyCssVar || "")) || seen.has(slot.cssVar) || seen.has(slot.legacyCssVar)) {
      throw new Error(`Invalid or duplicate compatibility slot: ${slot.cssVar}`);
    }
    seen.add(slot.cssVar);
    seen.add(slot.legacyCssVar);
    const mapped = projection.variables[slot.sourceVariableId];
    const leaf = entries.get(slot.sourceVariableId);
    if (!mapped || !leaf || mapped.file !== leaf.file || mapped.exportPath !== leaf.exportPath ||
        !/^--[a-z0-9-]+$/.test(slot.sourceCssVar || "") ||
        leaf.node.$extensions?.["com.figma.codeSyntax"]?.WEB !== `var(${slot.sourceCssVar})`) {
      throw new Error(`Unbound typography source ID/WEB syntax: ${slot.sourceVariableId}`);
    }
    if (slot.neutralSourceCssVar) {
      const neutral = entries.get(slot.neutralSourceVariableId);
      if (!neutral || neutral.file !== "Semantics (Roles).tokens.json" || neutral.node.$extensions?.["com.figma.codeSyntax"]?.WEB !== `var(${slot.neutralSourceCssVar})`) {
        throw new Error(`Unbound neutral typography source: ${slot.neutralSourceVariableId}`);
      }
    }
    // The adapter must not bypass a role to select a literal Core or Brand value.
    if (mapped.file !== "Semantics (Roles).tokens.json") {
      throw new Error(`Compatibility source must be a semantic role: ${slot.sourceVariableId}`);
    }
  }
  return manifest;
}

export function renderBrandTypographyContext(manifest) {
  if (!manifest.slots.length) return "/* No Brand typography compatibility projection selected. */\n";
  const resets = manifest.slots.map(slot => `    ${slot.cssVar}: ${slot.neutralSourceCssVar ? `var(${slot.neutralSourceCssVar})` : "initial"};\n    ${slot.legacyCssVar}: initial;`).join("\n");
  const values = manifest.slots.map(slot => `    ${slot.cssVar}: var(${slot.sourceCssVar});`).join("\n");
  const brands = manifest.brands || [manifest.brand];
  const selector = brands.map(brand => `[data-brand="${brand}"]`).join(", ");
  return [
    "/* Generated ID-bound optional slots; initial is guaranteed-invalid, not an empty string.",
    "   Every selected/nested Brand boundary resets inherited overrides before activation. */",
    "@layer context {",
    "  :where(:root, [data-brand]) {", resets, "  }",
    `  :where(${selector}) {`, values, "  }", "}", "",
  ].join("\n");
}

export function buildBrandTypographyContext(root, dist) {
  const manifest = loadBrandTypographyProjection(root);
  const destination = path.join(dist, "core/context/brand-typography.css");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, renderBrandTypographyContext(manifest));
}
