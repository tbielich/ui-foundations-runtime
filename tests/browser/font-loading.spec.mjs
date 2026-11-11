import { test, expect } from "@playwright/test";

const families = { a: ["Inter", "Roboto Slab"], b: ["Exo 2", "Orbitron"], c: ["Manrope", "Bricolage"] };
const normalize = value => value.replace(/[^a-z0-9]/gi, "").toLowerCase();

for (const mode of ["light", "dark"]) {
  for (const blocked of [false, true]) {
    test(`consumer-loaded docs fonts and ${blocked ? "Basic fallbacks" : "selected families"} (${mode})`, async ({ page, baseURL }) => {
      const external = [];
      const failed = [];
      page.on("request", request => {
        if (new URL(request.url()).origin !== new URL(baseURL).origin) external.push(request.url());
      });
      page.on("response", response => { if (response.status() >= 400) failed.push(response.url()); });
      if (blocked) await page.route(/\/(exo-2|orbitron|manrope|bricolage-grotesque|roboto-slab)-variable\.(?:woff2|ttf)$/, route => route.abort());
      for (const brand of ["a", "b", "c"]) {
        await page.route("**/__font-probe", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html data-brand="${brand}" data-mode="${mode}"><meta charset="utf-8"><link rel="stylesheet" href="/vendor/ui-foundations/main.css"><link rel="stylesheet" href="/assets/brand-fonts.css"><h1 id="heading">Future 0123</h1><p id="body">Klarheit ÄÖÜ äöü ß</p><button class="uif-button" id="button">Weiter</button><h2 id="glyph">ẞ</h2></html>` }));
        await page.goto(`${baseURL}/__font-probe`);
        await page.evaluate(() => document.fonts.ready);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
        const { root } = await cdp.send("DOM.getDocument");
        for (const [selector, family] of [["#heading", blocked ? (brand === "a" ? "Rokkitt" : "Inter") : families[brand][1]], ["#body", blocked ? "Inter" : families[brand][0]], ["#button", blocked ? "Inter" : families[brand][0]]]) {
          const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
          const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
          expect(fonts.length).toBeGreaterThan(0);
          expect(fonts.every(font => font.isCustomFont && normalize(font.familyName).includes(normalize(family))), `${brand}/${selector}: ${JSON.stringify(fonts)}`).toBe(true);
        }
        if (brand === "b") {
          const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: "#glyph" });
          const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
          expect(fonts.some(font => font.isCustomFont && /inter/i.test(font.familyName))).toBe(true);
        }
        await cdp.detach();
        await page.unroute("**/__font-probe");
      }
      expect(external).toEqual([]);
      expect(failed).toEqual([]);
    });
  }
}

test("Runtime CSS alone makes no font requests", async ({ page, baseURL }) => {
  const requests = [];
  page.on("request", request => { if (request.resourceType() === "font") requests.push(request.url()); });
  await page.route("**/__fontless-runtime", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html data-brand="b" data-mode="light"><meta charset="utf-8"><link rel="stylesheet" href="/vendor/ui-foundations/main.css"><h1>Heading</h1><p>Body</p><button class="uif-button">Continue</button></html>` }));
  await page.goto(`${baseURL}/__fontless-runtime`);
  await page.evaluate(() => document.fonts.ready);
  expect(requests).toEqual([]);
});
