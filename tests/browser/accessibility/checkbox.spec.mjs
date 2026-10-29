import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { inventory, OUTPUT, axeOutcome, capture } from "../../../scripts/accessibility-evidence.mjs";

// Small native-role/name/state contracts reviewed against the required inventory.
for (const criterion of inventory.criteria.filter((c) => c.component === "checkbox")) {
  test(criterion.id, async ({ page, browser }, info) => {
    const record = { ...criterion, status: "blocked", browser: browser.version(), scans: [], evidence: [] };
    try {
      await page.goto("/patterns/checkbox/");
      await expect(page.locator("html")).toHaveAttribute("data-brand", "a");
      await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
      const label = page.locator(".docs-behavior-preview .uif-checkbox-field").filter({ hasText: "Toggle me" });
      const control = label.locator("input");
      const mixed = page.locator('.docs-states-grid input[data-indeterminate]').first();
      const disabled = page.locator(".docs-states-grid input[disabled]").first();
      if (criterion.id === "checkbox.name") { await capture(record, control, "unchecked"); await expect(control).toMatchAriaSnapshot('- checkbox "Toggle me"'); }
      if (criterion.id === "checkbox.checked") {
        await expect(control).not.toBeChecked();
        await capture(record, control, "unchecked");
        await label.click(); await expect(control).toBeChecked();
        await capture(record, control, "checked", { pointer: true });
        await expect(control).toMatchAriaSnapshot('- checkbox "Toggle me" [checked]');
        await label.click(); await expect(control).not.toBeChecked();
        await expect(control).toMatchAriaSnapshot('- checkbox "Toggle me"');
      }
      if (criterion.id === "checkbox.mixed-disabled") {
        await capture(record, mixed, "mixed");
        await capture(record, disabled, "disabled");
        await expect(mixed).toMatchAriaSnapshot('- checkbox "Default" [checked=mixed]');
        await expect(disabled).toMatchAriaSnapshot('- checkbox "Disabled" [disabled]');
        await expect(disabled).toBeDisabled();
        expect(await mixed.evaluate((e) => e.indeterminate)).toBe(true);
        await mixed.locator("..").click();
        await expect(mixed).toBeChecked();
        expect(await mixed.evaluate((e) => e.indeterminate)).toBe(false);
        await expect(mixed).not.toHaveClass(/is-indeterminate/);
        await expect(mixed).toMatchAriaSnapshot('- checkbox "Default" [checked]');
        await capture(record, mixed, "mixed-to-checked", { pointer: true });
        await page.keyboard.press("Space");
        await expect(mixed).not.toBeChecked();
        await expect(mixed).toMatchAriaSnapshot('- checkbox "Default"');
        await capture(record, mixed, "mixed-to-unchecked", { keys: ["Space"] });
        // Disabled checked and disabled mixed macro examples must remain inert too.
        const disabledExamples = page.locator(".docs-states-grid input[disabled]");
        for (const input of await disabledExamples.all()) {
          const before = await input.evaluate((e) => ({ checked: e.checked, indeterminate: e.indeterminate }));
          const box = await input.locator("..").boundingBox();
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          expect(await input.evaluate((e) => ({ checked: e.checked, indeterminate: e.indeterminate }))).toEqual(before);
          await capture(record, input, "disabled-additional", { pointer: true });
        }
      }
      if (criterion.id === "checkbox.keyboard" || criterion.id === "checkbox.inert") {
        for (let i = 0; i < 100 && !(await control.evaluate((e) => e === document.activeElement)); i++) await page.keyboard.press("Tab");
        await expect(control).toBeFocused();
        if (criterion.id === "checkbox.keyboard") {
          await capture(record, control, "unchecked", { tab: true });
          await page.keyboard.press("Space"); await expect(control).toBeChecked();
          await capture(record, control, "checked", { tab: true, keys: ["Space"] });
          await expect(control).toMatchAriaSnapshot('- checkbox "Toggle me" [checked]');
          await page.keyboard.press("Space"); await expect(control).not.toBeChecked();
        } else {
          const box = await disabled.locator("..").boundingBox();
          expect(box).not.toBeNull();
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await page.keyboard.press("Space"); await expect(disabled).not.toBeChecked();
          for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); await expect(disabled).not.toBeFocused(); }
          await expect(disabled).not.toBeChecked();
          await capture(record, disabled, "disabled", { tab: true, keys: ["Space"], pointer: true, disabledSkipped: true });
        }
      }
      if (criterion.id === "checkbox.axe") {
        const scans = [["unchecked", label], ["checked", label], ["mixed", mixed.locator("..")], ["disabled", disabled.locator("..")]];
        for (const [state, target] of scans) {
          if (state === "checked") { await label.click(); await expect(control).toBeChecked(); }
          const selector = state === "mixed" ? '.docs-states-grid .uif-checkbox-field:has(input[data-indeterminate]):nth-of-type(1)' : state === "disabled" ? '.docs-states-grid-item:has(input[disabled]) >> label' : '.docs-behavior-preview .uif-checkbox-field';
          // Exact existing label boundary via unique temporary data attribute; no behavior change.
          await target.evaluate((e) => e.setAttribute("data-a11y-scan", "target"));
          await capture(record, target, state);
          const results = await new AxeBuilder({ page }).include('[data-a11y-scan="target"]').analyze();
          record.scans.push({ state, selector, boundary: "actual existing checkbox and associated label", configuration: "default enabled rules; no exclusions", results });
          await target.evaluate((e) => e.removeAttribute("data-a11y-scan"));
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
