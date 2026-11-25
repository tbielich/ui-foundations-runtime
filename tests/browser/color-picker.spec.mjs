import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page) {
  await page.goto("/patterns/color-picker-playground/");
  await page.evaluate(async () => customElements.whenDefined("uif-color-picker"));
  return page.locator("#color-picker-playground-root");
}

test("ColorPicker synchronizes text, axis, range, wheel and swatch state", async ({ page }) => {
  const root = await openPlayground(page);
  const picker = root.locator("uif-color-picker");
  const hex = root.getByLabel("Hex");
  const rgb = root.getByLabel("RGB");
  const hsl = root.getByLabel("HSL");
  const saturation = root.getByRole("slider", { name: "Saturation", exact: true });
  const brightness = root.getByRole("slider", { name: "Brightness", exact: true });
  const hue = root.getByRole("slider", { name: "Hue", exact: true });
  const alpha = root.getByRole("slider", { name: "Opacity", exact: true });
  const area = root.locator(".uif-color-picker-area");
  await picker.evaluate((element) => {
    window.__colorEvents = [];
    element.addEventListener("input", () => window.__colorEvents.push("input"));
    element.addEventListener("change", () => window.__colorEvents.push("change"));
    element.addEventListener("uif-color-change", (event) => window.__lastColor = event.detail);
  });

  await hex.fill("#FF000080");
  await hex.press("Enter");
  await expect(picker).toHaveAttribute("value", "#FF000080");
  await expect(rgb).toHaveValue("rgb(255, 0, 0 / 0.5)");
  await expect(hsl).toHaveValue("hsl(0 100% 50% / 0.5)");
  await expect(alpha).toHaveValue("50");
  await expect(saturation).toHaveValue("100");
  await expect(brightness).toHaveValue("100");
  await expect.poll(() => page.evaluate(() => window.__colorEvents.slice(-2))).toEqual(["input", "change"]);

  await hue.fill("120");
  await hue.dispatchEvent("input");
  await hue.dispatchEvent("change");
  await expect(picker).toHaveAttribute("value", "#00FF0080");

  const wheel = root.getByRole("slider", { name: "Hue wheel" });
  await wheel.focus();
  await page.keyboard.press("End");
  await expect(wheel).toHaveAttribute("aria-valuenow", "359");
  await expect(hue).toHaveValue("359");

  await saturation.focus();
  await expect(area).toHaveAttribute("data-focus-axis", "saturation");
  await expect(saturation).toHaveAttribute("min", "0");
  await expect(saturation).toHaveAttribute("max", "100");
  await expect(saturation).toHaveAttribute("aria-valuetext", "Saturation 100%");
  const brightnessBefore = await brightness.inputValue();
  await page.keyboard.press("Home");
  await expect(saturation).toHaveValue("0");
  await expect(brightness).toHaveValue(brightnessBefore);

  await brightness.focus();
  await expect(area).toHaveAttribute("data-focus-axis", "brightness");
  await expect(brightness).toHaveAttribute("aria-valuetext", `Brightness ${brightnessBefore}%`);
  const saturationBefore = await saturation.inputValue();
  await page.keyboard.press("Home");
  await expect(brightness).toHaveValue("0");
  await expect(saturation).toHaveValue(saturationBefore);

  await saturation.focus();
  await page.keyboard.press("Tab");
  await expect(brightness).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(wheel).toBeFocused();

  await root.getByRole("gridcell", { name: /Ocean blue/ }).click();
  await expect(picker).toHaveAttribute("value", "#0066CC");
  await expect(root.getByRole("gridcell", { name: /Ocean blue, #0066CC, selected/ })).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => page.evaluate(() => window.__lastColor.value)).toBe("#0066CC");
});

test("ColorPicker rejects malformed text and authored values consistently", async ({ page }) => {
  const root = await openPlayground(page);
  const picker = root.locator("uif-color-picker");
  const hex = root.getByLabel("Hex");
  const rgb = root.getByLabel("RGB");
  const error = root.locator(".uif-color-picker-error");
  const initial = await picker.getAttribute("value");

  await hex.fill("#12");
  await hex.press("Enter");
  await expect(picker).toHaveAttribute("value", initial);
  await expect(hex).toHaveValue("#12");
  await expect(hex).toHaveAttribute("aria-invalid", "true");
  await expect(hex).toHaveAccessibleDescription("Enter a valid Hex color.");
  await expect(error).toHaveText("Enter a valid Hex color.");

  await rgb.fill("rgb(12, 34oops, 56 / .5)");
  await rgb.press("Enter");
  await expect(picker).toHaveAttribute("value", initial);
  await expect(rgb).toHaveAttribute("aria-invalid", "true");
  await expect(error).toHaveText("Enter a valid RGB color.");

  await rgb.fill("rgb(12, 34, 56 / .5)");
  await rgb.press("Enter");
  await expect(picker).toHaveAttribute("value", "#0C223880");
  await expect(hex).toHaveValue("#0C223880");
  await expect(error).toBeHidden();

  await picker.evaluate((element) => { element.value = "rgb(12oops, 34, 56)"; });
  await expect(picker).toHaveAttribute("value", "#0C223880");
  await expect(hex).toHaveValue("#0C223880");
  await expect(error).toHaveText("Enter a valid Hex color.");

  await picker.evaluate((element) => { element.value = "#0C223880"; });
  await expect(picker).toHaveAttribute("value", "#0C223880");
  await expect(error).toBeHidden();
  await expect(hex).toHaveAttribute("aria-invalid", "false");

  await root.evaluate((container) => {
    const authored = document.createElement("uif-color-picker");
    authored.id = "authored-color";
    authored.setAttribute("label", "Authored color");
    authored.setAttribute("name", "authoredColor");
    authored.setAttribute("value", "#12");
    authored.swatches = [{ value: "#123456", label: "Custom blue" }];
    const form = document.createElement("form");
    form.append(authored);
    container.replaceChildren(form);
  });
  const authored = root.locator("#authored-color");
  await expect(authored).toHaveAttribute("value", "#0066CC");
  await expect(root.getByLabel("Hex")).toHaveValue("#0066CC");
  await expect(root.getByRole("gridcell", { name: /Custom blue/ })).toHaveCount(1);
  await expect.poll(() => root.locator("form").evaluate((form) => new FormData(form).get("authoredColor"))).toBe("#0066CC");
});

test("ColorPicker preserves latent HSVA axes across achromatic states", async ({ page }) => {
  const root = await openPlayground(page);
  const picker = root.locator("uif-color-picker");
  const rgb = root.getByLabel("RGB");
  const hsl = root.getByLabel("HSL");
  const saturation = root.getByRole("slider", { name: "Saturation", exact: true });
  const brightness = root.getByRole("slider", { name: "Brightness", exact: true });
  const hue = root.getByRole("slider", { name: "Hue", exact: true });
  const wheel = root.getByRole("slider", { name: "Hue wheel" });

  await hsl.fill("hsl(240 100% 50%)");
  await hsl.press("Enter");
  await rgb.fill("rgb(128, 128, 128)");
  await rgb.press("Enter");
  await expect(picker).toHaveAttribute("value", "#808080");
  await expect(hue).toHaveValue("240");
  await expect(saturation).toHaveValue("0");

  await saturation.focus();
  await page.keyboard.press("End");
  await expect(picker).toHaveAttribute("value", "#000080");

  await saturation.focus();
  await page.keyboard.press("Home");
  const wheelBox = await wheel.boundingBox();
  await page.mouse.click(wheelBox.x + wheelBox.width / 2, wheelBox.y + wheelBox.height * 0.9);
  await expect(picker).toHaveAttribute("value", "#808080");
  await expect(hue).toHaveValue("180");
  await saturation.focus();
  await page.keyboard.press("End");
  await expect(picker).toHaveAttribute("value", "#008080");

  await brightness.focus();
  await page.keyboard.press("Home");
  await expect(picker).toHaveAttribute("value", "#000000");
  await expect(hue).toHaveValue("180");
  await expect(saturation).toHaveValue("100");
  await page.keyboard.press("ArrowUp");
  await expect.poll(() => picker.evaluate((element) => element.color)).toEqual({ r: 0, g: 3, b: 3, a: 1 });

  const area = root.locator(".uif-color-picker-area");
  const areaBox = await area.boundingBox();
  await page.mouse.click(areaBox.x + areaBox.width * 0.75, areaBox.y + areaBox.height * 0.5);
  await expect.poll(() => picker.evaluate((element) => element.color)).toEqual({ r: 32, g: 128, b: 128, a: 1 });
});

test("ColorPicker synchronizes pointer input, separate axes, grid focus and form reset", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = '<form><uif-color-picker id="test-color" label="Accent" name="accent" value="#FF0000"></uif-color-picker></form>';
  });
  const form = root.locator("form");
  const picker = root.locator("uif-color-picker");
  const area = root.locator(".uif-color-picker-area");
  const saturation = root.getByRole("slider", { name: "Saturation", exact: true });
  const brightness = root.getByRole("slider", { name: "Brightness", exact: true });
  const hue = root.getByRole("slider", { name: "Hue", exact: true });
  const box = await area.boundingBox();
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(saturation).toHaveValue("50");
  await expect(brightness).toHaveValue("50");

  await saturation.focus();
  await page.keyboard.press("ArrowRight");
  await expect(saturation).toHaveValue("51");
  await expect(brightness).toHaveValue("50");
  await brightness.focus();
  await page.keyboard.press("ArrowUp");
  await expect(brightness).toHaveValue("51");
  await expect(saturation).toHaveValue("51");

  const first = root.getByRole("gridcell").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(root.getByRole("gridcell").nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(root.getByRole("gridcell").last()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root.getByRole("gridcell").last()).toHaveAttribute("aria-selected", "true");

  await hue.fill("120");
  await hue.dispatchEvent("input");
  await brightness.focus();
  await page.keyboard.press("Home");
  await expect(picker).toHaveAttribute("value", "#000000");

  await form.evaluate((element) => element.reset());
  await expect(picker).toHaveAttribute("value", "#FF0000");
  await expect(hue).toHaveValue("0");
  await expect(saturation).toHaveValue("100");
  await expect(brightness).toHaveValue("100");
  await expect.poll(() => form.evaluate((element) => new FormData(element).get("accent"))).toBe("#FF0000");
});

test("ColorPicker exposes readonly, disabled, invalid and persistent error relationships", async ({ page }) => {
  const root = await openPlayground(page);
  const picker = root.locator("uif-color-picker");
  const hex = root.getByLabel("Hex");
  const saturation = root.getByRole("slider", { name: "Saturation", exact: true });
  const brightness = root.getByRole("slider", { name: "Brightness", exact: true });
  const grid = root.getByRole("grid", { name: "Preset colors" });

  await picker.evaluate((element) => element.setAttribute("readonly", ""));
  await expect(hex).toHaveAttribute("readonly", "");
  await expect(saturation).toHaveAttribute("aria-readonly", "true");
  const before = await picker.getAttribute("value");
  await saturation.focus();
  await page.keyboard.press("ArrowRight");
  await expect(picker).toHaveAttribute("value", before);

  await picker.evaluate((element) => {
    element.removeAttribute("readonly");
    element.setAttribute("invalid", "");
    element.setAttribute("error", "Choose a palette color.");
  });
  await expect(hex).toHaveAttribute("aria-invalid", "true");
  await expect(hex).toHaveAccessibleDescription("Choose a palette color.");
  await expect(grid).toHaveAttribute("aria-invalid", "true");
  await expect(grid).toHaveAccessibleDescription("Choose a palette color.");
  await expect(root.getByRole("gridcell").first()).not.toHaveAttribute("aria-invalid", "true");
  await expect(root.getByRole("gridcell").first()).not.toHaveAttribute("aria-describedby", /.+/);
  await expect(root.getByRole("status")).toHaveCount(0);

  await picker.evaluate((element) => element.setAttribute("disabled", ""));
  await expect(hex).toBeDisabled();
  await expect(saturation).toBeDisabled();
  await expect(brightness).toBeDisabled();
  await expect(root.getByRole("slider", { name: "Hue", exact: true })).toBeDisabled();
  await expect(root.getByRole("gridcell").first()).toBeDisabled();
});

test("ColorPicker reflows at zoom and preserves forced-color axis focus and selection cues", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const root = await openPlayground(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  const selected = root.getByRole("gridcell", { selected: true });
  await expect(selected).toHaveCSS("outline-style", "solid");
  const saturation = root.getByRole("slider", { name: "Saturation", exact: true });
  const area = root.locator(".uif-color-picker-area");
  await saturation.focus();
  await expect(saturation).toBeFocused();
  await expect(area).toHaveAttribute("data-focus-axis", "saturation");
  await expect(area.locator(".uif-color-picker-area-focus")).toHaveText("Saturation");
  await expect(area.locator(".uif-color-picker-area-focus")).toBeVisible();
  await expect(area).toHaveCSS("outline-style", "solid");

  const results = await new AxeBuilder({ page }).include("#color-picker-playground-root").analyze();
  expect(results.violations).toEqual([]);
});
