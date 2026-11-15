import { test, expect } from "@playwright/test";

async function mountTabs(page) {
  await page.goto('/base/preview/');
  await page.evaluate(async () => {
    await import('/vendor/ui-foundations/elements/ui-tabs.js');
    const fixture = document.createElement('section');
    fixture.id = 'tabs-state-fixture';
    fixture.innerHTML = `
      <uif-tab-list aria-label="State test">
        <uif-tab label="First" selected controls="state-a"></uif-tab>
        <uif-tab label="Disabled" disabled controls="state-disabled"></uif-tab>
        <uif-tab label="Last" controls="state-b"></uif-tab>
      </uif-tab-list>
      <uif-tab-panel id="state-a"><label>Draft<input aria-label="Draft" value="initial"></label><button type="button">Count</button></uif-tab-panel>
      <uif-tab-panel id="state-disabled" hidden>Disabled panel</uif-tab-panel>
      <uif-tab-panel id="state-b" hidden>Last panel</uif-tab-panel>`;
    document.body.append(fixture);
  });
  return page.locator('#tabs-state-fixture');
}

test('TabList attribute updates preserve structure, focus and vertical navigation', async ({ page }) => {
  const fixture = await mountTabs(page);
  const first = fixture.getByRole('tab', { name: 'First', exact: true });
  await first.focus();
  await fixture.locator('uif-tab-list').evaluate(list => {
    list._testButton = list.querySelector('button');
    list.setAttribute('orientation', 'vertical');
    list.setAttribute('aria-label', 'Updated tabs');
  });
  await expect(fixture.getByRole('tablist', { name: 'Updated tabs' })).toHaveCount(1);
  expect(await fixture.locator('uif-tab-list').evaluate(list => list.querySelector('button') === list._testButton)).toBe(true);
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const last = fixture.getByRole('tab', { name: 'Last', exact: true });
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-selected', 'true');
  await expect(fixture.locator('#state-b')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await page.keyboard.press('End');
  await expect(last).toBeFocused();
});

test('Panel switching retains live input state, DOM identity and event listeners', async ({ page }) => {
  const fixture = await mountTabs(page);
  await fixture.getByRole('textbox', { name: 'Draft' }).fill('unsaved draft');
  await fixture.locator('#state-a').evaluate(panel => {
    panel._testInput = panel.querySelector('input');
    panel.querySelector('button').addEventListener('click', () => {
      panel.dataset.clicks = String(Number(panel.dataset.clicks || 0) + 1);
    });
  });
  await fixture.getByRole('tab', { name: 'Last', exact: true }).click();
  await expect(fixture.locator('#state-a')).toBeHidden();
  await fixture.getByRole('tab', { name: 'First', exact: true }).click();
  await expect(fixture.getByRole('textbox', { name: 'Draft' })).toHaveValue('unsaved draft');
  expect(await fixture.locator('#state-a').evaluate(panel => panel.querySelector('input') === panel._testInput)).toBe(true);
  await fixture.getByRole('button', { name: 'Count', exact: true }).click();
  await expect(fixture.locator('#state-a')).toHaveAttribute('data-clicks', '1');
});

test('Tab attributes update the same button and horizontal navigation skips disabled tabs', async ({ page }) => {
  const fixture = await mountTabs(page);
  await fixture.locator('uif-tab').first().evaluate(tab => {
    tab._testButton = tab.querySelector('button');
    tab.setAttribute('label', 'Renamed');
    tab.setAttribute('controls', 'state-a');
  });
  expect(await fixture.locator('uif-tab').first().evaluate(tab => tab.querySelector('button') === tab._testButton)).toBe(true);
  const first = fixture.getByRole('tab', { name: 'Renamed', exact: true });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(fixture.getByRole('tab', { name: 'Last', exact: true })).toBeFocused();
  await expect(first).toHaveAttribute('aria-selected', 'false');
  await expect(first).toHaveAttribute('tabindex', '-1');
  await expect(fixture.getByRole('tab', { name: 'Disabled', exact: true })).toBeDisabled();
  await expect(fixture.locator('#state-disabled')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();
  await page.keyboard.press('Space');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(fixture.locator('#state-a')).toBeVisible();
});
