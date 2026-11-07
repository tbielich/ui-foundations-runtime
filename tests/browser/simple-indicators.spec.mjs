import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

async function playground(page, name) {
  await page.goto(`/patterns/${name}-playground/`);
  await page.evaluate(async name => {
    await customElements.whenDefined(`uif-${name}`);
  }, name);
  return page.locator(`#${name}-playground-root`);
}

test("StatusLight preserves text across updates, label overrides and reconnects", async ({ page }) => {
  const root = await playground(page, "status-light");
  await expect(root.locator(".uif-status-light-text")).toHaveText("Status");
  const result = await root.evaluate(root => {
    const el = root.querySelector("uif-status-light");
    el.setAttribute("variant", "positive");
    el.setAttribute("size", "sm");
    el.setAttribute("label", 'A "quoted" <status>');
    const overridden = el.querySelector(".uif-status-light-text").textContent;
    el.removeAttribute("label");
    el.remove(); root.append(el);
    el.setAttribute("variant", "invalid");
    return { overridden, restored: el.textContent.trim(), roots: el.querySelectorAll(".uif-status-light").length, className: el.firstElementChild.className, hidden: el.querySelector(".uif-status-light-indicator").getAttribute("aria-hidden") };
  });
  expect(result).toEqual({ overridden: 'A "quoted" <status>', restored: "Status", roots: 1, className: "uif-status-light sm", hidden: "true" });
});

test("Meter exposes the same bounded value as its visual fill and custom spoken measurement", async ({ page }) => {
  const root = await playground(page, "meter");
  const result = await root.evaluate(root => {
    const el = root.querySelector("uif-meter");
    for (const [k, v] of Object.entries({ min: "10", max: "30", value: "20", label: 'A "quoted" <measurement>', "value-text": "10 GB remaining" })) el.setAttribute(k, v);
    const meter = el.querySelector("meter");
    const first = { value: meter.value, min: meter.min, max: meter.max, text: meter.getAttribute("aria-valuetext"), label: meter.getAttribute("aria-label"), width: el.querySelector(".uif-meter-fill").style.inlineSize };
    el.setAttribute("value", "999"); const clamped = el.querySelector("meter").value;
    el.setAttribute("max", "5"); const max = el.querySelector("meter").max;
    el.setAttribute("value", "Infinity"); const invalid = el.querySelector("meter").value;
    return { first, clamped, max, invalid, roots: el.querySelectorAll(".uif-meter").length };
  });
  expect(result).toEqual({ first: { value: 20, min: 10, max: 30, text: "10 GB remaining", label: 'A "quoted" <measurement>', width: "50%" }, clamped: 30, max: 11, invalid: 10, roots: 1 });
});

