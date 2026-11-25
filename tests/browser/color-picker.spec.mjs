import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page) {
  await page.goto("/patterns/color-picker-playground/");
  await page.evaluate(async () => customElements.whenDefined("uif-color-picker"));
  return page.locator("#color-picker-playground-root");
}

test("ColorPicker synchronizes text, range, area, wheel and swatch state", async ({ page }) => {
  const root = await openPlayground(page);
  const picker = root.locator("uif-color-picker");
  const hex = root.getByLabel("Hex");
  const rgb = root.getByLabel("RGB");
  const hsl = root.getByLabel("HSL");
  const hue = root.getByRole("slider", { name: "Hue", exact: true });
  const alpha = root.getByRole("slider", { name: "Opacity", exact: true });
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
  await expect.poll(() => page.evaluate(() => window.__colorEvents.slice(-2))).toEqual(["input", "change"]);

  await hue.fill("120");
  await hue.dispatchEvent("input");
  await hue.dispatchEvent("change");
  await expect(picker).toHaveAttribute("value", "#00FF0080");

  const area = root.getByRole("slider", { name: "Color saturation and brightness" });
  await area.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowDown");
  await expect(area).toHaveAttribute("aria-valuetext", /Saturation .*brightness/);

  const wheel = root.getByRole("slider", { name: "Hue wheel" });
  await wheel.focus();
  await page.keyboard.press("End");
  await expect(wheel).toHaveAttribute("aria-valuenow", "359");
  await expect(hue).toHaveValue("359");

  await root.getByRole("gridcell", { name: /Ocean blue/ }).click();
  await expect(picker).toHaveAttribute("value", "#0066CC");
  await expect(root.getByRole("gridcell", { name: /Ocean blue, #0066CC, selected/ })).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => page.evaluate(() => window.__lastColor.value)).toBe("#0066CC");
});

test("ColorPicker preserves the last valid color and exposes specific text errors", async ({ page }) => {
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

  await rgb.fill("rgb(12, 34, 56 / .5)");
  await rgb.press("Enter");
  await expect(picker).toHaveAttribute("value", "#0C223880");
  await expect(hex).toHaveValue("#0C223880");
  await expect(error).toBeHidden();
});

test("ColorPicker supports pointer input, grid roving focus and form reset", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = '<form><uif-color-picker id="test-color" label="Accent" name="accent" value="#FF0000"></uif-color-picker></form>';
  });
  const form = root.locator("form");
  const picker = root.locator("uif-color-picker");
  const area = root.getByRole("slider", { name: "Color saturation and brightness" });
  const box = await area.boundingBox();
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(picker).not.toHaveAttribute("value", "#FF0000");

  const first = root.getByRole("gridcell").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(root.getByRole("gridcell").nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(root.getByRole("gridcell").last()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root.getByRole("gridcell").last()).toHaveAttribute("aria-selected", "true");

  await form.evaluate((element) => element.reset());
  await expect(picker).toHaveAttribute("value", "#FF0000");
  await expect.poll(() => form.evaluate((element) => new FormData(element).get("accent"))).toBe("#FF0000");
});

test("ColorPicker exposes readonly, disabled, invalid and non-color states", async ({ page }) => {
  const root = await openPlayground(page);
  const picker = root.locator("uif-color-picker");
  const hex = root.getByLabel("Hex");
  const area = root.getByRole("slider", { name: "Color saturation and brightness" });

  await picker.evaluate((element) => element.setAttribute("readonly", ""));
  await expect(hex).toHaveAttribute("readonly", "");
  await expect(area).toHaveAttribute("aria-readonly", "true");
  const before = await picker.getAttribute("value");
  await area.focus();
  await page.keyboard.press("ArrowRight");
  await expect(picker).toHaveAttribute("value", before);

  await picker.evaluate((element) => {
    element.removeAttribute("readonly");
    element.setAttribute("invalid", "");
    element.setAttribute("error", "Choose a palette color.");
  });
  await expect(hex).toHaveAttribute("aria-invalid", "true");
  await expect(hex).toHaveAccessibleDescription("Choose a palette color.");

  await picker.evaluate((element) => element.setAttribute("disabled", ""));
  await expect(hex).toBeDisabled();
  await expect(root.getByRole("slider", { name: "Hue", exact: true })).toBeDisabled();
  await expect(root.getByRole("gridcell").first()).toBeDisabled();
});

test("ColorPicker reflows at zoom and preserves forced-color focus and selection cues", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const root = await openPlayground(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  const selected = root.getByRole("gridcell", { selected: true });
  await expect(selected).toHaveCSS("outline-style", "solid");
  const area = root.getByRole("slider", { name: "Color saturation and brightness" });
  await area.focus();
  await expect(area).toBeFocused();

  const results = await new AxeBuilder({ page }).include("#color-picker-playground-root").analyze();
  expect(results.violations).toEqual([]);
});
