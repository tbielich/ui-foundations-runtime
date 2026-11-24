import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"), { autoescape: false });
const renderNumberField = (context) => env.renderString(
  '{% import "macros/ui.njk" as uif %}{{ uif.numberField(id="ssr-number", value=value, min=min, max=max, step=step, format=format, currency=currency, locale=locale) }}',
  context,
);

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

test("Number Field macro and element keep normalized Intl output consistent", async ({ page }) => {
  const root = await openPlayground(page, "number-field");
  const cases = [
    { value: "1234.5", min: "000", max: "2000.00", step: "000.5", format: "decimal", currency: "EUR", locale: "de-DE" },
    { value: "1234.5", min: "", max: "", step: "1", format: "currency", currency: "eur", locale: "de-DE" },
    { value: "25", min: "0", max: "100", step: "1", format: "percent", currency: "EUR", locale: "de-DE" },
    { value: "1234.5", min: "", max: "", step: "1", format: "decimal", currency: "EUR", locale: "" },
    { value: "1234.5", min: "", max: "", step: "1", format: "decimal", currency: "EUR", locale: "de_DE" },
    { value: "invalid", min: "bad", max: "Infinity", step: "0", format: "decimal", currency: "EUR", locale: "en" },
  ];

  for (const attributes of cases) {
    const html = renderNumberField(attributes);
    const comparison = await root.evaluate((container, { markup, elementAttributes }) => {
      const server = document.createElement("div");
      server.innerHTML = markup;
      const client = document.createElement("uif-number-field");
      client.id = "client-number";
      for (const [name, value] of Object.entries(elementAttributes)) client.setAttribute(name, value);
      server.append(client);
      container.replaceChildren(server);
      const inputs = server.querySelectorAll("input[type=number]");
      const outputs = server.querySelectorAll(".uif-number-field-formatted");
      const state = (input, output) => ({
        value: input.value,
        min: input.min,
        max: input.max,
        step: input.step,
        formatted: output.textContent,
        valueText: input.getAttribute("aria-valuetext"),
      });
      return {
        server: state(inputs[0], outputs[0]),
        client: state(inputs[1], outputs[1]),
      };
    }, { markup: html, elementAttributes: attributes });
    expect(comparison.client).toEqual(comparison.server);
  }
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

test("Range Slider lets pointer users reopen overlapping thumbs in either direction", async ({ page }) => {
  const root = await openPlayground(page, "range-slider");
  await root.evaluate((container) => {
    const element = document.createElement("uif-range-slider");
    element.id = "overlap-range";
    element.setAttribute("min", "0");
    element.setAttribute("max", "10");
    element.setAttribute("step", "1");
    element.setAttribute("lower", "5");
    element.setAttribute("upper", "5");
    container.replaceChildren(element);
  });

  const slider = root.locator("uif-range-slider");
  const fieldset = slider.locator(".uif-range-slider");
  const lower = slider.getByRole("slider", { name: "Minimum" });
  const upper = slider.getByRole("slider", { name: "Maximum" });
  const lowerLabel = slider.getByText("Minimum", { exact: true });
  const upperLabel = slider.getByText("Maximum", { exact: true });

  const dragThumb = async (input, delta) => {
    const box = await input.boundingBox();
    const state = await input.evaluate((element) => ({
      min: Number(element.min),
      max: Number(element.max),
      value: Number(element.value),
    }));
    const ratio = state.max === state.min ? 0 : (state.value - state.min) / (state.max - state.min);
    const thumbRadius = 12;
    const x = box.x + thumbRadius + ratio * Math.max(0, box.width - thumbRadius * 2);
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + delta, y, { steps: 5 });
    await page.mouse.up();
  };

  await lowerLabel.click();
  await expect(lower).toBeFocused();
  await expect(fieldset).toHaveAttribute("data-active-thumb", "lower");
  await dragThumb(lower, -60);
  await expect.poll(async () => Number(await lower.inputValue())).toBeLessThan(5);
  await expect(upper).toHaveValue("5");

  await slider.evaluate((element) => {
    element.setAttribute("lower", "5");
    element.setAttribute("upper", "5");
  });
  await upperLabel.click();
  await expect(upper).toBeFocused();
  await expect(fieldset).toHaveAttribute("data-active-thumb", "upper");
  await dragThumb(upper, 60);
  await expect.poll(async () => Number(await upper.inputValue())).toBeGreaterThan(5);
  await expect(lower).toHaveValue("5");

  await slider.evaluate((element) => {
    element.setAttribute("lower", "4");
    element.setAttribute("upper", "5");
  });
  await lowerLabel.click();
  await expect(fieldset).toHaveAttribute("data-active-thumb", "lower");
  await upperLabel.click();
  await expect(fieldset).toHaveAttribute("data-active-thumb", "upper");
  await expect(lower).toHaveAttribute("max", "5");
  await expect(upper).toHaveAttribute("min", "4");
});

test("Range Slider applies defaults to missing, empty, and invalid numbers", async ({ page }) => {
  const root = await openPlayground(page, "range-slider");
  const states = await root.evaluate((container) => {
    const cases = [
      {},
      { min: "", max: "", step: "", lower: "", upper: "" },
      { min: "bad", max: "Infinity", step: "bad", lower: "NaN", upper: "-Infinity" },
      { step: "0" },
    ];
    return cases.map((attributes) => {
      const element = document.createElement("uif-range-slider");
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      container.append(element);
      const [lower, upper] = element.querySelectorAll("input[type=range]");
      return {
        lower: { min: lower.min, max: lower.max, step: lower.step, value: lower.value },
        upper: { min: upper.min, max: upper.max, step: upper.step, value: upper.value },
      };
    });
  });
  for (const state of states) {
    expect(state).toEqual({
      lower: { min: "0", max: "100", step: "1", value: "0" },
      upper: { min: "0", max: "100", step: "1", value: "100" },
    });
  }
});

test("Range Slider visually identifies each focused thumb in forced colors", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ forcedColors: "active" });
  const root = await openPlayground(page, "range-slider");
  const lower = root.getByRole("slider", { name: "Minimum" });
  const upper = root.getByRole("slider", { name: "Maximum" });
  const track = root.locator(".uif-range-slider-track");

  await lower.focus();
  await expect(lower).toBeFocused();
  const lowerFocused = await track.screenshot({ animations: "disabled" });
  await upper.focus();
  await expect(upper).toBeFocused();
  const upperFocused = await track.screenshot({ animations: "disabled" });

  expect(lowerFocused.equals(upperFocused)).toBe(false);
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
