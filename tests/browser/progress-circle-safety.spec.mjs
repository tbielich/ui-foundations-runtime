import { test, expect } from '@playwright/test';
import nunjucks from 'nunjucks';

test('ProgressCircle treats labels as text when created and updated', async ({ page }) => {
  await page.goto('/base/preview/');
  const label = '\"><img data-injected src=x onerror="window.injected=true"> & Progress';
  await page.evaluate(async label => {
    await import('/vendor/ui-foundations/elements/ui-progress-circle.js');
    const el = document.createElement('uif-progress-circle');
    el.id = 'safety-progress';
    el.setAttribute('label', label);
    el.setAttribute('value', '37');
    document.body.append(el);
  }, label);
  const host = page.locator('#safety-progress');
  await expect(host.getByRole('progressbar')).toHaveAttribute('aria-label', label);
  await expect(host.locator('[data-injected]')).toHaveCount(0);
  await host.evaluate(el => { el.setAttribute('label', 'Updated "label" & details'); el.removeAttribute('value'); });
  await expect(host.getByRole('progressbar')).toHaveAttribute('aria-label', 'Updated "label" & details');
  await expect(host.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
});

test('ProgressCircle macro escapes labels and normalizes numeric values', async ({ page }) => {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('site/_includes'), { autoescape: false });
  const label = '\"><img data-injected src=x onerror="window.injected=true"> & Progress';
  for (const [value, expected] of [['37', '37'], ['200', '100'], ['-5', '0'], ['\"><img data-injected src=x>', null], ['', null]]) {
    const html = env.renderString('{% import "macros/ui.njk" as uif %}{{ uif.progressCircle(value=value, label=label) }}', { value, label });
    await page.setContent(html);
    const progress = page.getByRole('progressbar');
    await expect(progress).toHaveAttribute('aria-label', label);
    await expect(page.locator('[data-injected]')).toHaveCount(0);
    if (expected === null) await expect(progress).not.toHaveAttribute('aria-valuenow');
    else await expect(progress).toHaveAttribute('aria-valuenow', expected);
  }
});
