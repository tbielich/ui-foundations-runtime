import { test, expect } from "@playwright/test";

test("Meter and Illustrated Message keep selected brand colors after control updates", async ({ page }) => {
  for (const [name, target, control, value] of [
    ['meter', '.uif-meter-fill', 'value', '48'],
    ['illustrated-message', '.uif-button', 'actionLabel', 'Continue'],
  ]) {
    await page.goto(`/patterns/${name}-playground/`);
    const stage = page.locator('.playground-stage');
    for (const [brand, color] of [['a', 'rgb(0, 0, 0)'], ['b', 'rgb(151, 71, 255)'], ['c', 'rgb(12, 75, 243)']]) {
      await page.locator(`[data-hero-brand="${brand}"]`).click();
      await expect(stage.locator(target)).toHaveCSS('background-color', color);
      await page.locator(`[data-playground-control][name="${control}"]`).fill(name === "meter" ? String(Number(value) + ["a", "b", "c"].indexOf(brand)) : `${value} ${brand}`);
      await expect(stage.locator(target)).toHaveCSS('background-color', color);
    }
  }
});
