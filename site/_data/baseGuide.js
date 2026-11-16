const fs = require("node:fs");
const path = require("node:path");

// The package guide is also the documentation page body: one source of truth.
const guide = fs.readFileSync(path.resolve(__dirname, "../../docs/base.md"), "utf8");
module.exports = guide.replace(/^# [^\n]+\n+/, "");
