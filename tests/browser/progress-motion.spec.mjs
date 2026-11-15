import { test, expect } from "@playwright/test";

test("Reduced motion documentation example stays static without disabling the normal example", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/patterns/progress-bar/');
  await page.evaluate(() => document.fonts.ready);
  const reduced = page.locator('.docs-behavior-item').filter({ has: page.getByRole('heading', { name: 'Reduced motion', exact: true }) });
  const normal = page.locator('.docs-behavior-item').filter({ has: page.getByRole('heading', { name: 'Unknown amount', exact: true }) });
  const fill = reduced.locator('.uif-progress-bar-fill');
  await expect(fill).toHaveCSS('animation-name', 'none');
  await expect(normal.locator('.uif-progress-bar-fill')).toHaveCSS('animation-name', 'uif-progress-bar-indeterminate');
  await expect(reduced.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  const first = await fill.boundingBox();
  await page.waitForTimeout(250);
  expect(await fill.boundingBox()).toEqual(first);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(normal.locator('.uif-progress-bar-fill')).toHaveCSS('animation-name', 'none');
  await expect(fill).toHaveCSS('animation-name', 'none');
});
