import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page, slug) {
  await page.goto(`/patterns/${slug}-playground/`);
  await page.evaluate(async (name) => customElements.whenDefined(`uif-${name}`), slug);
  return page.locator(`#${slug}-playground-root`);
}

test("Search Field clears accessibly and retains native form submission", async ({ page }) => {
  const root = await openPlayground(page, "search-field");
  await root.evaluate((container) => {
    const field = container.querySelector("uif-search-field");
    const form = document.createElement("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.__searchSubmits = (window.__searchSubmits || 0) + 1;
    });
    field.addEventListener("uif-search", (event) => { window.__searchQuery = event.detail.query; });
    field.addEventListener("input", () => { window.__searchInputs = (window.__searchInputs || 0) + 1; });
    field.addEventListener("change", () => { window.__searchChanges = (window.__searchChanges || 0) + 1; });
    form.append(field);
    container.append(form);
  });
  const input = root.getByRole("searchbox", { name: "Search holidays" });
  await input.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => [window.__searchSubmits, window.__searchQuery])).toEqual([1, "Mallorca"]);
  const clear = root.getByRole("button", { name: "Clear Search holidays" });
  const clearControl = root.locator(".uif-search-field-clear");
  await expect(clear).toBeEnabled();
  await clear.click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(clearControl).toBeDisabled();
  await expect.poll(() => page.evaluate(() => [window.__searchInputs, window.__searchChanges])).toEqual([1, 1]);
});

test("Number Field clamps steps and keeps formatted speech separate", async ({ page }) => {
  const root = await openPlayground(page, "number-field");
  await root.evaluate((container) => {
    const field = container.querySelector("uif-number-field");
    field.setAttribute("max", "550");
    window.__numberChanges = [];
    field.addEventListener("uif-change", (event) => window.__numberChanges.push(event.detail.value));
  });
  const input = root.getByRole("spinbutton", { name: "Holiday budget" });
  const increase = root.getByRole("button", { name: "Increase Holiday budget" });
  await increase.click();
  await increase.click();
  await expect(input).toHaveValue("550");
  await expect(input).toHaveAttribute("aria-valuetext", /.+/);
  await expect(root.locator(".uif-number-field-formatted")).not.toHaveText("550");
  await expect.poll(() => page.evaluate(() => window.__numberChanges)).toEqual([550, 550]);
  await input.focus();
  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveValue("500");
});

test("Segmented Control uses native radio navigation and disabled state", async ({ page }) => {
  const root = await openPlayground(page, "segmented-control");
  await root.evaluate((container) => {
    const control = container.querySelector("uif-segmented-control");
    window.__segmentChanges = [];
    control.addEventListener("uif-change", (event) => window.__segmentChanges.push(event.detail.value));
  });
  const radios = root.getByRole("radio");
  await expect(radios).toHaveCount(3);
  await expect(radios.first()).toBeChecked();
  await radios.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(radios.nth(1)).toBeChecked();
  await expect(radios.nth(1)).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.__segmentChanges)).toEqual(["grid"]);
});

test("Range Slider keeps native thumbs labelled and non-crossing", async ({ page }) => {
  const root = await openPlayground(page, "range-slider");
  const lower = root.getByRole("slider", { name: "Minimum" });
  const upper = root.getByRole("slider", { name: "Maximum" });
  await expect(lower).toHaveValue("300");
  await expect(upper).toHaveValue("1200");
  await lower.focus();
  await page.keyboard.press("End");
  await expect(lower).toHaveValue("1200");
  await expect(upper).toHaveAttribute("min", "1200");
  await upper.focus();
  await page.keyboard.press("Home");
  await expect(upper).toHaveValue("1200");
  await expect(lower).toHaveAttribute("max", "1200");
  await expect(lower).toHaveAttribute("aria-valuetext", "Minimum: 1200");
});

test("Disabled and error states remain native and programmatically connected", async ({ page }) => {
  let root = await openPlayground(page, "search-field");
  await root.locator("uif-search-field").evaluate((element) => element.setAttribute("disabled", ""));
  await expect(root.getByRole("searchbox", { name: "Search holidays" })).toBeDisabled();
  await expect(root.locator(".uif-search-field-clear")).toBeDisabled();

  root = await openPlayground(page, "number-field");
  await root.locator("uif-number-field").evaluate((element) => {
    element.setAttribute("invalid", "");
    element.setAttribute("error", "Enter a budget up to 5000");
  });
  const number = root.getByRole("spinbutton", { name: "Holiday budget" });
  await expect(number).toHaveAttribute("aria-invalid", "true");
  await expect(number).toHaveAttribute("aria-describedby", /-formatted .+-error/);
  await expect(root.getByText("Enter a budget up to 5000")).toBeVisible();

  root = await openPlayground(page, "segmented-control");
  await root.locator("uif-segmented-control").evaluate((element) => element.setAttribute("disabled", ""));
  for (const radio of await root.getByRole("radio").all()) await expect(radio).toBeDisabled();

  root = await openPlayground(page, "range-slider");
  await root.locator("uif-range-slider").evaluate((element) => {
    element.setAttribute("invalid", "");
    element.setAttribute("error", "Choose a narrower price range");
  });
  for (const slider of await root.getByRole("slider").all()) {
    await expect(slider).toHaveAttribute("aria-invalid", "true");
    await expect(slider).toHaveAttribute("aria-describedby", /-error$/);
  }
  await expect(root.getByText("Choose a narrower price range")).toBeVisible();
});

test("Input controls retain reflow, focus, forced colors, reduced motion and axe evidence", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  for (const slug of ["search-field", "number-field", "segmented-control", "range-slider"]) {
    const root = await openPlayground(page, slug);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const firstControl = root.locator("input:not([disabled])").first();
    await firstControl.focus();
    await expect(firstControl).toBeFocused();
    const geometry = await root.evaluate((element) => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      rootWidth: element.scrollWidth,
      rootClientWidth: element.clientWidth,
    }));
    expect(geometry.documentWidth, `${slug}: ${JSON.stringify(geometry)}`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.rootWidth, `${slug}: ${JSON.stringify(geometry)}`).toBeLessThanOrEqual(geometry.rootClientWidth + 1);
    if (slug === "segmented-control") {
      const transitionDuration = await root.locator(".uif-segmented-control-content").first().evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
      expect(transitionDuration).toBeLessThanOrEqual(0.001);
    }
    const results = await new AxeBuilder({ page }).include(`#${slug}-playground-root`).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  }
});
