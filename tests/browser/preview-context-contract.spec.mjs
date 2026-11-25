import { test, expect } from "@playwright/test";

const surfaces = [
  ["toast", ".uif-toast"],
  ["popover", ".uif-popover-trigger"],
  ["breadcrumbs", ".uif-breadcrumbs"],
  ["card", ".uif-card"],
  ["tag", ".uif-tag"],
  ["skeleton", ".uif-skeleton-group"],
  ["search-field", ".uif-search-field"],
  ["number-field", ".uif-number-field"],
  ["segmented-control", ".uif-segmented-control"],
  ["range-slider", ".uif-range-slider"],
  ["combo-box", ".uif-combo-box"],
  ["color-picker", ".uif-color-picker"],
];

const targetSurfaces = [
  ["toast", ".uif-toast-dismiss", ".uif-toast-dismiss", ".uif-toast-dismiss"],
  ["popover", ".uif-popover-trigger", ".uif-popover-trigger", ".uif-popover-trigger"],
  ["breadcrumbs", ".uif-breadcrumbs-disclosure-trigger", ".uif-breadcrumbs-disclosure-trigger", ".uif-breadcrumbs-disclosure-trigger"],
  ["card", ".uif-card-control", ".uif-card-control", ".uif-card-control"],
  ["tag", ".uif-tag-remove", ".uif-tag-remove", ".uif-tag-remove"],
  ["search-field", ".uif-search-field-clear", ".uif-search-field-clear", ".uif-search-field-control"],
  ["number-field", ".uif-number-field-step", ".uif-number-field-step", ".uif-number-field-control"],
  ["segmented-control", ".uif-segmented-control-content", ".uif-segmented-control-input", ".uif-segmented-control-content"],
  ["range-slider", ".uif-range-slider-track", ".uif-range-slider-input", null],
  ["combo-box", ".uif-combo-box-toggle", ".uif-combo-box-toggle", ".uif-combo-box-control"],
  ["color-picker", ".uif-color-picker-swatch", ".uif-color-picker-swatch", ".uif-color-picker-swatch"],
];

for (const [slug, selector] of surfaces) {
  test(`${slug} overview uses the shared accessible preview context`, async ({ page }) => {
    await page.goto(`/patterns/${slug}/`);
    const preview = page.locator(".docs-component-preview");
    const stage = preview.locator(".docs-hero-preview-stage");
    const brand = preview.getByRole("group", { name: "Preview brand" });
    const scheme = preview.getByRole("group", { name: "Preview scheme" });
    const scale = preview.getByRole("group", { name: "Preview scale" });
    await expect(brand).toBeVisible();
    await expect(scheme).toBeVisible();
    await expect(scale).toBeVisible();
    await expect(brand.locator("button")).toHaveCount(3);
    await expect(scheme.locator("button")).toHaveCount(2);
    await expect(scale.locator("button")).toHaveCount(3);

    const headingSize = await page.locator("h1").evaluate((element) => getComputedStyle(element).fontSize);
    await scale.getByRole("button", { name: "Small scale" }).click();
    const small = await stage.locator(selector).first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    const largeButton = scale.getByRole("button", { name: "Large scale" });
    await largeButton.focus();
    await page.keyboard.press("Space");
    await expect(largeButton).toHaveAttribute("aria-pressed", "true");
    await expect(scale.locator('[aria-pressed="true"]')).toHaveCount(1);
    const large = await stage.locator(selector).first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(large).toBeGreaterThan(small);
    await expect(stage).toHaveAttribute("data-scale", "large");
    expect(await page.locator("h1").evaluate((element) => getComputedStyle(element).fontSize)).toBe(headingSize);
  });

  test(`${slug} playground hydrates, generates and resets container scale`, async ({ page }) => {
    await page.goto(`/patterns/${slug}-playground/?pg-${slug}-scale=large`);
    const playground = page.locator("[data-playground]");
    const preview = playground.locator(".playground-preview");
    const scale = preview.getByRole("group", { name: "Preview scale" });
    await expect(preview.getByRole("group", { name: "Preview brand" })).toBeVisible();
    await expect(preview.getByRole("group", { name: "Preview scheme" })).toBeVisible();
    await expect(scale.getByRole("button", { name: "Large scale" })).toHaveAttribute("aria-pressed", "true");
    await expect(playground.locator('[name="scale"]')).toBeHidden();
    await expect(playground.locator('[name="scale"]')).toHaveValue("large");
    await expect(playground.locator(`#${slug}-playground-root [data-scale="large"]`)).toHaveCount(1);
    for (const suffix of ["", "-njk", "-wc"]) {
      await expect(page.locator(`#${slug}-playground-code${suffix}`)).toContainText('data-scale="large"');
    }

    await scale.getByRole("button", { name: "Small scale" }).click();
    await expect(page).toHaveURL(new RegExp(`pg-${slug}-scale=small`));
    await expect(playground.locator(`#${slug}-playground-root [data-scale="small"]`)).toHaveCount(1);
    await playground.locator("[data-playground-reset]").click();
    await expect(scale.getByRole("button", { name: "Medium scale" })).toHaveAttribute("aria-pressed", "true");
    await expect(playground.locator(`#${slug}-playground-root [data-scale="medium"]`)).toHaveCount(1);
    await expect(page).toHaveURL(new RegExp(`pg-${slug}-scale=medium`));
  });
}

