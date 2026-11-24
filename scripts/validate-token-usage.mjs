#!/usr/bin/env node
/**
 * Validate that all var(--*) references in CSS patterns resolve to tokens
 * defined in the generated token CSS, or are explicitly allowlisted as
 * code-only extension points.
 *
 * Fails CI if a pattern references a token that doesn't exist in dist/tokens/css.
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { loadBrandTypographyProjection } from "./brand-typography-context.mjs";

const require = createRequire(import.meta.url);
const { classifyPatternTokenName } = require("./vault-naming-contract.js");

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const PATTERNS_DIR = path.join(REPO_ROOT, "src", "ui", "patterns");
const TOKENS_CSS_DIR = path.join(REPO_ROOT, "dist", "tokens", "css");

// Tokens that are intentionally code-only (set dynamically or use CSS fallbacks)
const ALLOWLIST = new Set([
  "--uif-breadcrumbs-gap",
  "--uif-breadcrumbs-link-color",
  "--uif-breadcrumbs-separator",
  "--uif-breadcrumbs-text-color",
  "--uif-card-border-color",
  "--uif-card-border-radius",
  "--uif-card-container-background",
  "--uif-card-gap",
  "--uif-card-padding",
  "--uif-card-text-color",
  "--uif-divider-color",
  "--uif-field-label-gap",
  "--uif-skeleton-color",
  "--uif-skeleton-gap",
  "--uif-skeleton-highlight-color",
  "--uif-tag-border-color",
  "--uif-tag-container-background",
  "--uif-tag-gap",
  "--uif-tag-group-gap",
  "--uif-tag-text-color",
  "--uif-field-label-line-height",
  "--uif-field-label-required-color",
  "--uif-icon-src",
  "--uif-number-field-border-color",
  "--uif-number-field-border-radius",
  "--uif-number-field-container-background",
  "--uif-number-field-gap",
  "--uif-number-field-text-color",
  "--uif-range-slider-border-color",
  "--uif-range-slider-fill-color",
  "--uif-range-slider-gap",
  "--uif-range-slider-lower",
  "--uif-range-slider-text-color",
  "--uif-range-slider-thumb-background",
  "--uif-range-slider-thumb-border-color",
  "--uif-range-slider-track-background",
  "--uif-range-slider-track-radius",
  "--uif-range-slider-track-size",
  "--uif-range-slider-upper",
  "--uif-search-field-border-color",
  "--uif-search-field-border-radius",
  "--uif-search-field-container-background",
  "--uif-search-field-gap",
  "--uif-search-field-padding-inline",
  "--uif-search-field-text-color",
  "--uif-segmented-control-border-color",
  "--uif-segmented-control-border-radius",
  "--uif-segmented-control-container-background",
  "--uif-segmented-control-gap",
  "--uif-segmented-control-padding-block",
  "--uif-segmented-control-padding-inline",
  "--uif-segmented-control-selected-background",
  "--uif-segmented-control-selected-indicator",
  "--uif-segmented-control-text-color",
  "--uif-progress-bar-fill-info",
  "--uif-progress-circle-value",
  "--uif-popover-border-color",
  "--uif-popover-border-radius",
  "--uif-popover-container-background",
  "--uif-popover-padding",
  "--uif-popover-text-color",
  "--uif-toast-border-color",
  "--uif-toast-border-radius",
  "--uif-toast-container-background",
  "--uif-toast-gap",
  "--uif-toast-padding",
  "--uif-toast-region-gap",
  "--uif-toast-text-color",
  "--uif-tooltip-hide-delay",
  "--uif-tooltip-show-delay",
]);

function getDefinedTokens() {
  if (!fs.existsSync(TOKENS_CSS_DIR)) {
    console.error(`❌ Missing ${path.relative(REPO_ROOT, TOKENS_CSS_DIR)}. Run "npm run tokens:generate" first.`);
    process.exit(1);
  }

  const tokens = new Set();
  const files = fs.readdirSync(TOKENS_CSS_DIR).filter((f) => f.endsWith(".css"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(TOKENS_CSS_DIR, file), "utf8");
    const matches = content.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm);
    for (const match of matches) {
      tokens.add(match[1]);
    }
  }

  return tokens;
}

function getUsedTokens() {
  const usage = [];
  const files = fs.readdirSync(PATTERNS_DIR).filter((f) => f.endsWith(".css"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(PATTERNS_DIR, file), "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(/var\((--[a-z0-9-]+)/g);
      for (const match of matches) {
        usage.push({ token: match[1], file, line: i + 1 });
      }
    }
  }

  return usage;
}

function run() {
  const defined = getDefinedTokens();
  // Explicit, ID-validated code-only slots are generated in the context layer.
  for (const slot of loadBrandTypographyProjection(REPO_ROOT).slots) {
    defined.add(slot.cssVar);
    defined.add(slot.legacyCssVar);
  }
  const usage = getUsedTokens();
  const errors = [];
  const warnings = [];

  for (const ref of usage) {
    if (defined.has(ref.token)) continue;
    if (ALLOWLIST.has(ref.token)) continue;
    errors.push(ref);
  }

  for (const ref of usage) {
    const classification = classifyPatternTokenName(ref.token);
    if (classification.status === "deprecated") {
      warnings.push({ ...ref, message: classification.message });
    }
  }

  if (errors.length > 0) {
    console.error(`❌ ${errors.length} token reference(s) not found in generated CSS:\n`);
    for (const err of errors) {
      console.error(`   ${err.file}:${err.line} → ${err.token}`);
    }
    console.error(`\nFix options:`);
    console.error(`  1. Add the token to Figma and re-export`);
    console.error(`  2. Rename the var() reference to match an existing token`);
    console.error(`  3. Add to ALLOWLIST in this script if intentionally code-only`);
    process.exit(1);
  }

  const uniqueWarnings = [
    ...new Map(warnings.map((warning) => [`${warning.file}:${warning.line}:${warning.token}`, warning])).values(),
  ];
  for (const warning of uniqueWarnings) {
    console.warn(`⚠️  ${warning.file}:${warning.line} → ${warning.message}`);
  }

  console.log(`✅ Token usage validated (${usage.length} references, ${defined.size} defined tokens)`);
}

run();
