import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page) {
  await page.goto("/patterns/combo-box-playground/");
  await page.evaluate(async () => customElements.whenDefined("uif-combo-box"));
  return page.locator("#combo-box-playground-root");
}

test("ComboBox exposes role, name, ownership, filtering and custom option content", async ({ page }) => {
  const root = await openPlayground(page);
  const combo = root.locator("uif-combo-box");
  const input = root.getByRole("combobox", { name: "Destination" });
  await combo.evaluate((element) => {
    window.__comboEvents = [];
    element.addEventListener("input", () => window.__comboEvents.push("input"));
    element.addEventListener("change", () => window.__comboEvents.push("change"));
    element.addEventListener("uif-selection", (event) => window.__comboEvents.push(event.detail));
  });

  await input.focus();
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await expect(input).toHaveAttribute("aria-controls", /-listbox$/);
  await expect(root.getByRole("listbox")).toBeVisible();
  await expect(root.getByRole("option").first().locator("strong")).toContainText("Palma de Mallorca — PMI");

  await input.fill("Tener");
  await expect(root.getByRole("option")).toHaveCount(1);
  await expect(root.getByRole("option")).toContainText("Tenerife — TFS");
  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /option-1$/);
  await page.keyboard.press("Enter");

  await expect(input).toHaveValue("Tenerife");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).not.toHaveAttribute("aria-activedescendant", /.+/);
  await expect(combo).toHaveAttribute("value", "tfs");
  await expect(combo.locator('input[type="hidden"]')).toHaveValue("tfs");
  await expect.poll(() => page.evaluate(() => window.__comboEvents)).toEqual([
    "input",
    "input",
    "change",
    { value: "tfs", textValue: "Tenerife", freeform: false },
  ]);
});

test("ComboBox restores complete initial state after selected and free-form edits", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = `
      <form>
        <uif-combo-box label="Destination" name="destination" value="pmi" freeform>
          <uif-combo-box-option value="pmi" text-value="Palma de Mallorca">Palma de Mallorca — PMI</uif-combo-box-option>
          <uif-combo-box-option value="tfs" text-value="Tenerife">Tenerife — TFS</uif-combo-box-option>
        </uif-combo-box>
      </form>`;
  });

  const form = root.locator("form");
  const combo = form.locator("uif-combo-box");
  const input = form.getByRole("combobox", { name: "Destination" });
  const hidden = combo.locator('input[type="hidden"]');
  const initialOption = combo.locator('.uif-combo-box-option[data-value="pmi"]');
  const popup = combo.locator(".uif-combo-box-popup");

  const expectInitialState = async () => {
    await expect(input).toHaveValue("Palma de Mallorca");
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).not.toHaveAttribute("aria-activedescendant", /.+/);
    await expect(popup).toBeHidden();
    await expect(combo).toHaveAttribute("value", "pmi");
    await expect(hidden).toHaveValue("pmi");
    await expect(initialOption).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => form.evaluate((element) => new FormData(element).get("destination"))).toBe("pmi");
    await expect.poll(() => combo.evaluate((element) => {
      const active = element._optionData.find((option) => option.key === element._activeKey);
      return active?.value;
    })).toBe("pmi");
  };

  await input.focus();
  await input.fill("Tener");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("value", "tfs");
  await form.evaluate((element) => element.reset());
  await expectInitialState();

  await input.fill("Atlantis");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("value", "Atlantis");
  await expect(hidden).toHaveValue("Atlantis");
  await form.evaluate((element) => element.reset());
  await expectInitialState();
});

test("ComboBox restores an asynchronously resolved initial value on form reset", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = `
      <form>
        <uif-combo-box label="Destination" name="destination" value="pmi"></uif-combo-box>
      </form>`;
  });

  const form = root.locator("form");
  const combo = form.locator("uif-combo-box");
  const input = form.getByRole("combobox", { name: "Destination" });
  const hidden = combo.locator('input[type="hidden"]');

  await expect(input).toHaveValue("");
  await combo.evaluate((element) => {
    element.options = [
      { value: "pmi", textValue: "Palma de Mallorca" },
      { value: "tfs", textValue: "Tenerife" },
    ];
  });
  await expect(input).toHaveValue("Palma de Mallorca");

  await input.focus();
  await input.fill("Tener");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("value", "tfs");

  await form.evaluate((element) => element.reset());
  await expect(input).toHaveValue("Palma de Mallorca");
  await expect(combo).toHaveAttribute("value", "pmi");
  await expect(hidden).toHaveValue("pmi");
  await expect.poll(() => form.evaluate((element) => new FormData(element).get("destination"))).toBe("pmi");
});

