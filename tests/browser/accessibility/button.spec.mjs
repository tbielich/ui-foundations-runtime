import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { inventory, OUTPUT, axeOutcome, capture } from "../../../scripts/accessibility-evidence.mjs";

// Expectations are authored from the native button contract, never auto-updated.
for (const criterion of inventory.criteria.filter((c) => c.component === "button")) {
  test(criterion.id, async ({ page, browser }, info) => {
    const record = { ...criterion, status: "blocked", browser: browser.version(), scans: [], evidence: [] };
    try {
      await page.goto("/patterns/button/");
      await expect(page.locator("html")).toHaveAttribute("data-brand", "a");
      await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
      const enabled = page.locator(".docs-hero-preview-stage .uif-button");
      const disabled = page.locator(".docs-behavior-preview .uif-button[disabled]");
      if (criterion.id === "button.name") { await capture(record, enabled, "enabled"); await expect(enabled).toMatchAriaSnapshot('- button "Get started"'); }
      if (criterion.id === "button.disabled") {
        await capture(record, disabled, "disabled");
        await expect(disabled).toMatchAriaSnapshot('- button "Disabled" [disabled]');
        await expect(disabled).toBeDisabled();
      }
      if (criterion.id === "button.keyboard" || criterion.id === "button.inert") {
        await page.evaluate(() => { window.nativeClicks = 0; document.querySelectorAll(".docs-hero-preview-stage .uif-button, .docs-behavior-preview .uif-button[disabled]").forEach((b) => b.addEventListener("click", () => window.nativeClicks++)); });
        // Reach the real component by Tab, not locator.focus() or activation scripts.
        for (let i = 0; i < 100 && !(await enabled.evaluate((e) => e === document.activeElement)); i++) await page.keyboard.press("Tab");
        await expect(enabled).toBeFocused();
        if (criterion.id === "button.keyboard") {
          await page.keyboard.press("Enter"); await page.keyboard.press("Space");
          expect(await page.evaluate(() => window.nativeClicks)).toBe(2);
          await capture(record, enabled, "enabled", { tab: true, keys: ["Enter", "Space"], clicks: await page.evaluate(() => window.nativeClicks) });
        } else {
          const box = await disabled.boundingBox();
          expect(box).not.toBeNull();
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await page.keyboard.press("Enter"); await page.keyboard.press("Space");
          for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); await expect(disabled).not.toBeFocused(); }
          expect(await page.evaluate(() => window.nativeClicks)).toBe(0);
          await capture(record, disabled, "disabled", { tab: true, keys: ["Enter", "Space"], pointer: true, disabledSkipped: true, clicks: await page.evaluate(() => window.nativeClicks) });
        }
      }
      if (criterion.id === "button.axe") {
        for (const [state, selector] of [["enabled", ".docs-hero-preview-stage .uif-button"], ["disabled", ".docs-behavior-preview .uif-button[disabled]"]]) {
          await capture(record, page.locator(selector), state);
          const results = await new AxeBuilder({ page }).include(selector).analyze();
          record.scans.push({ state, selector, configuration: "default enabled rules; no exclusions", results });
        }
        record.status = axeOutcome(record.scans, criterion.states);
        expect(record.status).toBe("pass");
      }
      record.status = "pass";
    } catch (error) {
      if (criterion.method !== "axe-default" || record.status === "blocked") record.status = criterion.method === "axe-default" ? "blocked" : "fail";
      record.error = error.message;
      throw error;
    } finally {
      record.execution = { title: info.title, status: info.status, retry: info.retry };
      fs.mkdirSync(`${OUTPUT}/criteria`, { recursive: true });
      fs.writeFileSync(`${OUTPUT}/criteria/${criterion.id}.json`, JSON.stringify(record, null, 2));
    }
  });
}
