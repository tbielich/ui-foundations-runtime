// Runtime adapter for the owner-authorized token projection. Governance stays in Vault.
export function projectPath(name, id, projection) {
  if (id && projection?.variables?.[id]) {
    return projection.variables[id].exportPath;
  }
  const matches = Object.values(projection?.variables || {})
    .filter((entry) => entry.figmaName === name);
  const paths = [...new Set(matches.map((entry) => entry.exportPath))];
  if (paths.length > 1) throw new Error(`Ambiguous projected alias: ${name}; export its variable ID`);
  return paths[0] || name;
}

export function projectModeValue(value, projection) {
  if (value && typeof value === "object" && value.$ref) {
    return { $ref: projectPath(value.$ref, value.$targetId, projection) };
  }
  return encodeFigmaColor(value);
}

export function encodeFigmaColor(value) {
  if (!value || typeof value !== "object" || !("r" in value)) return value;
  const channels = [value.r, value.g, value.b];
  if (value.a !== undefined && value.a < 1) channels.push(value.a);
  return "#" + channels.map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("");
}

export function mergeTokenTree(existing, incoming) {
  if (incoming && "$value" in incoming) return incoming;
  const result = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    result[key] = value && typeof value === "object" && !Array.isArray(value)
      ? mergeTokenTree(existing?.[key] || {}, value)
      : value;
  }
  return result;
}
