import { test, expect } from "@playwright/test";

async function shell(page) {
  return page.evaluate(() => ({
    brand: document.documentElement.dataset.brand,
    mode: document.documentElement.dataset.mode,
    headings: [...document.querySelectorAll('.docs-content > h1, section > h2')].map(element => ({
      text: element.textContent, font: getComputedStyle(element).fontFamily,
    })),
  }));
}

test("color brand selection keeps the docs shell stable and shows each brand's actual swatches", async ({ page }) => {
  await page.goto('/primitives/color/');
  const before = await shell(page);
  const colors = [];
  for (const brand of ['b', 'c', 'a']) {
    await page.locator(`[data-switch-brand="${brand}"]`).click();
    expect(await shell(page)).toEqual(before);
    const panel = page.locator(`[data-brand-scope="${brand}"]`);
    await expect(panel).toBeVisible();
    await expect(page.locator('[data-brand-scope]:visible')).toHaveCount(1);
    colors.push(await panel.locator('.color-dot').first().evaluate(element => getComputedStyle(element).backgroundColor));
    await expect(page.locator(`[data-switch-brand="${brand}"]`)).toHaveAttribute('aria-pressed', 'true');
  }
  expect(new Set(colors).size).toBe(3);
});

test("typeface brand selection shows only the selected families without changing other sections", async ({ page }) => {
  await page.goto('/primitives/typography/');
  const before = await shell(page);
  for (const [brand, names] of [['b', ['Exo 2', 'Orbitron']], ['c', ['Manrope', 'Bricolage Grotesque']], ['a', ['Inter', 'Roboto Slab']]]) {
    const button = page.locator(`[data-typeface-brand="${brand}"]`);
    await button.focus();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await expect(button).toHaveCSS('outline-width', '2px');
    await page.keyboard.press('Enter');
    expect(await shell(page)).toEqual(before);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-typeface-panel]:visible')).toHaveCount(1);
    const panel = page.locator(`[data-typeface-panel="${brand}"]`);
    await expect(panel.locator('.type-specimen-name')).toHaveText(names);
    const rendered = await panel.locator('.type-specimen-sample').evaluateAll(items => items.map(item => getComputedStyle(item).fontFamily.replaceAll('"', '')));
    expect(rendered).toEqual(names);
  }
});

test("Examples overview uses linked preview cards without nested interactive controls", async ({ page }) => {
  await page.goto('/examples/');
  const cards = page.locator('.docs-component-grid > a');
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all()) {
    await expect(card.locator('.docs-component-card-preview')).toBeVisible();
    await expect(card.locator('button, input, select, textarea, a')).toHaveCount(0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await cards.evaluateAll(items => items.every(item => item.getBoundingClientRect().right <= innerWidth))).toBe(true);
  await cards.first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/examples\/login-form\/(?:\?|$)/);
});

for (const brand of ['a', 'b', 'c']) {
  test(`Examples cards follow both schemes inside Brand ${brand.toUpperCase()} without changing the docs`, async ({ page }) => {
    await page.goto('/examples/');
    const heading = page.locator('h1');
    const shellColor = await heading.evaluate(element => getComputedStyle(element).color);
    await page.locator(`[data-hero-brand="${brand}"]`).click();
    const backgrounds = [];
    for (const mode of ['dark', 'light']) {
      await page.locator(`[data-hero-mode="${mode}"]`).click();
      const expected = await page.locator('.docs-hero-preview-stage').evaluate(stage => {
        const probe = document.createElement('span');
        probe.style.cssText = 'background:var(--color-fill-surface);color:var(--color-text-default);border:1px solid var(--color-border-subtle)';
        stage.append(probe);
        const style = getComputedStyle(probe);
        const result = { surface: style.backgroundColor, text: style.color, border: style.borderColor };
        probe.style.color = 'var(--color-text-default)';
        result.bodyText = getComputedStyle(probe).color;
        probe.remove();
        return result;
      });
      for (const surface of await page.locator('.docs-component-card, .docs-component-card-preview, .docs-component-mini-dialog').all()) {
        await expect(surface).toHaveCSS('background-color', expected.surface);
      }
      for (const description of await page.locator('.docs-component-card-body p').all()) {
        await expect(description).toHaveCSS('color', expected.bodyText);
      }
      await expect(heading).toHaveCSS('color', shellColor);
      expect(await page.locator('html').getAttribute('data-mode')).toBe('light');
      expect(await page.locator('html').getAttribute('data-brand')).toBe('a');
      backgrounds.push(expected.surface);
    }
    expect(backgrounds[0]).not.toBe(backgrounds[1]);
  });
}

test("shared preview URL survives reload, wins over storage and preserves unrelated query/hash state", async ({ page }) => {
  await page.goto('/examples/?brand=c&mode=dark&pg-example-scale=small#comparison');
  const stage = page.locator('.docs-hero-preview-stage');
  await expect(stage).toHaveAttribute('data-brand', 'c');
  await expect(stage).toHaveAttribute('data-mode', 'dark');
  await page.reload();
  await expect(page.locator('[data-hero-brand="c"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-hero-mode="dark"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-hero-brand="b"]').click();
  const url = new URL(page.url());
  expect(url.searchParams.get('brand')).toBe('b');
  expect(url.searchParams.get('mode')).toBe('dark');
  expect(url.searchParams.get('pg-example-scale')).toBe('small');
  expect(url.hash).toBe('#comparison');
  await page.goto('/primitives/typography/');
  await expect(page.locator('[data-typeface-brand="b"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/examples/?brand=a&mode=light');
  await expect(stage).toHaveAttribute('data-brand', 'a');
  await expect(stage).toHaveAttribute('data-mode', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'a');
});

test("URL preview preferences work when local storage is unavailable and reject invalid context values", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  });
  await page.goto('/examples/?brand=unknown&mode=invalid');
  const stage = page.locator('.docs-hero-preview-stage');
  await expect(stage).toHaveAttribute('data-brand', 'a');
  await expect(stage).toHaveAttribute('data-mode', 'light');
  await page.locator('[data-hero-brand="c"]').click();
  await page.locator('[data-hero-mode="dark"]').click();
  await page.reload();
  await expect(stage).toHaveAttribute('data-brand', 'c');
  await expect(stage).toHaveAttribute('data-mode', 'dark');
});
