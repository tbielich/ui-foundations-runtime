import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const icon = fs.readFileSync(fileURLToPath(new URL("../../src/assets/icons/checkmark.svg", import.meta.url)), "utf8");
const visuals = fileURLToPath(new URL("../../artifacts/accessibility/visual/", import.meta.url));
fs.mkdirSync(visuals, { recursive: true });
for (const brand of ["a", "b", "c"]) for (const mode of ["light", "dark"]) {
  test(`Checkbox checkmark loads and paints: ${brand} / ${mode}`, async ({ page }) => {
    await page.goto("/patterns/checkbox/");
    const hero = page.locator(".docs-hero");
    await hero.locator(`[data-hero-brand="${brand}"]`).click();
    await hero.locator(`[data-hero-mode="${mode}"]`).click();
    const input = hero.locator("input.uif-checkbox");
    await expect(input).toBeChecked();
    const indicator = await input.evaluate((element) => {
      const style = getComputedStyle(element, "::after");
      return { mask: style.maskImage, color: style.backgroundColor, background: getComputedStyle(element).backgroundColor, width: parseFloat(style.width), height: parseFloat(style.height), display: style.display };
    });
    expect(indicator.width).toBeGreaterThan(0);
    expect(indicator.height).toBeGreaterThan(0);
    expect(indicator.display).not.toBe("none");
    expect(indicator.color).not.toBe("rgba(0, 0, 0, 0)");
    expect(indicator.color).not.toBe(indicator.background);
    const match = indicator.mask.match(/^url\(["']?(.*?)["']?\)$/);
    expect(match, "checked checkbox needs a real mask").not.toBeNull();
    const url = match[1];
    // A mask may be embedded or served, but it must retain the canonical
    // glyph and must not escape the configured hosting base path.
    if (url.startsWith("data:image/svg+xml,")) {
      expect(decodeURIComponent(url.slice(url.indexOf(",") + 1))).toBe(icon);
    } else {
      const prefix = process.env.SITE_BASE_PATH || "";
      expect(new URL(url).pathname.startsWith(`${prefix}/`), "mask URL escapes hosting base").toBe(true);
      const resource = await page.request.get(url);
      expect(resource.ok()).toBe(true);
      expect(await resource.text()).toBe(icon);
    }
    const decoded = await page.evaluate(async (src) => {
      const image = new Image(); image.src = src; await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    }, url);
    expect(decoded).toEqual({ width: 24, height: 24 });
    await hero.screenshot({ path: path.join(visuals, `checkbox-${brand}-${mode}.png`) });
    await input.click(); await expect(input).not.toBeChecked();
    await input.click(); await expect(input).toBeChecked();
  });
}
