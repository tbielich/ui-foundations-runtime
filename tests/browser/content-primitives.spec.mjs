import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page, slug, element = slug) {
  await page.goto(`/patterns/${slug}-playground/`);
  await page.evaluate(async (name) => customElements.whenDefined(`uif-${name}`), element);
  return page.locator(`#${slug}-playground-root`);
}

test("Breadcrumbs preserve hierarchy, current page and keyboard disclosure", async ({ page }) => {
  const root = await openPlayground(page, "breadcrumbs");
  const nav = root.getByRole("navigation", { name: "Breadcrumb" });
  await expect(nav.locator("ol").first()).toBeVisible();
  await expect(nav.locator('[aria-current="page"]')).toHaveText("Booking");
  const disclosure = nav.locator("summary");
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(nav.getByRole("link", { name: "Holidays" })).toBeVisible();
  await expect(disclosure).toBeFocused();
});

test("Card exposes one explicit control and toggles selectable state", async ({ page }) => {
  const root = await openPlayground(page, "card");
  await root.evaluate((container) => {
    const card = container.querySelector("uif-card");
    card.removeAttribute("href");
    card.setAttribute("selectable", "");
    window.__cardSelections = [];
    card.addEventListener("uif-select", (event) => window.__cardSelections.push(event.detail.selected));
  });
  const article = root.getByRole("article");
  const control = article.getByRole("button", { name: "View Mallorca escape" });
  await expect(control).toHaveAttribute("aria-pressed", "false");
  await control.click();
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(control).toBeFocused();
  await expect(article).toHaveAttribute("data-selected", "true");
  await expect.poll(() => page.evaluate(() => window.__cardSelections)).toEqual([true]);
  await expect(article.locator("a, button, input, select, textarea")).toHaveCount(1);
});

test("TagGroup roves focus, removes by keyboard and preserves focus", async ({ page }) => {
  const root = await openPlayground(page, "tag", "tag");
  const controls = root.getByRole("button", { name: /^Remove / });
  await expect(controls).toHaveCount(3);
  await controls.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(controls.nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(controls.nth(2)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press("Delete");
  await expect(root.locator("uif-tag")).toHaveCount(2);
  await expect(root.getByRole("button", { name: "Remove Beach" })).toBeFocused();
});

test("Skeleton leaves announcements to its busy containing region", async ({ page }) => {
  const root = await openPlayground(page, "skeleton");
  const region = root.getByRole("region", { name: "Loading holiday details" });
  await expect(region).toHaveAttribute("aria-busy", "true");
  await expect(region.locator("uif-skeleton")).toHaveAttribute("aria-hidden", "true");
  await expect(region.locator(".uif-skeleton")).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(region.locator(".uif-skeleton").first()).toHaveCSS("animation-name", "none");
});

test("Content primitives retain 320px reflow, forced colors and axe evidence", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  for (const slug of ["breadcrumbs", "card", "tag", "skeleton"]) {
    const root = await openPlayground(page, slug, slug === "tag" ? "tag" : slug);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const widths = await root.evaluate((element) => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      rootWidth: element.scrollWidth,
      rootClientWidth: element.clientWidth,
    }));
    expect(widths.documentWidth, `${slug}: ${JSON.stringify(widths)}`).toBeLessThanOrEqual(widths.viewportWidth + 1);
    if (slug !== "tag") expect(widths.rootWidth, `${slug}: ${JSON.stringify(widths)}`).toBeLessThanOrEqual(widths.rootClientWidth + 1);
    const results = await new AxeBuilder({ page }).include(`#${slug}-playground-root`).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  }
});
