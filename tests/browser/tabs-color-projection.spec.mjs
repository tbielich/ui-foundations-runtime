import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Frozen before replacing the CSS Dark override with source-owned scheme roles.
const baseline = JSON.parse(readFileSync('docs/evidence/tabs-figma-2026-11-15/runtime-colors-before.json', 'utf8'));
for (const expected of baseline) {
  test(`Tabs selected colors retain the approved baseline (${expected.brand}/${expected.mode})`, async ({ page }) => {
    await page.goto('/patterns/tabs/');
    const stage = page.locator('.docs-hero-preview-stage');
    await stage.evaluate((el, context) => { el.dataset.brand=context.brand; el.dataset.mode=context.mode; }, expected);
    const selected = stage.getByRole('tab', { name: 'Overview', exact: true });
    await expect(selected).toHaveCSS('color', expected.color);
    await expect(selected).toHaveCSS('border-bottom-color', expected.border);
    await expect(selected).toHaveCSS('font-size', expected.fontSize);
    await expect(selected).toHaveCSS('line-height', expected.lineHeight);
  });
}
