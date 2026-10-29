const path = require("node:path");
module.exports = async function () {
  const { loadEvidence } = await import("../../scripts/accessibility-evidence.mjs");
  return loadEvidence(path.resolve("artifacts/accessibility/result.json"));
};
