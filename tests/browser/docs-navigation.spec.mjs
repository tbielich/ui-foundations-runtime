import { test, expect } from "@playwright/test";

const path = "/patterns/button-playground/";

test("mobile drawer contains focus and closes through each supported action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  const trigger = page.getByRole("button", { name: "Open navigation" });
  const drawer = page.locator("#docs-navigation-drawer");
  const close = page.getByRole("button", { name: "Close navigation" });
  await expect(page.locator(".docs-sidebar")).not.toBeVisible();
  await expect(trigger).toHaveAttribute("aria-controls", "docs-navigation-drawer");
  for (const action of ["close", "escape", "backdrop"]) {
    const triggerBounds = await trigger.boundingBox();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(close).toBeFocused();
    const closeBounds = await close.boundingBox();
    for (const dimension of ["x", "y", "width", "height"]) {
      expect(closeBounds[dimension]).toBeCloseTo(triggerBounds[dimension], 1);
    }
    await expect(drawer).toBeVisible();
    expect(await drawer.evaluate(el => el.getBoundingClientRect().left)).toBe(0);
    expect(await page.locator("body").evaluate(el => el.style.overflow)).toBe("hidden");
    await page.keyboard.press("Shift+Tab");
    expect(await drawer.evaluate(el => el.contains(document.activeElement))).toBe(true);
    if (action === "close") await close.click();
    if (action === "escape") await page.keyboard.press("Escape");
    if (action === "backdrop") await page.mouse.click(380, 400);
    await expect(drawer).not.toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    expect(await page.locator("body").evaluate(el => el.style.overflow)).toBe("");
  }
});

test("resize restores the same sidebar and desktop layout", async ({ page }) => {
  await page.setViewportSize({ width: 980, height: 800 });
  await page.goto(path);
  await page.evaluate(() => { window.originalSidebar = document.querySelector(".docs-sidebar"); });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.setViewportSize({ width: 981, height: 800 });
  await expect(page.locator(".docs-shell > .docs-sidebar")).toBeVisible();
  await expect(page.locator(".docs-navigation-trigger")).not.toBeVisible();
  await expect(page.locator("#docs-navigation-drawer")).not.toBeVisible();
  expect(await page.evaluate(() => document.querySelector(".docs-sidebar") === window.originalSidebar)).toBe(true);
  expect(await page.locator("body").evaluate(el => el.style.overflow)).toBe("");
  await expect(page.locator(".docs-search-input")).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator("#docs-navigation-drawer .docs-nav")).toBeVisible();
  await page.getByRole("button", { name: "Close navigation" }).click();
});

test("without JavaScript mobile navigation remains available", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8099" + path);
  await expect(page.locator(".docs-shell > .docs-sidebar")).toBeVisible();
  await expect(page.locator(".docs-navigation-trigger")).not.toBeVisible();
  await context.close();
});


test("page jump navigation stacks below mobile breadcrumbs and beside desktop content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/foundations/architecture/");
  const toc = page.getByRole("navigation", { name: "On this page", exact: true });
  const content = page.locator(".docs-content");
  await expect(toc).toBeVisible();
  const mobileToc = await toc.boundingBox();
  const breadcrumbBounds = await page.locator(".docs-breadcrumb").boundingBox();
  const headingBounds = await content.locator("h1").boundingBox();
  expect(mobileToc.y).toBeGreaterThanOrEqual(breadcrumbBounds.y + breadcrumbBounds.height);
  expect(mobileToc.y + mobileToc.height).toBeLessThanOrEqual(headingBounds.y);
  const bounds = await toc.locator("li").evaluateAll(items => items.map(item => {
    const rect = item.getBoundingClientRect();
    return { x: rect.x, y: rect.y, bottom: rect.bottom };
  }));
  for (let i = 1; i < bounds.length; i++) {
    expect(bounds[i].x).toBe(bounds[0].x);
    expect(bounds[i].y).toBeGreaterThanOrEqual(bounds[i - 1].bottom);
  }
  expect(mobileToc.width).toBeLessThanOrEqual(390);
  const link = toc.locator("a").first();
  const href = await link.getAttribute("href");
  await link.click();
  expect(new URL(page.url()).hash).toBe(href);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(() => toc.evaluate(el => getComputedStyle(el).position)).toBe("sticky");
  const desktopToc = await toc.boundingBox();
  const desktopContent = await content.boundingBox();
  expect(desktopToc.x).toBeGreaterThanOrEqual(desktopContent.x + desktopContent.width);
  expect(await toc.evaluate(el => getComputedStyle(el).position)).toBe("sticky");
});
