import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

// Real CSS resolution and alpha composition in Chromium, across the repaired
// appearance contexts. This gate deliberately excludes disabled text.
const tokenFiles = [
  "core-primitives.tokens.css",
  "semantics-brands.tokens.brand-a.css",
  "semantics-brands.tokens.brand-b.css",
  "semantics-brands.tokens.brand-c.css",
  "appearance-modes.tokens.mode-light.css",
  "appearance-modes.tokens.mode-dark.css",
  "typography-fluid.tokens.css",
  "semantics-roles.tokens.css",
  "patterns-ui.tokens.css",
];
const css = tokenFiles.map(file => readFileSync(`dist/tokens/css/${file}`, "utf8")).join("\n")
  + readFileSync("src/ui/patterns/button.css", "utf8");

for (const brand of ["a", "b", "c"]) {
  for (const mode of ["light", "dark"]) {
    test(`Button contrast: ${brand} / ${mode}, all enabled variants and states`, async ({ page }) => {
      await page.setContent(`<style>${css}
        body { background: var(--uif-semantic-color-surface-default); }
        button { font: 16px sans-serif; margin: 8px; }
      </style><body data-brand="${brand}" data-mode="${mode}"></body>`);
      // Root-scoped Scheme aliases must resolve in the selected context.
      await page.evaluate(({ brand, mode }) => {
        document.documentElement.dataset.brand = brand;
        document.documentElement.dataset.mode = mode;
      }, { brand, mode });
      const rows = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const luminance = rgb => rgb.slice(0, 3).map(n => n / 255)
          .reduce((sum, n, i) => sum + [0.2126, 0.7152, 0.0722][i]
            * (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4), 0);
        const rows = [];
        for (const variant of ["solid", "outline", "ghost"]) {
          for (const [state, stateClass] of Object.entries({ Default: "", Hover: "is-hover", Active: "is-active", Focus: "is-focus-visible" })) {
            const button = document.createElement("button");
            button.className = `uif-button ${variant} ${stateClass}`;
            button.textContent = "Action";
            document.body.append(button);
            const style = getComputedStyle(button);
            ctx.clearRect(0, 0, 1, 1);
            for (const color of [getComputedStyle(document.body).backgroundColor, style.backgroundColor]) {
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, 1, 1);
            }
            if (style.backgroundImage !== "none") {
              const colors = style.backgroundImage.match(/rgba?\([^)]*\)/g);
              if (!colors?.length || new Set(colors).size !== 1) throw new Error("Unexpected overlay: " + style.backgroundImage);
              ctx.fillStyle = colors[0];
              ctx.fillRect(0, 0, 1, 1);
            }
            const surface = [...ctx.getImageData(0, 0, 1, 1).data];
            ctx.fillStyle = style.color;
            ctx.fillRect(0, 0, 1, 1);
            const content = [...ctx.getImageData(0, 0, 1, 1).data];
            const a = luminance(surface), b = luminance(content);
            rows.push({ variant, state, color: style.color, background: style.backgroundColor,
              overlay: style.backgroundImage, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) });
            button.remove();
          }
        }
        return rows;
      });
      expect(rows).toHaveLength(12);
      if (brand === "a") {
        const solid = rows.find(row => row.variant === "solid" && row.state === "Default");
        expect(solid.background).toBe(mode === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)");
        expect(solid.color).toBe(mode === "dark" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
      }
      test.info().annotations.push({ type: "contrast-evidence", description: JSON.stringify({ brand, mode, rows }) });
      for (const row of rows) expect(row.ratio, JSON.stringify(row)).toBeGreaterThanOrEqual(4.5);
    });
  }
}
