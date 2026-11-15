import { test, expect } from "@playwright/test";

for (const name of ["status-light", "meter", "progress-bar"]) {
  test(`${name} docs expose isolated, keyboard-operable scale next to the theme switch`, async ({ page }) => {
    await page.goto(`/patterns/${name}/`);
    const hero = page.locator(".docs-hero-preview");
    const stage = hero.locator(".docs-hero-preview-stage");
    const scale = hero.getByRole("group", { name: "Preview scale" });
    await expect(hero.locator('.docs-hero-preview-controls [data-hero-mode="dark"]')).toBeVisible();
    await expect(scale).toBeVisible();
    const headingFont = await page.locator("h1").evaluate(el => getComputedStyle(el).fontSize);
    await scale.getByRole("button", { name: "Small scale", exact: true }).click();
    const small = await stage.locator(`.uif-${name}`).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    const largeButton = scale.getByRole("button", { name: "Large scale", exact: true });
    await largeButton.focus();
    await page.keyboard.press("Space");
    await expect(largeButton).toHaveAttribute("aria-pressed", "true");
    await expect(scale.locator('[aria-pressed="true"]')).toHaveCount(1);
    const large = await stage.locator(`.uif-${name}`).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(large).toBeGreaterThan(small);
    await page.evaluate(() => { document.documentElement.dataset.scale = "small"; });
    await hero.locator('[data-hero-mode="dark"]').click();
    await hero.locator('[data-hero-brand="c"]').click();
    await expect(stage).toHaveAttribute("data-scale", "large");
    expect(await stage.locator(`.uif-${name}`).evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(large, 2);
    expect(await page.locator("h1").evaluate(el => getComputedStyle(el).fontSize)).toBe(headingFont);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(scale).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });

  test(`${name} playground scale switch synchronizes URL, examples, local size and reset`, async ({ page }) => {
    await page.goto(`/patterns/${name}-playground/?pg-${name}-scale=large&pg-${name}-size=sm`);
    await page.evaluate(async name => { await customElements.whenDefined(`uif-${name}`); }, name);
    const hero = page.locator(".playground-preview");
    const group = hero.getByRole("group", { name: "Preview scale" });
    const form = page.locator(`#${name}-playground-controls`);
    const root = page.locator(`#${name}-playground-root`);
    await expect(group.getByRole("button", { name: "Large scale", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(form.locator('[name="scale"]')).toBeHidden();
    await expect(form.locator('[name="size"]')).toBeVisible();
    await expect(form.locator('[name="size"]')).toHaveValue("sm");
    await group.getByRole("button", { name: "Small scale", exact: true }).click();
    await expect(root.locator('[data-scale="small"]')).toHaveCount(1);
    await expect(page).toHaveURL(new RegExp(`pg-${name}-scale=small`));
    for (const suffix of ["", "-njk", "-wc"]) {
      await expect(page.locator(`#${name}-playground-code${suffix}`)).toContainText('data-scale="small"');
    }
    await form.locator('[name="size"]').selectOption("md");
    await expect(group.getByRole("button", { name: "Small scale", exact: true })).toHaveAttribute("aria-pressed", "true");
    await hero.locator('[data-hero-mode="dark"]').click();
    await expect(root.locator('[data-scale="small"]')).toHaveCount(1);
    await form.locator('[data-playground-reset]').click();
    await expect(group.getByRole("button", { name: "Medium scale", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(root.locator('[data-scale="medium"]')).toHaveCount(1);
    await expect(page).toHaveURL(new RegExp(`pg-${name}-scale=medium`));
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(group).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
