import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { scaleRatios } from "../../scripts/scale-context.mjs";
const ratios = scaleRatios(JSON.parse(readFileSync("figma/exports/Core (Primitives).tokens.json")));

async function setup(page) {
  await page.goto("/patterns/meter-playground/");
  await page.evaluate(async () => {
    await import("/vendor/ui-foundations/elements/ui-meter.js");
    await import("/vendor/ui-foundations/elements/ui-status-light.js");
    await import("/vendor/ui-foundations/elements/ui-progress-bar.js");
  });
  await page.setContent(`<style>${readFileSync("dist/main.css", "utf8")}</style><body></body>`);
  await page.evaluate(() => {
    document.documentElement.dataset.brand = "a";
    document.documentElement.dataset.mode = "light";
    const components = `<uif-status-light label="Online"></uif-status-light><uif-meter value="50" label="Storage"></uif-meter><uif-progress-bar value="50" label="Uploading"></uif-progress-bar>`;
    const localSmall = components.replaceAll(' value=', ' size="sm" value=').replace('label="Online"','size="sm" label="Online"');
    document.body.innerHTML = `<div id="default">${components}</div><div id="small" data-scale="small">${components}</div><div id="large" data-scale="large">${components}<div id="local-small">${localSmall}</div><div id="nested" data-scale="small">${components}</div><div id="medium" data-scale="medium">${components}</div><div id="unknown" data-scale="unknown">${components}</div></div><div id="sibling">${components}</div>`;
  });
}

async function metrics(page, id) {
  return page.locator(`#${id}`).evaluate(container => {
    const result = {};
    for (const name of ["status-light", "meter", "progress-bar"]) {
      const host = container.querySelector(`uif-${name}`);
      const root = host.querySelector(`.uif-${name}`);
      const text = host.querySelector(name === "status-light" ? ".uif-status-light-text" : `.uif-${name}-label`);
      const geometry = host.querySelector(name === "status-light" ? ".uif-status-light-indicator" : `.uif-${name}-track`);
      const style = getComputedStyle(root), textStyle = getComputedStyle(text), shape = getComputedStyle(geometry);
      result[name] = { font: parseFloat(textStyle.fontSize), line: parseFloat(textStyle.lineHeight), gap: parseFloat(style.gap), radius: parseFloat(shape.borderTopLeftRadius), geometry: parseFloat(shape.height), border: parseFloat(getComputedStyle(host.querySelector(name === "status-light" ? ".uif-status-light-indicator" : `.uif-${name}-fill`)).outlineWidth) };
    }
    return result;
  });
}

test("container scales inherited typography, line height, spacing and radii without scaling track height or borders", async ({ page }) => {
  await setup(page);
  const baseline = await metrics(page, "default");
  for (const scale of ["small", "large"]) {
    const actual = await metrics(page, scale);
    for (const name of Object.keys(actual)) {
      for (const key of ["font", "line", "gap"]) expect(actual[name][key] / baseline[name][key], `${scale}/${name}/${key}`).toBeCloseTo(ratios[scale], 2);
      if (name !== "status-light") expect(actual[name].radius / baseline[name].radius).toBeCloseTo(ratios[scale], 2);
      expect(actual[name].geometry).toBe(baseline[name].geometry);
      expect(actual[name].border).toBe(baseline[name].border);
    }
  }
  expect(await metrics(page, "sibling")).toEqual(baseline);
});

test("local small remains relative, nested context replaces its parent and changes apply without rerender", async ({ page }) => {
  await setup(page);
  const baseline = await metrics(page, "default"), large = await metrics(page, "large"), small = await metrics(page, "small");
  const local = await metrics(page, "local-small");
  for (const name of Object.keys(local)) {
    expect(local[name].font / large[name].font).toBeCloseTo(ratios.small, 2);
    expect(local[name].line / large[name].line).toBeCloseTo(ratios.small, 2);
    expect(local[name].gap / large[name].gap).toBeCloseTo(ratios.small, 2);
  }
  expect(await metrics(page, "nested")).toEqual(small);
  expect(await metrics(page, "medium")).toEqual(baseline);
  expect(await metrics(page, "unknown")).toEqual(large);
  await page.locator("#large").evaluate(container => {
    window.scaleTestRoot = container.querySelector(".uif-meter");
    container.dataset.scale = "small";
  });
  expect(await metrics(page, "large")).toEqual(small);
  expect(await page.evaluate(() => window.scaleTestRoot === document.querySelector("#large .uif-meter"))).toBe(true);
});

test("relative scaling preserves the reader's root font size", async ({ page }) => {
  await setup(page);
  const before = await metrics(page, "large");
  await page.evaluate(() => { document.documentElement.style.fontSize = "20px"; });
  const after = await metrics(page, "large");
  for (const name of Object.keys(before)) {
    expect(after[name].font / before[name].font).toBeCloseTo(20 / 16, 2);
    expect(after[name].line / before[name].line).toBeCloseTo(20 / 16, 2);
    expect(after[name].gap / before[name].gap).toBeCloseTo(20 / 16, 2);
  }
});


test("static macros inherit container scale without Custom Element JavaScript", async ({ page }) => {
  const require = createRequire(import.meta.url);
  const nunjucks = require("nunjucks");
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"));
  const content = env.renderString(`{% import "macros/ui.njk" as uif %}
    <div id="static-small" data-scale="small">{{ uif.statusLight("Online") }}{{ uif.meter(label="Storage", value=50) }}{{ uif.progressBar(label="Uploading", value=50) }}</div>
    <div id="static-large" data-scale="large">{{ uif.statusLight("Online") }}{{ uif.meter(label="Storage", value=50) }}{{ uif.progressBar(label="Uploading", value=50) }}</div>`);
  await page.setContent(`<style>${readFileSync("dist/main.css", "utf8")}</style><body>${content}</body>`);
  await page.evaluate(() => { document.documentElement.dataset.brand = "a"; document.documentElement.dataset.mode = "light"; });
  for (const name of ["status-light", "meter", "progress-bar"]) {
    const small = await page.locator(`#static-small .uif-${name}`).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    const large = await page.locator(`#static-large .uif-${name}`).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(large / small).toBeCloseTo(ratios.large / ratios.small, 2);
  }
});
