import { test, expect } from "@playwright/test";

for (const mode of ["light", "dark"]) {
  test(`long Button labels fit a narrow container with reader text spacing (${mode})`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const brand of ["a", "b", "c"]) {
      await page.route("**/__spacing-probe", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html data-brand="${brand}" data-mode="${mode}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/vendor/ui-foundations/main.css"><style>* {line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}</style><button class="uif-button">Weiter zur Buchungsübersicht</button><button class="uif-button"><span class="uif-label-content"><span class="uif-label-content-text">Weiter zur Buchungsübersicht</span></span></button></html>` }));
      await page.goto(`${baseURL}/__spacing-probe`);
      await page.evaluate(() => document.fonts.ready);
      const sizes = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, buttons: [...document.querySelectorAll("button")].map(button => ({ right:button.getBoundingClientRect().right, width:button.clientWidth, scroll:button.scrollWidth })) }));
      expect(sizes.scroll, `${brand} document`).toBeLessThanOrEqual(sizes.width);
      for (const button of sizes.buttons) {
        expect(button.right).toBeLessThanOrEqual(sizes.width);
        expect(button.scroll).toBeLessThanOrEqual(button.width + 1);
      }
      await page.unroute("**/__spacing-probe");
    }
  });
}
