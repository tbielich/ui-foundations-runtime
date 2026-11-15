import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Deliberately isolated test-only markup; never inserted into production docs.
test("negative controls detect missing name/role and axe violations", async ({ page }, info) => {
  await page.setContent('<main><button></button><input type="checkbox"><div>Wrong role</div></main>');
  await expect(page.locator("div")).not.toHaveRole("button");
  await expect(page.locator("button")).not.toHaveAccessibleName("Get started");
  let rejected = false;
  try { await expect(page.locator("button")).toMatchAriaSnapshot('- button "Get started"', { timeout: 500 }); }
  catch { rejected = true; }
  expect(rejected).toBe(true);
  const results = await new AxeBuilder({ page }).include("main").analyze();
  expect(results.violations.some((v) => v.id === "button-name")).toBe(true);
  expect(results.violations.some((v) => v.id === "label")).toBe(true);
  await info.attach("negative-control-axe", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
});
