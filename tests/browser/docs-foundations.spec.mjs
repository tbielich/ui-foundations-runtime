import { test, expect } from "@playwright/test";
import fs from "node:fs";

const headerRules = fs.readFileSync(new URL("../../site/_headers", import.meta.url), "utf8")
  .trim().split(/\n\s*\n/).map(block => {
    const [path, ...lines] = block.split("\n");
    const headers = Object.fromEntries(lines.map(line => {
      const colon = line.indexOf(":");
      return [line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim()];
    }));
    return { path, headers };
  });
const previewHeaders = headerRules.find(rule => rule.path === "/base/preview/*").headers;
const defaultHeaders = headerRules.find(rule => rule.path === "/*").headers;

test("Base preview embeds under its shipped headers while external embedding stays blocked", async ({ page }) => {
  // The local static server does not apply Netlify's _headers. Inject the
  // actual path-specific policy into the response to exercise Chromium's gate.
  await page.route("**/base/preview/", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), ...previewHeaders } });
  });
  expect(defaultHeaders["x-frame-options"]).toBe("DENY");
  expect(defaultHeaders["content-security-policy"]).toContain("frame-ancestors 'none'");
  for (const key of ["x-content-type-options", "referrer-policy", "permissions-policy"]) {
    expect(previewHeaders[key]).toBe(defaultHeaders[key]);
  }
  await page.goto("/base/");
  await expect(page.frameLocator('iframe[title="UIF Base native preview"]').locator("#base-button > button")).toBeVisible();
  const previewUrl = new URL("/base/preview/", page.url()).href;
  await page.route("http://external.test/", route => route.fulfill({
    contentType: "text/html", body: `<iframe src="${previewUrl}"></iframe>`,
  }));
  const blocked = page.waitForEvent("console", message => /frame-ancestors|X-Frame-Options/i.test(message.text()));
  await page.goto("http://external.test/");
  await blocked;
  await expect(page.frameLocator("iframe").locator("#base-button > button")).toHaveCount(0);
});

test("Foundations has four entry points with Base under Theming", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/base/");
  const nav = page.getByRole("navigation", { name: "Foundations", exact: true });
  const roots = nav.locator(":scope > details > ul > li");
  await expect(roots).toHaveCount(4);
  await expect(roots.nth(0)).toHaveText("System Overview");
  await expect(roots.nth(1).locator("summary")).toHaveText("Design Tokens");
  await expect(roots.nth(2).locator("summary")).toHaveText("Theming");
  await expect(roots.nth(3).locator("summary")).toHaveText("Guidelines");
  await expect(roots.nth(2).getByRole("link", { name: "Base — Native UI" })).toHaveAttribute("aria-current", "page");
  await page.goto("/getting-started/");
  await expect(page.locator("#start-a-vanilla-app-with-vite")).toBeVisible();
  await expect(page.locator('.docs-content a[href="/foundations/class-naming/"]')).toBeVisible();
});

for (const route of ["architecture", "accessibility", "theming", "content", "internationalization", "class-naming", "design-tokens", "base"]) {
  test(`Foundations ${route} has working section navigation on desktop and mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route === "base" ? "/base/" : `/foundations/${route}/`);
    const toc = page.getByRole("navigation", { name: "On this page", exact: true });
    await expect(toc).toBeVisible();
    const links = toc.getByRole("link");
    expect(await links.count()).toBeGreaterThanOrEqual(2);
    for (const href of await links.evaluateAll(items => items.map(item => item.getAttribute("href")))) {
      expect(await page.locator(href).count()).toBe(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const disclosure = page.locator(".docs-toc-mobile");
    await disclosure.locator("summary").click();
    await expect(toc).toBeVisible();
    const href = await links.last().getAttribute("href");
    await links.last().click();
    expect(new URL(page.url()).hash).toBe(href);
    await expect(toc).not.toBeVisible();
  });
}