test("ProgressBar handles zero, boundaries, invalid values and changing modes without fabricated percentages", async ({ page }) => {
  const root = await playground(page, "progress-bar");
  await root.evaluate(root => {
    const el = root.querySelector("uif-progress-bar");
    el.setAttribute("value", "0"); el.setAttribute("show-value", "");
    el.setAttribute("label", 'A "quoted" <task>');
  });
  await expect(root.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(root.getByRole("progressbar")).toHaveAccessibleName('A "quoted" <task>');
  await expect(root.locator(".uif-progress-bar-value")).toHaveText("0%");
  for (const [input, output] of [["150", "100"], ["-10", "0"]]) {
    await root.locator("uif-progress-bar").evaluate((el, value) => el.setAttribute("value", value), input);
    await expect(root.getByRole("progressbar")).toHaveAttribute("aria-valuenow", output);
  }
  for (const input of ["", "invalid", "Infinity"]) {
    await root.locator("uif-progress-bar").evaluate((el, value) => el.setAttribute("value", value), input);
    await expect(root.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    await expect(root.locator(".uif-progress-bar-value")).toHaveCount(0);
  }
  await root.locator("uif-progress-bar").evaluate(el => { el.setAttribute("value", "40"); el.setAttribute("indeterminate", ""); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await root.locator(".uif-progress-bar-fill").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await root.locator("uif-progress-bar").evaluate(el => el.removeAttribute("indeterminate"));
  await expect(root.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
});

test("all three playgrounds wire controls into the actual exported elements", async ({ page }) => {
  for (const slug of ["status-light", "meter", "progress-bar"]) {
    const root = await playground(page, slug);
    const controls = page.locator(`#${slug}-playground-controls`);
    await controls.locator('[name="variant"]').selectOption("positive");
    await expect(root.locator(`.uif-${slug}`)).toHaveClass(/positive/);
    if (slug !== "status-light") {
      await controls.locator('[name="value"]').fill("0");
      await controls.locator('[name="value"]').dispatchEvent("input");
      if (slug === "meter") await expect(root.locator("meter")).toHaveAttribute("value", "0");
      else await expect(root.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    }
    await expect(root.locator(`.uif-${slug}`)).toHaveCount(1);
    await controls.locator('[name="scale"]').selectOption("small");
    const smallFont = await root.locator(`.uif-${slug}`).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    await controls.locator('[name="scale"]').selectOption("large");
    const largeFont = await root.locator(`.uif-${slug}`).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(largeFont).toBeGreaterThan(smallFont);
    await expect(root.locator('[data-scale="large"]')).toHaveCount(1);
  }
});

test("indicator text, dots and fills resolve with sufficient contrast in all six appearance contexts", async ({ page }) => {
  await playground(page, "meter");
  await page.evaluate(async () => { await import("/vendor/ui-foundations/elements/ui-status-light.js"); await import("/vendor/ui-foundations/elements/ui-progress-bar.js"); });
  await page.setContent(`<style>${readFileSync("dist/main.css", "utf8")}</style><body></body>`);
  const rows = await page.evaluate(() => {
    const lum = rgb => rgb.slice(0, 3).map(n => n / 255).reduce((sum, n, i) => sum + [0.2126, 0.7152, 0.0722][i] * (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4), 0);
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const ratio = (a, b) => {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = b; ctx.fillRect(0, 0, 1, 1); const bg = lum([...ctx.getImageData(0, 0, 1, 1).data]);
      ctx.fillStyle = a; ctx.fillRect(0, 0, 1, 1); const fg = lum([...ctx.getImageData(0, 0, 1, 1).data]);
      return (Math.max(bg, fg) + .05) / (Math.min(bg, fg) + .05);
    };
    // Root-scoped aliases resolve only when context is applied to the root.
    const host = document.createElement("div"); document.body.append(host);
    const rows = [];
    for (const brand of ["a", "b", "c"]) for (const mode of ["light", "dark"]) {
      document.documentElement.dataset.brand = brand; document.documentElement.dataset.mode = mode;
      host.style.background = "var(--uif-semantic-color-surface-default)";
      const surface = getComputedStyle(host).backgroundColor;
      for (const variant of ["neutral", "positive", "negative", "notice", "info"]) {
        host.innerHTML = `<uif-status-light variant="${variant}">Status</uif-status-light>`;
        const text = getComputedStyle(host.querySelector(".uif-status-light-text"));
        const dot = getComputedStyle(host.querySelector(".uif-status-light-indicator"));
        rows.push({ brand, mode, component: "status-light", variant, text: ratio(text.color, surface), graphic: ratio(dot.outlineColor, surface), boundaryWidth: dot.outlineWidth, size: dot.width });
      }
      for (const component of ["meter", "progress-bar"]) for (const variant of ["default", "positive", "negative"]) {
        host.innerHTML = `<uif-${component} value="50" label="Usage" variant="${variant}"></uif-${component}>`;
        const fill = getComputedStyle(host.querySelector(`.uif-${component}-fill`));
        const track = getComputedStyle(host.querySelector(`.uif-${component}-track`));
        const label = getComputedStyle(host.querySelector(`.uif-${component}-label`));
        rows.push({ brand, mode, component, variant, text: ratio(label.color, surface), graphic: ratio(fill.outlineColor, track.backgroundColor), boundaryWidth: fill.outlineWidth, size: track.height });
      }
    }
    host.remove(); return rows;
  });
  test.info().annotations.push({ type: "indicator-contrast", description: JSON.stringify(rows) });
  expect(rows).toHaveLength(66);
  for (const row of rows) {
    expect.soft(row.text, JSON.stringify(row)).toBeGreaterThanOrEqual(4.5);
    expect.soft(row.graphic, JSON.stringify(row)).toBeGreaterThanOrEqual(3);
    expect(parseFloat(row.boundaryWidth), JSON.stringify(row)).toBeGreaterThan(0);
    expect(parseFloat(row.size), JSON.stringify(row)).toBeGreaterThan(0);
  }
});
