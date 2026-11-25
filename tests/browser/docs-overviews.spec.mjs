import { test, expect } from '@playwright/test';

for (const [category, count] of [['patterns', 27], ['components', 2], ['examples', 2]]) {
  test(`${category} overview uses the shared grid with inert previews and responsive cards`, async ({ page }) => {
    await page.goto(`/${category}/`);
    const grid = page.locator('.docs-hero-preview-stage > .docs-overview-grid');
    await expect(grid).toHaveCount(1);
    await expect(grid.locator(':scope > .docs-component-card')).toHaveCount(count);
    await expect(page.locator('.docs-component-card')).toHaveCount(count);
    for (const card of await grid.locator(':scope > a').all()) {
      await expect(card.locator('.docs-component-card-preview')).toHaveAttribute('inert', '');
      await expect(card.locator('.docs-component-card-body h2')).not.toBeEmpty();
      const href = await card.getAttribute('href');
      expect((await page.request.get(href)).ok()).toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await grid.locator(':scope > a').evaluateAll(cards => cards.every(card => card.getBoundingClientRect().right <= innerWidth))).toBe(true);
    const first = grid.locator(':scope > a').first();
    const destination = await first.getAttribute('href');
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(url => url.pathname === destination);
  });

  for (const brand of ['a', 'b', 'c']) {
    test(`${category} overview renders all card surfaces and text in both schemes for ${brand}`, async ({ page }) => {
      await page.goto(`/${category}/?brand=${brand}&mode=light`);
      const heading = page.locator('h1');
      const chrome = await heading.evaluate(el => ({ color: getComputedStyle(el).color, font: getComputedStyle(el).fontFamily }));
      const backgrounds = [];
      for (const mode of ['dark', 'light']) {
        await page.locator(`[data-hero-mode="${mode}"]`).click();
        const expected = await page.locator('.docs-hero-preview-stage').evaluate(stage => {
          const probe = document.createElement('span');
          probe.style.cssText = 'background:var(--color-fill-surface);color:var(--color-text-default)';
          stage.append(probe);
          const result = { background: getComputedStyle(probe).backgroundColor, foreground: getComputedStyle(probe).color };
          probe.style.color = 'var(--color-text-default)';
          result.bodyText = getComputedStyle(probe).color;
          probe.remove();
          return result;
        });
        for (const surface of await page.locator('.docs-component-card, .docs-component-card-preview, .docs-component-mini-dialog, .docs-component-mini-field strong').all()) {
          await expect(surface).toHaveCSS('background-color', expected.background);
        }
        for (const description of await page.locator('.docs-component-card-body p').all()) {
          await expect(description).toHaveCSS('color', expected.bodyText);
        }
        await expect(heading).toHaveCSS('color', chrome.color);
        await expect(heading).toHaveCSS('font-family', chrome.font);
        backgrounds.push(expected.background);
      }
      expect(backgrounds[0]).not.toBe(backgrounds[1]);
    });
  }
}

test('UI Foundations search includes tokens, patterns, components, examples and guides', async ({ page }) => {
  await page.goto('/components/');
  const input = page.getByRole('searchbox', { name: 'Search UI Foundations' });
  await expect(input).toHaveAttribute('placeholder', 'Search UI Foundations');
  for (const [query, href] of [['Color Palette', '/primitives/color/'], ['Button', '/patterns/button/'], ['Date Picker', '/components/date-picker/'], ['Login Form', '/examples/login-form/'], ['Getting Started', '/getting-started/']]) {
    await input.fill(query);
    await expect(page.locator(`#docs-search-results a[href="${href}"]`)).toBeVisible();
  }
  await input.fill('Date Picker');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page).toHaveURL(url => url.pathname === '/components/date-picker/');
});
