import { test, expect } from "@playwright/test";

test("Meter and Illustrated Message keep selected brand colors after control updates", async ({ page }) => {
  for (const [name, target, control, value] of [
    ['meter', '.uif-meter-fill', 'value', '48'],
    ['illustrated-message', '.uif-button', 'actionLabel', 'Continue'],
  ]) {
    await page.goto(`/patterns/${name}-playground/`);
    const stage = page.locator('.playground-stage');
    for (const [brand, color] of [['a', 'rgb(0, 0, 0)'], ['b', 'rgb(151, 71, 255)'], ['c', 'rgb(12, 75, 243)']]) {
      await page.locator(`[data-hero-brand="${brand}"]`).click();
      await expect(stage.locator(target)).toHaveCSS('background-color', color);
      await page.locator(`[data-playground-control][name="${control}"]`).fill(name === "meter" ? String(Number(value) + ["a", "b", "c"].indexOf(brand)) : `${value} ${brand}`);
      await expect(stage.locator(target)).toHaveCSS('background-color', color);
    }
  }
});

test("selected Tabs follow Solid Button branding in light and Outline Button branding in dark", async ({ page }) => {
  for (const path of ['/patterns/tabs/', '/patterns/tabs-playground/']) {
    await page.goto(path);
    const stage = page.locator('.docs-hero-preview-stage').first();
    for (const mode of ['light', 'dark']) {
      await page.locator(`[data-hero-mode="${mode}"]`).click();
      for (const brand of ['a', 'b', 'c']) {
        await page.locator(`[data-hero-brand="${brand}"]`).click();
        const expected = await stage.evaluate((el, mode) => {
          const reference = document.createElement('button');
          reference.className = mode === 'dark' ? 'uif-button outline' : 'uif-button solid';
          reference.textContent = 'Reference';
          el.append(reference);
          const styles = getComputedStyle(reference);
          const color = mode === 'dark' ? styles.color : styles.backgroundColor;
          reference.remove();
          return color;
        }, mode);
        const selected = stage.getByRole('tab', { selected: true });
        await expect(selected).toHaveCSS('color', expected);
        await expect(selected).toHaveCSS('border-bottom-color', expected);
        const standalone = await stage.evaluate(el => {
          const tab = document.createElement('button');
          tab.className = 'uif-tab';
          tab.setAttribute('aria-selected', 'true');
          tab.textContent = 'Standalone selected tab';
          el.append(tab);
          const styles = getComputedStyle(tab);
          const result = { color: styles.color, border: styles.borderBottomColor };
          tab.remove();
          return result;
        });
        expect(standalone).toEqual({ color: expected, border: expected });
        const contrast = await selected.evaluate(el => {
          const background = getComputedStyle(el.closest('.docs-hero-preview-stage')).backgroundColor;
          const foreground = getComputedStyle(el).color;
          const luminance = color => {
            const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
              const s = v / 255;
              return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
          };
          const a = luminance(background), b = luminance(foreground);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        });
        expect(contrast).toBeGreaterThanOrEqual(4.5);
        if (path.includes('playground')) await stage.getByRole('tab').nth(1).click();
        await stage.getByRole('tab', { selected: true }).hover();
        await expect(stage.getByRole('tab', { selected: true })).toHaveCSS('color', expected);
        await expect(stage.getByRole('tab', { selected: true })).toHaveCSS('border-bottom-color', expected);
      }
    }
  }
});

test("Accordion hover follows each brand and opening items preserves block width", async ({ page }) => {
  for (const path of ['/patterns/accordion/', '/patterns/accordion-playground/']) {
    await page.goto(path);
    const preview = page.locator('.docs-hero-preview').first();
    const accordion = preview.locator('.uif-accordion').first();
    const summary = accordion.locator('summary').first();
    for (const mode of ['light', 'dark']) {
      await preview.locator(`[data-hero-mode="${mode}"]`).click();
      const colors = [];
      for (const brand of ['a', 'b', 'c']) {
        await preview.locator(`[data-hero-brand="${brand}"]`).click();
        const before = await accordion.boundingBox();
        await summary.hover();
        colors.push(await summary.evaluate(el => getComputedStyle(el).backgroundColor));
        await summary.click();
        expect((await accordion.boundingBox()).width).toBeCloseTo(before.width, 1);
        await summary.click();
        expect((await accordion.boundingBox()).width).toBeCloseTo(before.width, 1);
        const available = await accordion.evaluate(el => {
          const parent = el.parentElement, css = getComputedStyle(parent);
          return parent.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
        });
        expect(before.width).toBeCloseTo(available, 0);
      }
      expect(new Set(colors).size).toBe(3);
    }
  }
});