test("Tag and Segmented Control keep local size independent from container scale", async ({ page }) => {
  for (const [slug, nextSize] of [["tag", "md"], ["segmented-control", "lg"]]) {
    await page.goto(`/patterns/${slug}-playground/?pg-${slug}-scale=large`);
    const playground = page.locator("[data-playground]");
    const scale = playground.getByRole("group", { name: "Preview scale" });
    const size = playground.locator('[name="size"]');
    await size.selectOption("sm");
    await expect(size).toHaveValue("sm");
    await scale.getByRole("button", { name: "Small scale" }).click();
    await expect(size).toHaveValue("sm");
    await size.selectOption(nextSize);
    await expect(scale.getByRole("button", { name: "Small scale" })).toHaveAttribute("aria-pressed", "true");
    await expect(playground.locator(`#${slug}-playground-root [data-scale="small"]`)).toHaveCount(1);
  }
});

test("new overlay, form and surface previews respond meaningfully to Brand and Scheme", async ({ page }) => {
  for (const [slug, selector] of [
    ["toast", ".uif-toast"],
    ["search-field", ".uif-search-field-control"],
    ["popover", ".uif-popover-trigger"],
  ]) {
    await page.goto(`/patterns/${slug}-playground/`);
    const preview = page.locator(".playground-preview");
    const target = preview.locator(selector).first();
    const stage = preview.locator(".docs-hero-preview-stage");
    const style = () => target.evaluate((element) => {
      const computed = getComputedStyle(element);
      return [computed.backgroundColor, computed.color, computed.borderColor, computed.fontFamily, computed.fontWeight].join("|");
    });
    await preview.locator('[data-hero-brand="a"]').click();
    await expect(stage).toHaveAttribute("data-brand", "a");
    const brandA = await style();
    await preview.locator('[data-hero-brand="c"]').click();
    await expect(stage).toHaveAttribute("data-brand", "c");
    expect(await style(), `${slug} Brand effect`).not.toBe(brandA);
    await preview.locator('[data-hero-mode="light"]').click();
    await expect(stage).toHaveAttribute("data-mode", "light");
    const light = await style();
    await preview.locator('[data-hero-mode="dark"]').click();
    await expect(stage).toHaveAttribute("data-mode", "dark");
    expect(await style(), `${slug} Scheme effect`).not.toBe(light);
    await expect(preview.locator('[data-hero-brand="c"]')).toHaveAttribute("aria-pressed", "true");
    await expect(preview.locator('[data-hero-mode="dark"]')).toHaveAttribute("aria-pressed", "true");
  }
});

test("all scaled playgrounds reflow at 320px and 200% text", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const [slug] of surfaces) {
    await page.goto(`/patterns/${slug}-playground/?pg-${slug}-scale=large`);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), {
      message: `${slug} must not cause page-level horizontal overflow`,
    }).toBe(true);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  }
});

test("scaled controls preserve target floors and forced-color focus visibility", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ forcedColors: "active" });
  for (const [slug, targetSelector, focusSelector, indicatorSelector] of targetSurfaces) {
    await page.goto(`/patterns/${slug}-playground/?pg-${slug}-scale=small`);
    const root = page.locator(`#${slug}-playground-root`);
    const target = root.locator(targetSelector).first();
    const focusTarget = root.locator(focusSelector).first();
    const box = await target.boundingBox();
    expect(box, `${slug} target must be rendered`).not.toBeNull();
    expect(box.width, `${slug} target width`).toBeGreaterThanOrEqual(24);
    expect(box.height, `${slug} target height`).toBeGreaterThanOrEqual(24);
    await focusTarget.focus();
    await expect(focusTarget).toBeFocused();
    if (indicatorSelector) {
      const visible = await root.locator(indicatorSelector).first().evaluate((element) => {
        const style = getComputedStyle(element);
        return style.outlineStyle !== "none" || style.boxShadow !== "none";
      });
      expect(visible, `${slug} focus indicator`).toBe(true);
    }
  }
});

test("scale keeps relevant reduced-motion fallbacks intact", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/patterns/toast-playground/?pg-toast-scale=large");
  await expect(page.locator("#toast-playground-root .uif-toast")).toHaveCSS("animation-name", "none");
  await page.goto("/patterns/skeleton-playground/?pg-skeleton-scale=large");
  await expect(page.locator("#skeleton-playground-root .uif-skeleton").first()).toHaveCSS("animation-name", "none");
  await page.goto("/patterns/segmented-control-playground/?pg-segmented-control-scale=large");
  const duration = await page.locator("#segmented-control-playground-root .uif-segmented-control-content").first().evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration));
  expect(duration).toBeLessThan(0.001);
});
