import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page, slug) {
  await page.goto(`/patterns/${slug}-playground/`);
  await page.evaluate(async (name) => customElements.whenDefined(`uif-${name}`), slug);
  return {
    root: page.locator(`#${slug}-playground-root`),
    controls: page.locator(`#${slug}-playground-controls`),
  };
}

test("Toast announces once, exposes actions and restores focus after keyboard dismissal", async ({ page }) => {
  const { root } = await openPlayground(page, "toast");
  await root.evaluate((container) => {
    container.replaceChildren();
    window.__toastEvents = [];
    container.addEventListener("uif-action", () => window.__toastEvents.push("action"));
    container.addEventListener("uif-dismiss", (event) => window.__toastEvents.push(event.detail.reason));
    const region = document.createElement("uif-toast-region");
    region.setAttribute("label", "Notifications");
    const toastElement = document.createElement("uif-toast");
    toastElement.setAttribute("variant", "success");
    toastElement.setAttribute("message", "Booking saved");
    toastElement.setAttribute("action-label", "Undo save");
    toastElement.setAttribute("duration", "0");
    const focusTarget = document.createElement("button");
    focusTarget.id = "toast-focus-target";
    focusTarget.textContent = "Continue booking";
    region.append(toastElement);
    container.append(region, focusTarget);
  });

  const region = root.getByRole("region", { name: "Notifications" });
  await expect(region).not.toHaveAttribute("aria-live");
  const toast = root.getByRole("status");
  await expect(toast).toHaveAttribute("aria-live", "polite");
  await expect(toast).toHaveAttribute("aria-atomic", "true");
  await expect(toast).toContainText("Booking saved");

  await toast.getByRole("button", { name: "Undo save" }).click();
  await expect.poll(() => page.evaluate(() => window.__toastEvents)).toEqual(["action"]);

  const after = root.getByRole("button", { name: "Continue booking" });
  const dismiss = toast.getByRole("button", { name: "Dismiss notification" });
  await dismiss.focus();
  await page.keyboard.press("Enter");
  await expect(root.locator("uif-toast")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__toastEvents)).toEqual(["action", "dismiss"]);
  await expect(after).toBeFocused();
});

test("Toast auto-dismiss pauses during pointer and focus interaction", async ({ page }) => {
  const { root } = await openPlayground(page, "toast");
  await root.evaluate((container) => {
    container.replaceChildren();
    const region = document.createElement("uif-toast-region");
    const toast = document.createElement("uif-toast");
    toast.setAttribute("message", "Saved for later");
    toast.setAttribute("duration", "250");
    region.append(toast);
    container.append(region);
  });
  const host = root.locator("uif-toast");
  await host.hover();
  await page.waitForTimeout(350);
  await expect(host).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(host).toHaveCount(0, { timeout: 1000 });

  await root.evaluate((container) => {
    const toast = document.createElement("uif-toast");
    toast.setAttribute("message", "Action available");
    toast.setAttribute("action-label", "Review");
    toast.setAttribute("duration", "200");
    const target = document.createElement("button");
    target.textContent = "Continue";
    container.querySelector("uif-toast-region").append(toast);
    container.append(target);
  });
  const action = root.getByRole("button", { name: "Review" });
  await action.focus();
  await page.waitForTimeout(300);
  await expect(action).toBeVisible();
  await root.getByRole("button", { name: "Continue" }).focus();
  await expect(root.locator("uif-toast")).toHaveCount(0, { timeout: 1000 });
});

test("Error Toast uses assertive urgency and stacking remains ordered", async ({ page }) => {
  const { root, controls } = await openPlayground(page, "toast");
  await controls.locator('[name="duration"]').fill("0");
  await controls.locator('[name="variant"]').selectOption("error");
  await expect(root.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  await root.locator("uif-toast-region").evaluate((region) => {
    const second = document.createElement("uif-toast");
    second.setAttribute("message", "Second notification");
    second.setAttribute("duration", "0");
    region.append(second);
  });
  await expect(root.locator("uif-toast")).toHaveCount(2);
  await expect(root.locator("uif-toast").nth(1)).toContainText("Second notification");
});

test("Popover synchronizes its trigger, enters content and returns focus on Escape", async ({ page }) => {
  const { root } = await openPlayground(page, "popover");
  const trigger = root.getByRole("button", { name: "Show booking details" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const popover = root.getByRole("dialog", { name: "Booking details" });
  await expect(popover).toBeVisible();
  await expect(popover.getByRole("link", { name: "Review fare conditions" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("Popover flips within the viewport and outside interaction dismisses it", async ({ page }) => {
  const { root, controls } = await openPlayground(page, "popover");
  await root.evaluate((container) => {
    container.style.minHeight = "300px";
    const trigger = container.querySelector("button");
    trigger.style.position = "fixed";
    trigger.style.insetBlockEnd = "2px";
    trigger.style.insetInlineStart = "50%";
    container.querySelector("uif-popover").setAttribute("placement", "bottom");
  });
  const trigger = root.getByRole("button", { name: "Show booking details" });
  await trigger.click();
  const panel = root.getByRole("dialog", { name: "Booking details" });
  await expect(panel).toHaveAttribute("data-placement", "top");
  await controls.locator('[name="label"]').click();
  await expect(panel).toBeHidden();
});

test("Feedback overlays retain reflow, forced-color, reduced-motion and axe evidence", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  const longTriggerLabel = "Show all booking details and fare conditions before continuing";
  for (const slug of ["toast", "popover"]) {
    const { root, controls } = await openPlayground(page, slug);
    if (slug === "toast") await controls.locator('[name="duration"]').fill("0");
    if (slug === "popover") {
      await root.getByRole("button", { name: "Show booking details" }).evaluate((trigger, label) => {
        trigger.textContent = label;
      }, longTriggerLabel);
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    if (slug === "popover") await root.getByRole("button", { name: longTriggerLabel }).evaluate((trigger) => trigger.click());
    const geometry = await root.evaluate((element) => {
      const triggerBounds = element.querySelector(".uif-popover-trigger")?.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        rootWidth: element.scrollWidth,
        rootClientWidth: element.clientWidth,
        triggerLeft: triggerBounds?.left ?? null,
        triggerRight: triggerBounds?.right ?? null,
        triggerWidth: triggerBounds?.width ?? null,
      };
    });
    expect(geometry.documentWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.rootWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.rootClientWidth + 1);
    if (slug === "popover") {
      expect(geometry.triggerLeft).toBeGreaterThanOrEqual(-1);
      expect(geometry.triggerRight).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.triggerWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    }
    const results = await new AxeBuilder({ page }).include(`#${slug}-playground-root`).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  }
});
