import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { scaleRatios } from '../../scripts/scale-context.mjs';
const ratios = scaleRatios(JSON.parse(readFileSync('figma/exports/Core (Primitives).tokens.json')));

for (const orientation of ['horizontal', 'vertical']) {
  test(`Tabs ${orientation} keyboard activation, accessible names and disabled skipping`, async ({ page }) => {
    await page.goto('/base/preview/');
    await page.evaluate(async orientation => {
      await import('/vendor/ui-foundations/elements/ui-tabs.js');
      const host = document.createElement('section');
      host.id = 'followup';
      host.innerHTML = `<uif-tab-list aria-label="Sections" orientation="${orientation}"><uif-tab label="First" controls="follow-a" selected></uif-tab><uif-tab label="Disabled" disabled controls="follow-x"></uif-tab><uif-tab label="Last" controls="follow-b"></uif-tab></uif-tab-list><uif-tab-panel id="follow-a">First content</uif-tab-panel><uif-tab-panel id="follow-x" hidden>Disabled content</uif-tab-panel><uif-tab-panel id="follow-b" hidden>Last content</uif-tab-panel>`;
      document.body.append(host);
    }, orientation);
    const host = page.locator('#followup');
    const first = host.getByRole('tab', { name: 'First', exact: true });
    const last = host.getByRole('tab', { name: 'Last', exact: true });
    await expect(host.getByRole('tabpanel', { name: 'First', exact: true })).toBeVisible();
    await first.focus();
    const forward = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const backward = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    await page.keyboard.press(forward);
    await expect(last).toBeFocused();
    await expect(host.getByRole('tabpanel', { name: 'Last', exact: true })).toBeVisible();
    await expect(host.locator('#follow-a')).toBeHidden();
    await expect(host.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
    await page.keyboard.press(forward);
    await expect(first).toBeFocused();
    await page.keyboard.press(backward);
    await expect(last).toBeFocused();
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await page.keyboard.press('End');
    await expect(last).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Space');
    await expect(last).toBeFocused();
    await expect(host.getByRole('tab', { name: 'Disabled', exact: true })).toBeDisabled();
    await page.keyboard.press('Tab');
    await expect(host.getByRole('tabpanel', { name: 'Last', exact: true })).toBeFocused();
  });
}

test('Tabs inherit S/M/L from containers with nested replacement and no DOM rebuild', async ({ page }) => {
  await page.goto('/patterns/tabs/');
  const stage = page.locator('.docs-hero-preview-stage');
  const tab = stage.getByRole('tab', { name: 'Overview', exact: true });
  const metrics = () => tab.evaluate(el => {
    const s = getComputedStyle(el);
    return ['fontSize', 'lineHeight', 'paddingBlockStart', 'paddingInlineStart', 'borderBottomWidth'].map(k => parseFloat(s[k]));
  });
  const baseline = await metrics();
  for (const scale of ['small', 'large']) {
    await stage.evaluate((el, scale) => { el.dataset.scale = scale; }, scale);
    const actual = await metrics();
    for (let i = 0; i < 4; i++) expect(actual[i] / baseline[i]).toBeCloseTo(ratios[scale], 2);
    expect(actual[4]).toBe(baseline[4]);
  }
  await stage.locator('.uif-tabs').evaluate(el => { el.dataset.scale = 'small'; el._original = el.querySelector('button'); });
  const small = await metrics();
  for (let i = 0; i < 4; i++) expect(small[i] / baseline[i]).toBeCloseTo(ratios.small, 2);
  await stage.locator('.uif-tabs').evaluate(el => { el.dataset.scale = 'medium'; });
  expect(await metrics()).toEqual(baseline);
  await stage.locator('.uif-tabs').evaluate(el => { el.dataset.scale = 'unknown'; });
  const inherited = await metrics();
  for (let i = 0; i < 4; i++) expect(inherited[i] / baseline[i]).toBeCloseTo(ratios.large, 2);
  expect(await stage.locator('.uif-tabs').evaluate(el => el.querySelector('button') === el._original)).toBe(true);
  await stage.locator('.uif-tabs').evaluate(el => { el.removeAttribute('data-scale'); });
  for (const brand of ['a', 'b', 'c']) {
    for (const mode of ['light', 'dark']) {
      await stage.evaluate((el, {brand, mode}) => { el.dataset.brand=brand; el.dataset.mode=mode; el.dataset.scale='small'; }, {brand, mode});
      const actual = await metrics();
      for (let i = 0; i < 4; i++) expect(actual[i] / baseline[i]).toBeCloseTo(ratios.small, 2);
    }
  }
});

test('Tabs playground works at narrow widths and generated examples retain scale and orientation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/patterns/tabs-playground/?pg-tabs-scale=large&pg-tabs-tabs=10');
  const root = page.locator('#tabs-playground-root');
  await expect(root.getByRole('tab')).toHaveCount(10);
  await expect(root.locator('[data-scale="large"]')).toHaveCount(1);
  const list = root.getByRole('tablist');
  expect(await list.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
  await root.getByRole('tab', { name: 'Tab 1', exact: true }).focus();
  await page.keyboard.press('End');
  const last = root.getByRole('tab', { name: 'Tab 10', exact: true });
  await expect(last).toBeFocused();
  await expect(root.getByRole('tabpanel', { name: 'Tab 10', exact: true })).toBeVisible();
  expect(await last.evaluate(el => { const r=el.getBoundingClientRect(), p=el.closest('[role="tablist"]').getBoundingClientRect(); return r.left >= p.left - 1 && r.right <= p.right + 1; })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  const form = page.locator('#tabs-playground-controls');
  await form.locator('[name="orientation"]').selectOption('vertical');
  await expect(root.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  for (const suffix of ['', '-njk', '-wc']) {
    await expect(page.locator(`#tabs-playground-code${suffix}`)).toContainText('data-scale="large"');
    await expect(page.locator(`#tabs-playground-code${suffix}`)).toContainText('vertical');
  }
  await page.locator('.playground-preview').getByRole('button', { name: 'Small scale', exact: true }).click();
  await expect(root.locator('[data-scale="small"]')).toHaveCount(1);
  await page.locator('.playground-preview [data-hero-mode="dark"]').click();
  await expect(root.locator('[data-scale="small"]')).toHaveCount(1);
});

test('Nested tab events do not change the outer selection', async ({ page }) => {
  await page.goto('/patterns/tabs/');
  await page.locator('#panel-1').evaluate(panel => {
    const inner = document.createElement('uif-tab-list');
    inner.setAttribute('aria-label', 'Nested');
    inner.innerHTML = '<uif-tab label="Inner first" selected></uif-tab><uif-tab label="Inner last"></uif-tab>';
    panel.append(inner);
  });
  const first = page.getByRole('tab', { name: 'Inner first', exact: true });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Inner last', exact: true })).toBeFocused();
  await expect(page.locator('.docs-hero-preview-stage').getByRole('tab', { name: 'Overview', exact: true })).toHaveAttribute('aria-selected', 'true');
});
