import { test, expect } from "@playwright/test";

const contexts = [
  ["a", "light"], ["b", "light"], ["c", "light"],
  ["a", "dark"], ["b", "dark"], ["c", "dark"],
];

test("Illustrated Message text meets contrast in docs and the actual playground", async ({ page }) => {
  const rows = [];

  for (const surface of ["illustrated-message", "illustrated-message-playground"]) {
    await page.goto(`/patterns/${surface}/`);

    for (const [brand, mode] of contexts) {
      const stage = surface.endsWith("playground")
        ? page.locator("#illustrated-message-playground-root")
        : page.locator(".docs-hero-preview-stage").first();

      await page.locator(`[data-hero-brand="${brand}"]`).click();
      await page.locator(`[data-hero-mode="${mode}"]`).click();

      await stage.evaluate(async () => {
        const animations = document.documentElement
          .getAnimations({ subtree: true })
          .filter(animation => animation.effect?.getTiming().iterations !== Infinity);
        await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });

      await expect(stage.locator(".uif-illustrated-message-description")).toBeVisible();
      await expect(stage.locator(".uif-button.solid")).toBeVisible();

      const measurements = await stage.evaluate(root => {
        const parse = value => {
          const match = value.match(/[\d.]+/g);
          if (!match) throw new Error(`Unsupported color: ${value}`);
          const channels = match.map(Number);
          const color = [channels[0], channels[1], channels[2], channels[3] ?? 1];
          if (!color.every(Number.isFinite)) throw new Error(`Non-finite color: ${value}`);
          return color;
        };
        const composite = (foreground, background) => {
          const alpha = foreground[3] + background[3] * (1 - foreground[3]);
          if (alpha === 0) return [0, 0, 0, 0];
          const color = [0, 1, 2].map(index => (
            (foreground[index] * foreground[3]
              + background[index] * background[3] * (1 - foreground[3])) / alpha
          )).concat(alpha);
          if (!color.every(Number.isFinite)) throw new Error("Non-finite composited color");
          return color;
        };
        const background = element => {
          const layers = [];
          for (let current = element; current; current = current.parentElement) {
            const style = getComputedStyle(current);
            if (style.backgroundImage !== "none") {
              throw new Error(`Unsupported background image on ${current.className || current.tagName}`);
            }
            if (Number(style.opacity) !== 1) {
              throw new Error(`Unsupported opacity on ${current.className || current.tagName}`);
            }
            layers.push(parse(style.backgroundColor));
          }
          const backdrop = layers.reduce(
            (result, layer) => composite(result, layer),
            [0, 0, 0, 0],
          );
          if (backdrop[3] !== 1) throw new Error("Background chain did not resolve to an opaque color");
          return backdrop;
        };
        const luminance = color => color.slice(0, 3).map(channel => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
        const ratio = (foreground, backdrop) => {
          const a = luminance(foreground);
          const b = luminance(backdrop);
          const result = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          if (!Number.isFinite(result)) throw new Error("Non-finite contrast ratio");
          return result;
        };

        return [
          ["heading", ".uif-illustrated-message-heading"],
          ["description", ".uif-illustrated-message-description"],
          ["action", ".uif-button.solid"],
        ].map(([part, selector]) => {
          const element = root.querySelector(selector);
          const style = getComputedStyle(element);
          const backdrop = background(element);
          return {
            part,
            foreground: style.color,
            background: `rgba(${backdrop.join(", ")})`,
            fontSizePx: parseFloat(style.fontSize),
            fontWeight: Number(style.fontWeight),
            contrastRatio: ratio(parse(style.color), backdrop),
          };
        });
      });

      for (const measurement of measurements) rows.push({ surface, brand, mode, ...measurement });
    }
  }

  test.info().annotations.push({
    type: "illustrated-message-contrast",
    description: JSON.stringify(rows),
  });
  expect(rows).toHaveLength(36);
  for (const row of rows) {
    expect.soft(typeof row.contrastRatio, JSON.stringify(row)).toBe("number");
    expect.soft(Number.isFinite(row.contrastRatio), JSON.stringify(row)).toBe(true);
    expect.soft(row.contrastRatio, JSON.stringify(row)).toBeGreaterThanOrEqual(4.5);
  }
});
