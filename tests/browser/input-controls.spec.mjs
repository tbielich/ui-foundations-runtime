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

const resetMacroMarkup = env.renderString(`
  {% import "macros/ui.njk" as uif %}
  <form id="macro-reset-form">
    {{ uif.searchField(id="macro-search", label="Macro search", value="") }}
    {{ uif.numberField(id="macro-number", label="Macro number", value=25, min=0, max=100, format="currency", locale="en") }}
    {{ uif.segmentedControl(label="Primary view", name="macro-primary-view", value="list", options=[{value: "list", label: "List"}, {value: "grid", label: "Grid"}]) }}
    {{ uif.segmentedControl(label="Secondary view", name="macro-secondary-view", value="list", options=[{value: "list", label: "List"}, {value: "grid", label: "Grid"}]) }}
    {{ uif.rangeSlider(id="macro-range", label="Macro range", min=0, max=100, lower=20, upper=80) }}
  </form>
`);

async function exerciseFormReset(page, root, prefix) {
  const search = root.getByRole("searchbox", { name: `${prefix} search` });
  const number = root.getByRole("spinbutton", { name: `${prefix} number` });
  const groups = root.locator(".uif-segmented-control");
  const primary = groups.nth(0);
  const secondary = groups.nth(1);
  const range = root.locator(".uif-range-slider");
  const lower = range.getByRole("slider", { name: "Minimum" });
  const upper = range.getByRole("slider", { name: "Maximum" });

  await search.fill("changed");
  await number.fill("75");
  await primary.getByRole("radio", { name: "Grid" }).check();
  await secondary.getByRole("radio", { name: "Grid" }).check();
  await expect(primary.getByRole("radio", { name: "Grid" })).toBeChecked();
  await upper.evaluate((input) => {
    input.value = "90";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await lower.evaluate((input) => {
    input.value = "85";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await number.focus();
  await root.locator("form").evaluate((form) => form.reset());

  await expect(search).toHaveValue("");
  await expect(root.locator(".uif-search-field-clear")).toBeDisabled();
  await expect(number).toHaveValue("25");
  await expect(number).toHaveAttribute("aria-valuetext", /25/);
  await expect(root.locator(".uif-number-field-formatted")).toContainText("25");
  await expect(number).toBeFocused();
  await expect(primary.getByRole("radio", { name: "List" })).toBeChecked();
  await expect(secondary.getByRole("radio", { name: "List" })).toBeChecked();
  await expect(lower).toHaveValue("20");
  await expect(upper).toHaveValue("80");
  await expect(lower).toHaveAttribute("max", "80");
  await expect(upper).toHaveAttribute("min", "20");
  await expect(lower).toHaveAttribute("aria-valuetext", "Minimum: 20");
  await expect(upper).toHaveAttribute("aria-valuetext", "Maximum: 80");
  await expect(range.locator(".uif-range-slider-output-lower")).toHaveText("20");
  await expect(range.locator(".uif-range-slider-output-upper")).toHaveText("80");
  await expect(range).toHaveCSS("--uif-range-slider-lower", "20%");
  await expect(range).toHaveCSS("--uif-range-slider-upper", "80%");
}

test("Macro input controls synchronize derived state after native form reset", async ({ page }) => {
  await page.goto("/patterns/search-field/");
  const root = page.locator("#reset-test-root");
  await page.locator("body").evaluate((body, markup) => {
    const container = document.createElement("div");
    container.id = "reset-test-root";
    container.innerHTML = markup;
    body.append(container);
  }, resetMacroMarkup);
  await exerciseFormReset(page, root, "Macro");
});

test("Custom Element input controls restore native defaults after form reset", async ({ page }) => {
  await page.goto("/patterns/search-field/");
  await page.evaluate(async () => Promise.all([
    import("/vendor/ui-foundations/elements/ui-search-field.js"),
    import("/vendor/ui-foundations/elements/ui-number-field.js"),
    import("/vendor/ui-foundations/elements/ui-segmented-control.js"),
    import("/vendor/ui-foundations/elements/ui-range-slider.js"),
  ]));
  const root = page.locator("#reset-test-root");
  await page.locator("body").evaluate((body) => {
    const container = document.createElement("div");
    container.id = "reset-test-root";
    container.innerHTML = `
      <form id="element-reset-form">
        <uif-search-field label="Element search" value=""></uif-search-field>
        <uif-number-field label="Element number" value="25" min="0" max="100" format="currency" locale="en"></uif-number-field>
        <uif-segmented-control label="Primary view" name="element-primary-view" value="list">
          <span data-value="list" data-label="List"></span><span data-value="grid" data-label="Grid"></span>
        </uif-segmented-control>
        <uif-segmented-control label="Secondary view" name="element-secondary-view" value="list">
          <span data-value="list" data-label="List"></span><span data-value="grid" data-label="Grid"></span>
        </uif-segmented-control>
        <uif-range-slider label="Element range" min="0" max="100" lower="20" upper="80"></uif-range-slider>
      </form>`;
    body.append(container);
  });
  await exerciseFormReset(page, root, "Element");
  await expect(root.locator("uif-search-field")).toHaveAttribute("value", "");
  await expect(root.locator("uif-number-field")).toHaveAttribute("value", "25");
  await expect(root.locator("uif-segmented-control").nth(0)).toHaveAttribute("value", "list");
  await expect(root.locator("uif-segmented-control").nth(1)).toHaveAttribute("value", "list");
  await expect(root.locator("uif-range-slider")).toHaveAttribute("lower", "20");
  await expect(root.locator("uif-range-slider")).toHaveAttribute("upper", "80");
});

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

test("Macro input controls support keyboard, pointer, events, and non-live values", async ({ page }) => {
  await page.goto("/patterns/search-field/");
  const searchField = page.locator(".docs-hero .uif-search-field");
  const searchInput = searchField.getByRole("searchbox", { name: "Search holidays" });
  const clear = searchField.getByRole("button", { name: "Clear Search holidays" });
  const clearControl = searchField.locator(".uif-search-field-clear");
  await searchField.evaluate((field) => {
    window.__macroSearchEvents = [];
    const input = field.querySelector("input");
    input.addEventListener("input", () => window.__macroSearchEvents.push("input"));
    input.addEventListener("change", () => window.__macroSearchEvents.push("change"));
  });
  await clear.focus();
  await page.keyboard.press("Enter");
  await expect(searchInput).toHaveValue("");
  await expect(searchInput).toBeFocused();
  await expect(clearControl).toBeDisabled();
  await expect.poll(() => page.evaluate(() => window.__macroSearchEvents)).toEqual(["input", "change"]);

  await page.goto("/patterns/number-field/");
  const numberField = page.locator(".docs-hero .uif-number-field");
  const numberInput = numberField.getByRole("spinbutton", { name: "Holiday budget" });
  const increase = numberField.getByRole("button", { name: "Increase Holiday budget" });
  await numberField.evaluate((field) => {
    window.__macroNumberEvents = [];
    const input = field.querySelector("input");
    input.addEventListener("input", () => window.__macroNumberEvents.push("input"));
    input.addEventListener("change", () => window.__macroNumberEvents.push("change"));
    field.addEventListener("uif-change", (event) => window.__macroNumberEvents.push(event.detail.value));
  });
  await increase.click();
  await expect(numberInput).toHaveValue("550");
  await expect(numberField.locator(".uif-number-field-formatted")).toHaveText("550");
  await expect(numberInput).toHaveAttribute("aria-valuetext", "550");
  await expect.poll(() => page.evaluate(() => window.__macroNumberEvents)).toEqual(["input", "change", 550]);
  await expect(numberField.getByRole("status")).toHaveCount(0);
  await numberInput.evaluate((input) => { input.readOnly = true; });
  await increase.click();
  await expect(numberInput).toHaveValue("550");

  await page.goto("/patterns/range-slider/");
  const range = page.locator(".docs-hero .uif-range-slider");
  const lower = range.getByRole("slider", { name: "Minimum" });
  const upper = range.getByRole("slider", { name: "Maximum" });
  await range.evaluate((field) => {
    window.__macroRangeChanges = [];
    field.addEventListener("uif-change", (event) => window.__macroRangeChanges.push(event.detail));
  });
  await lower.focus();
  await page.keyboard.press("End");
  await expect(lower).toHaveValue("1200");
  await expect(upper).toHaveAttribute("min", "1200");
  await expect(range.locator(".uif-range-slider-output-lower")).toHaveText("1200");
  await expect(lower).toHaveAttribute("aria-valuetext", "Minimum: 1200");
  await expect(range).toHaveCSS("--uif-range-slider-lower", "60%");
  await expect(range.getByRole("status")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__macroRangeChanges.length)).toBeGreaterThan(0);
});

test("Number Field clamps steps and keeps formatted speech separate", async ({ page }) => {
  const root = await openPlayground(page, "number-field");
  await page.evaluate(() => import("/vendor/ui-foundations/components/input-controls.js"));
  await root.evaluate((container) => {
    const field = container.querySelector("uif-number-field");
    field.setAttribute("max", "600");
    window.__numberChanges = [];
    field.addEventListener("uif-change", (event) => window.__numberChanges.push(event.detail.value));
  });
  const input = root.getByRole("spinbutton", { name: "Holiday budget" });
  const increase = root.getByRole("button", { name: "Increase Holiday budget" });
  await increase.click();
  await expect(input).toHaveValue("550");
  await increase.click();
  await expect(input).toHaveValue("600");
  await expect(input).toHaveAttribute("aria-valuetext", /.+/);
  await expect(root.locator(".uif-number-field-formatted")).not.toHaveText("600");
  await expect(root.locator("uif-number-field").getByRole("status")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__numberChanges)).toEqual([550, 600]);
  await input.focus();
  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveValue("550");
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

test("Input controls preserve live values and focus across state renders", async ({ page }) => {
  let root = await openPlayground(page, "search-field");
  const search = root.getByRole("searchbox", { name: "Search holidays" });
  await search.fill("Tenerife");
  await search.evaluate((input) => input.setSelectionRange(2, 6));
  await root.locator("uif-search-field").evaluate((element) => element.setAttribute("quiet", ""));
  await expect(search).toHaveValue("Tenerife");
  await expect(search).toBeFocused();
  await expect.poll(() => search.evaluate((input) => [input.selectionStart, input.selectionEnd])).toEqual([2, 6]);

  root = await openPlayground(page, "number-field");
  const number = root.getByRole("spinbutton", { name: "Holiday budget" });
  await number.fill("475");
  await root.locator("uif-number-field").evaluate((element) => {
    element.setAttribute("invalid", "");
    element.setAttribute("error", "Check this amount");
    element.setAttribute("readonly", "");
  });
  await expect(number).toHaveValue("475");
  await expect(number).toBeFocused();

  root = await openPlayground(page, "range-slider");
  const lower = root.getByRole("slider", { name: "Minimum" });
  const upper = root.getByRole("slider", { name: "Maximum" });
  await lower.focus();
  await page.keyboard.press("ArrowRight");
  await expect(lower).toHaveValue("350");
  await root.locator("uif-range-slider").evaluate((element) => element.setAttribute("invalid", ""));
  await expect(lower).toHaveValue("350");
  await expect(lower).toBeFocused();

  await upper.focus();
  await root.locator("uif-range-slider").evaluate((element) => element.setAttribute("error", "Check this range"));
  await expect(upper).toHaveValue("1200");
  await expect(upper).toBeFocused();
});

test("Segmented Control resolves enabled fallbacks across static and dynamic states", async ({ page }) => {
  const root = await openPlayground(page, "segmented-control");
  const state = await root.evaluate((container) => {
    const createControl = (id, value, options) => {
      const control = document.createElement("uif-segmented-control");
      control.id = id;
      if (value !== null) control.setAttribute("value", value);
      for (const option of options) {
        const item = document.createElement("span");
        item.dataset.value = option.value;
        item.dataset.label = option.label;
        item.toggleAttribute("data-disabled", Boolean(option.disabled));
        control.append(item);
      }
      container.append(control);
      return control;
    };
    const enabled = [
      { value: "list", label: "List" },
      { value: "grid", label: "Grid" },
    ];
    const controls = {
      unknown: createControl("segments-unknown", "unknown", enabled),
      missing: createControl("segments-missing", null, enabled),
      disabledTarget: createControl("segments-disabled-target", "grid", [enabled[0], { ...enabled[1], disabled: true }]),
      firstDisabled: createControl("segments-first-disabled", null, [{ ...enabled[0], disabled: true }, enabled[1]]),
      allDisabled: createControl("segments-all-disabled", "grid", enabled.map((option) => ({ ...option, disabled: true }))),
      empty: createControl("segments-empty", null, []),
    };
    const selected = (control) => control.querySelector("input:checked")?.value ?? "";

    const dynamic = createControl("segments-dynamic", "grid", enabled);
    dynamic.options = dynamic.options.map((option) => option.value === "list" ? { ...option, disabled: true } : option);
    const keptSelection = selected(dynamic);
    dynamic.options = dynamic.options.map((option) => ({ ...option, disabled: option.value === "grid" }));
    const fallbackSelection = selected(dynamic);
    dynamic.setAttribute("disabled", "");
    const disabledSelection = selected(dynamic);
    const groupDisabled = dynamic.querySelector("fieldset").disabled;
    dynamic.removeAttribute("disabled");

    return {
      unknown: selected(controls.unknown),
      missing: selected(controls.missing),
      disabledTarget: selected(controls.disabledTarget),
      firstDisabled: selected(controls.firstDisabled),
      allDisabled: selected(controls.allDisabled),
      allDisabledValue: controls.allDisabled.getAttribute("value"),
      empty: selected(controls.empty),
      keptSelection,
      fallbackSelection,
      disabledSelection,
      enabledAgainSelection: selected(dynamic),
      groupDisabled,
    };
  });

  expect(state).toEqual({
    unknown: "list",
    missing: "list",
    disabledTarget: "list",
    firstDisabled: "grid",
    allDisabled: "",
    allDisabledValue: null,
    empty: "",
    keptSelection: "grid",
    fallbackSelection: "list",
    disabledSelection: "list",
    enabledAgainSelection: "list",
    groupDisabled: true,
  });
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
  await expect(root.locator("uif-range-slider").getByRole("status")).toHaveCount(0);
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
  await expect(number).toHaveAttribute("aria-describedby", /-error$/);
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
