import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nunjucks = require("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("site/_includes"));
const css = readFileSync("dist/main.css", "utf8").replace(/@import\s+url\([^)]*\)\s*;/g, "");
const content = env.renderString(`{% import "macros/ui.njk" as uif %}
<h1>Heading</h1><p>Body</p><div class="uif-illustrated-message-heading">Illustrated heading</div>
<div id="consumer" style="font-family:monospace;font-weight:500;line-height:1.7">
  {{ uif.button("Raw label") }}
  <button class="uif-button composed"><span class="uif-label-content"><span class="uif-label-content-text">Composed label</span></span></button>
  {{ uif.fieldLabel("Field", "field", true, "mail") }}
  {{ uif.badge("Badge", startIcon="mail") }}
  {{ uif.input(placeholder="Input", id="field") }}
  {{ uif.link("Link") }}
  <textarea class="uif-textarea">Consumer text</textarea>
</div>`);

async function metrics(page, selector) {
  return page.locator(selector).evaluate(element => {
    const style = getComputedStyle(element);
    return { family: style.fontFamily, weight: style.fontWeight, line: style.lineHeight };
  });
}

for (const mode of ["light", "dark"]) {
  test(`Brand typography applies the explicit A/B/C text roles (${mode})`, async ({ page }) => {
    await page.setContent(`<style>${css}</style>${content}`);
    for (const brand of ["a", "b", "c"]) {
      await page.evaluate(({ brand, mode }) => { document.documentElement.dataset.brand = brand; document.documentElement.dataset.mode = mode; }, { brand, mode });
      const legacyFamilies = await page.evaluate(() => ["sans", "serif", "mono"].map(name => getComputedStyle(document.documentElement).getPropertyValue(`--font-family-${name}`).trim()));
      expect(legacyFamilies).toEqual(["Inter", "Rokkitt", "SF Mono"]);
      const raw = await metrics(page, "#consumer > .uif-button:not(.composed)");
      const composed = await metrics(page, ".composed .uif-label-content-text");
      const label = await metrics(page, ".uif-field-label .uif-label-content-text");
      const badge = await metrics(page, ".uif-badge-text");
      const base = { a: /Inter/, b: /Exo 2/, c: /Manrope/ }[brand];
      expect(raw.family).toMatch(base);
      expect(raw.weight).toBe("600");
      for (const text of [composed, label, badge]) {
        expect(text.family).toMatch(base);
        expect(text.weight).toBe("600");
      }
      expect((await metrics(page, ".uif-field-label-required")).weight).toBe("700");
      expect((await metrics(page, ".uif-field-label .uif-icon")).weight).toBe("400");
      expect((await metrics(page, ".uif-input")).weight).toBe("600");
      expect((await metrics(page, ".uif-link")).weight).toBe("600");
      expect((await metrics(page, ".uif-textarea")).weight).toBe("500");
      expect((await metrics(page, "p")).weight).toBe("400");
      const heading = { a: /Roboto Slab/, b: /Orbitron/, c: /Bricolage Grotesque/ }[brand];
      expect((await metrics(page, "h1")).family).toMatch(heading);
      expect((await metrics(page, "h1")).weight).toBe(brand === "b" ? "800" : "700");
      expect((await metrics(page, ".uif-illustrated-message-heading")).family).toMatch(heading);
      expect((await metrics(page, ".uif-illustrated-message-heading")).weight).toBe(brand === "b" ? "800" : "700");
    }
    // A context must not activate its optional slots in a neutral nested Brand boundary.
    await page.evaluate(() => { document.documentElement.dataset.brand = "a"; document.querySelector("#consumer").dataset.brand = "neutral"; });
    expect((await metrics(page, "#consumer > .uif-button:not(.composed)")).weight).toBe("500");
    await page.evaluate(() => { delete document.documentElement.dataset.brand; delete document.querySelector("#consumer").dataset.brand; });
    expect((await metrics(page, "#consumer > .uif-button:not(.composed)")).weight).toBe("500");
  });
}

test("docs snapshots clear optional A slots across A→B→C→A while retaining authored geometry", async ({ page }) => {
  await page.goto("/patterns/button/");
  const preview = page.locator(".docs-hero-preview").first();
  const stage = preview.locator(".docs-hero-preview-stage");
  await stage.evaluate(element => { element.style.setProperty("min-width", "123px"); });
  for (const brand of ["a", "b", "c", "a"]) {
    await preview.locator(`[data-hero-brand="${brand}"]`).click();
    await expect(stage).toHaveAttribute("data-brand", brand);
    const text = await stage.locator(".uif-button").first().evaluate(element => getComputedStyle(element).fontWeight);
    expect(text).toBe("600");
    expect(await stage.evaluate(element => element.style.minWidth)).toBe("123px");
  }
});

test("legacy and concrete Basic overrides preserve A routing and the Mono role", async ({ page }) => {
  await page.setContent(`<style>${css}</style><h1>Heading</h1><p>Body</p>
    <div id="code-sample" style="font-family:var(--typography-code)">Code</div>
    <details class="uif-accordion-item" open><summary>Summary</summary><div class="uif-accordion-item-content">Content</div></details>
    <button class="uif-tab">Tab</button><div class="uif-tooltip">Tooltip</div><div class="uif-avatar">AB</div>`);
  for (const brand of ["a", "b", "c"]) {
    for (const mode of ["light", "dark"]) {
      for (const names of [["sans", "serif", "mono"], ["inter", "rokkitt", "sf-mono"]]) {
        await page.evaluate(({ brand, mode, names }) => {
          const root = document.documentElement;
          root.removeAttribute("style");
          root.dataset.brand = brand; root.dataset.mode = mode;
          for (const [index, value] of ["monospace", "sans-serif", "serif"].entries()) root.style.setProperty(`--font-family-${names[index]}`, value);
        }, { brand, mode, names });
        expect((await metrics(page, "h1")).family).toMatch({ a: /Roboto Slab/, b: /Orbitron/, c: /Bricolage Grotesque/ }[brand]);
        expect((await metrics(page, "p")).family).toMatch(brand === "a" ? /monospace/ : { b: /Exo 2/, c: /Manrope/ }[brand]);
        expect((await metrics(page, "#code-sample")).family).toBe("serif, monospace");
        for (const selector of [".uif-accordion-item > summary", ".uif-accordion-item-content", ".uif-tab", ".uif-tooltip", ".uif-avatar"]) expect((await metrics(page, selector)).family).toMatch(brand === "a" ? /monospace/ : { b: /Exo 2/, c: /Manrope/ }[brand]);
      }
    }
  }
});
