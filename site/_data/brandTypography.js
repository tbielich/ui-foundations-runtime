const path = require("node:path");

module.exports = async function () {
  const { loadBrandTypographyProjection } = await import("../../scripts/brand-typography-context.mjs");
  const root = path.resolve(__dirname, "../..");
  return { slots: loadBrandTypographyProjection(root).slots.map(slot => slot.cssVar) };
};
