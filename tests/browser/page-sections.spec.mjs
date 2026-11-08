import { test, expect } from "@playwright/test";

test("every page type has a full-width hero on an unpainted page canvas", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/patterns/", "/patterns/button/", "/foundations/architecture/", "/patterns/button-playground/"]) {
      await page.goto(path);
      const hero = page.locator('.docs-page-hero, .docs-home-hero');
      await expect(hero).toHaveCount(1);
      const bounds = await hero.boundingBox();
      const main = await page.locator('.docs-main').boundingBox();
      expect(bounds.x).toBeCloseTo(main.x, 1);
      expect(bounds.width).toBeCloseTo(main.width, 1);
      expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
      expect(await hero.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
      expect(await page.locator('.docs-page-section').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(241, 243, 237)');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});

test("pattern preview and introduction stay above the Anatomy section divider", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of ["/patterns/button/", "/patterns/inline-alert/", "/patterns/illustrated-message/"]) {
    await page.goto(path);
    const hero = page.locator('.docs-page-hero');
    await expect(hero.locator('h1')).toHaveCount(1);
    await expect(hero.locator('.docs-hero-preview')).toHaveCount(1);
    await expect(hero.locator('#anatomy')).toHaveCount(0);
    await expect(page.locator('.docs-page-section #anatomy')).toBeVisible();
    const heroBounds = await hero.boundingBox();
    const anatomy = await page.locator('#anatomy').boundingBox();
    expect(anatomy.y).toBeGreaterThanOrEqual(heroBounds.y + heroBounds.height);
    expect(await hero.evaluate(el => getComputedStyle(el).borderBottomStyle)).toBe('solid');
  }
});