test("ComboBox keeps one visible polite loading status while closed and open", async ({ page }) => {
  const root = await openPlayground(page);
  const combo = root.locator("uif-combo-box");
  const input = root.getByRole("combobox", { name: "Destination" });
  const status = root.getByRole("status");

  await expect(input).not.toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await combo.evaluate((element) => element.setAttribute("loading", ""));
  await expect(input).toHaveAttribute("aria-busy", "true");
  await expect(status).toBeVisible();
  await expect(status).toHaveText("Loading options…");
  await expect(root.getByText("Loading options…", { exact: true })).toHaveCount(1);
  await expect(root.locator(".uif-combo-box-popup")).toBeHidden();

  await input.focus();
  await input.fill("a");
  await page.keyboard.press("ArrowDown");
  const activeBefore = await input.getAttribute("aria-activedescendant");
  await expect(root.locator(".uif-combo-box-popup")).toBeVisible();
  await expect(status).toHaveText("Loading options…");
  await expect(root.getByText("Loading options…", { exact: true })).toHaveCount(1);

  await combo.evaluate((element) => {
    element.options = [
      { value: "pmi", textValue: "Palma de Mallorca", label: "Palma de Mallorca — PMI" },
      { value: "agp", textValue: "Malaga", label: "Malaga — AGP" },
      { value: "mla", textValue: "Malta", label: "Malta — MLA" },
    ];
    element.removeAttribute("loading");
  });

  await expect(input).toHaveValue("a");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-busy", "false");
  await expect(input).toHaveAttribute("aria-activedescendant", activeBefore);
  await expect(status).toContainText("3 suggestions available");

  const announcement = await status.textContent();
  await input.fill("Mal");
  await expect(root.getByRole("option")).toHaveCount(3);
  await expect(status).toHaveText(announcement);
});

test("ComboBox separates free-form commits from option-only selection and exposes states", async ({ page }) => {
  const root = await openPlayground(page);
  const combo = root.locator("uif-combo-box");
  const input = root.getByRole("combobox", { name: "Destination" });
  const hidden = combo.locator('input[type="hidden"]');

  await combo.evaluate((element) => {
    element.options = [];
    element.setAttribute("freeform", "");
  });
  await input.fill("Atlantis");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("value", "Atlantis");
  await expect(hidden).toHaveValue("Atlantis");

  await combo.evaluate((element) => element.removeAttribute("freeform"));
  await input.fill("Unknown");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("value", "");
  await expect(hidden).toHaveValue("");
  await expect(root.getByText("No suggestions found.")).toBeVisible();

  await combo.evaluate((element) => element.setAttribute("invalid", ""));
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAttribute("aria-describedby", /-error$/);
  await expect(input).toHaveAccessibleDescription("Select a valid option.");
  await expect(root.locator(".uif-combo-box-error")).toHaveText("Select a valid option.");
  await expect(root.locator(".uif-combo-box-error")).toBeVisible();

  await combo.evaluate((element) => element.setAttribute("error", "Could not load destinations."));
  await expect(input).toHaveAccessibleDescription("Could not load destinations.");
  await expect(root.locator(".uif-combo-box-state")).toHaveText("Could not load destinations.");
  await expect(root.locator(".uif-combo-box-error")).toHaveText("Could not load destinations.");

  await combo.evaluate((element) => element.setAttribute("readonly", ""));
  await expect(input).toHaveAttribute("readonly", "");
  await expect(input).toHaveAttribute("aria-readonly", "true");
  await combo.evaluate((element) => element.setAttribute("disabled", ""));
  await expect(input).toBeDisabled();
  await expect(hidden).toBeDisabled();
});

test("ComboBox keyboard dismissal, popup geometry, zoom and forced colors remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const root = await openPlayground(page);
  const input = root.getByRole("combobox", { name: "Destination" });
  const popup = root.locator(".uif-combo-box-popup");

  await input.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await expect(input).toHaveAttribute("aria-activedescendant", /option-3$/);
  await page.keyboard.press("Home");
  await expect(input).toHaveAttribute("aria-activedescendant", /option-0$/);
  await page.keyboard.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");

  await input.focus();
  await expect.poll(async () => popup.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= document.documentElement.clientWidth
      && rect.top >= 0 && rect.bottom <= document.documentElement.clientHeight;
  })).toBe(true);

  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.keyboard.press("ArrowDown");
  const active = root.locator(".uif-combo-box-option[data-active]");
  await expect(active).toHaveCSS("outline-style", "solid");
  await expect(active).toHaveCount(1);

  const results = await new AxeBuilder({ page }).include("#combo-box-playground-root").analyze();
  expect(results.violations).toEqual([]);
});

test("ComboBox closes on Tab and outside interaction without moving input focus during navigation", async ({ page }) => {
  const root = await openPlayground(page);
  const input = root.getByRole("combobox", { name: "Destination" });
  await input.focus();
  await page.keyboard.press("ArrowDown");
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toHaveAttribute("aria-expanded", "false");

  await input.focus();
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await expect(input).toHaveAttribute("aria-expanded", "false");
});
