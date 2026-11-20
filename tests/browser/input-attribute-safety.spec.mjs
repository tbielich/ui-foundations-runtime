import { test, expect } from '@playwright/test';

const hostile = 'hello" data-injected="yes';
const markup = '"><img data-injected src=x onerror="window.injected=true"> & <b>x</b> &amp;';

async function mount(page, fixtureId, attrs) {
  await page.goto('/patterns/input-playground/');
  await page.evaluate(async ({ fixtureId, attrs }) => {
    await import('/vendor/ui-foundations/elements/ui-input.js');
    const fixture = document.createElement('div');
    fixture.setAttribute('data-fixture', fixtureId);
    const el = document.createElement('uif-input');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    fixture.append(el);
    document.body.append(fixture);
  }, { fixtureId, attrs });
  const fixture = page.locator(`[data-fixture="${fixtureId}"]`);
  return { fixture, host: fixture.locator('uif-input'), input: fixture.locator('uif-input input.uif-input') };
}

test('search input preserves a quote-breaking value without injecting attributes', async ({ page }) => {
  const { fixture, input } = await mount(page, 'search-quote', { type: 'search', value: hostile, 'aria-label': 'Search' });
  await expect(input).toHaveAttribute('type', 'search');
  await expect(input).toHaveAttribute('value', hostile);
  await expect(input).toHaveValue(hostile);
  await expect(input).not.toHaveAttribute('data-injected', /.*/);
  await expect(fixture.locator('[data-injected]')).toHaveCount(0);
  await expect(fixture.getByRole('button', { name: 'Clear input' })).toHaveCount(1);
});

test('dynamic attributes and host id stay literal for HTML and ampersand strings', async ({ page }) => {
  const { fixture, host, input } = await mount(page, 'literal-all', {
    id: markup,
    type: 'text',
    placeholder: markup,
    value: markup,
    name: markup,
    'aria-label': markup,
    'aria-labelledby': markup,
  });
  await expect(input).toHaveAttribute('placeholder', markup);
  await expect(input).toHaveAttribute('value', markup);
  await expect(input).toHaveAttribute('name', markup);
  await expect(input).toHaveAttribute('aria-label', markup);
  await expect(input).toHaveAttribute('aria-labelledby', markup);
  await expect(input).toHaveAttribute('id', markup);
  expect(await host.evaluate(el => el.id)).toBe(markup);
  await expect(fixture.locator('[data-injected]')).toHaveCount(0);
  await expect(fixture.locator('img, b')).toHaveCount(0);
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
});

test('type, min, max and step values stay literal without extra attributes', async ({ page }) => {
  const { fixture, input } = await mount(page, 'literal-number', {
    type: 'number" data-injected="yes',
    min: '0" data-injected="yes',
    max: '9&amp;"',
    step: '<1>',
    'aria-label': 'Number',
  });
  await expect(input).toHaveAttribute('type', 'number" data-injected="yes');
  await expect(input).toHaveAttribute('min', '0" data-injected="yes');
  await expect(input).toHaveAttribute('max', '9&amp;"');
  await expect(input).toHaveAttribute('step', '<1>');
  await expect(fixture.locator('[data-injected]')).toHaveCount(0);
});

test('attribute updates after mount re-render literally', async ({ page }) => {
  const { fixture, host, input } = await mount(page, 'update', { type: 'text', value: 'one', 'aria-label': 'First' });
  await expect(input).toHaveValue('one');
  await host.evaluate((el, v) => {
    el.setAttribute('value', v.hostile);
    el.setAttribute('placeholder', v.markup);
    el.setAttribute('aria-label', v.markup);
    el.setAttribute('name', v.markup);
  }, { hostile, markup });
  await expect(input).toHaveValue(hostile);
  await expect(input).toHaveAttribute('placeholder', markup);
  await expect(input).toHaveAttribute('aria-label', markup);
  await expect(input).toHaveAttribute('name', markup);
  await expect(fixture.locator('[data-injected]')).toHaveCount(0);
  await host.evaluate(el => el.removeAttribute('placeholder'));
  await expect(input).not.toHaveAttribute('placeholder', /.*/);
});

test('disabled and readonly states render and toggle', async ({ page }) => {
  const { fixture, host, input } = await mount(page, 'booleans', { value: hostile, disabled: '', readonly: '', 'aria-label': 'State' });
  await expect(input).toBeDisabled();
  await expect(input).toHaveAttribute('readonly', '');
  await expect(fixture.locator('.uif-input-field')).toHaveClass(/is-disabled/);
  await expect(input).toHaveValue(hostile);
  await host.evaluate(el => { el.removeAttribute('disabled'); el.removeAttribute('readonly'); });
  await expect(input).toBeEnabled();
  await expect(input).not.toHaveAttribute('readonly', /.*/);
  await expect(fixture.locator('.uif-input-field')).not.toHaveClass(/is-disabled/);
  await expect(fixture.locator('[data-injected]')).toHaveCount(0);
});

test('number and password controls still render', async ({ page }) => {
  const number = await mount(page, 'ctl-number', { type: 'number', value: '5', min: '0', max: '10', step: '1', 'aria-label': 'Count' });
  await expect(number.input).toHaveAttribute('type', 'number');
  await expect(number.input).toHaveValue('5');
  await expect(number.fixture.getByRole('button', { name: 'Decrease value' })).toHaveCount(1);
  await expect(number.fixture.getByRole('button', { name: 'Increase value' })).toHaveCount(1);

  const password = await mount(page, 'ctl-password', { type: 'password', placeholder: markup, 'aria-label': 'Secret' });
  await expect(password.input).toHaveAttribute('type', 'password');
  await expect(password.input).toHaveAttribute('placeholder', markup);
  await expect(password.fixture.locator('.uif-input-field-control button[aria-label="Toggle password visibility"]')).toHaveCount(1);
  await expect(password.fixture.locator('[data-injected]')).toHaveCount(0);
});
