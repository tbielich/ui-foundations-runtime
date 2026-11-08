import { test, expect } from "@playwright/test";

test("inline alert actions update safely, activate and coexist with dismiss", async ({ page }) => {
  await page.goto('/patterns/inline-alert-playground/');
  await page.evaluate(async () => {
    await customElements.whenDefined('uif-inline-alert');
    const el = document.createElement('uif-inline-alert');
    el.id = 'repair-alert';
    el.setAttribute('title', 'Error');
    el.setAttribute('dismissible', '');
    document.body.append(el);
  });
  const el = page.locator('#repair-alert');
  await expect(el.locator('.uif-inline-alert-action')).toHaveCount(0);
  await el.evaluate(el => el.setAttribute('action-label', '<Retry>'));
  const button = el.getByRole('button', { name: '<Retry>' });
  await button.focus();
  await expect(button).toBeFocused();
  await el.evaluate(el => {
    el.dataset.clicks = '0';
    el.addEventListener('click', e => { if (e.target.closest('.uif-inline-alert-action')) el.dataset.clicks = String(Number(el.dataset.clicks) + 1); });
  });
  await page.keyboard.press('Enter');
  await expect(el).toHaveAttribute('data-clicks', '1');
  for (const [href, expected] of [['/retry', '/retry'], ['javascript:alert(1)', '#'], ['java\tscript:alert(1)', '#']]) {
    await el.evaluate((el, href) => el.setAttribute('action-href', href), href);
    await expect(el.getByRole('link', { name: '<Retry>' })).toHaveAttribute('href', expected);
  }
  await el.evaluate(el => el.removeAttribute('action-label'));
  await expect(el.locator('.uif-inline-alert-action')).toHaveCount(0);
  await el.getByRole('button', { name: 'Dismiss' }).click();
  await expect(el.locator('.uif-inline-alert')).toBeHidden();
});

test("custom illustrations retain accessible names across rerenders while default icons stay decorative", async ({ page }) => {
  await page.goto('/patterns/illustrated-message-playground/');
  await page.evaluate(async () => {
    await customElements.whenDefined('uif-illustrated-message');
    const el = document.createElement('uif-illustrated-message');
    el.id = 'repair-message';
    el.innerHTML = '<span slot="illustration" role="img" aria-label="Team">UI</span>';
    document.body.append(el);
  });
  const el = page.locator('#repair-message');
  await expect(el.getByRole('img', { name: 'Team' })).toBeVisible();
  await el.evaluate(el => el.setAttribute('heading', 'Updated'));
  await expect(el.getByRole('img', { name: 'Team' })).toBeVisible();
  await expect(el.locator('.uif-illustrated-message-illustration')).not.toHaveAttribute('aria-hidden');
  await expect(page.locator('#illustrated-message-playground-root .uif-illustrated-message-illustration .uif-icon').first()).toHaveAttribute('aria-hidden', 'true');
});
