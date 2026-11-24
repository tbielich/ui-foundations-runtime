import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page, slug) {
  await page.goto(`/patterns/${slug}-playground/`);
  await page.evaluate(async (name) => {
    await customElements.whenDefined(`uif-${name}`);
  }, slug);
  return {
    root: page.locator(`#${slug}-playground-root`),
    controls: page.locator(`#${slug}-playground-controls`),
  };
}

test("Progress Bar exposes the info variant across runtime and generated examples", async ({ page }) => {
  const { root, controls } = await openPlayground(page, "progress-bar");
  await controls.locator('[name="variant"]').selectOption("info");
  await controls.locator('[name="label"]').fill("Loading itinerary");

  const progress = root.getByRole("progressbar", { name: "Loading itinerary" });
  await expect(progress).toHaveClass(/info/);
  await expect(progress).toHaveAttribute("aria-valuenow", "60");
  const colors = await progress.evaluate((element) => {
    const fill = element.querySelector(".uif-progress-bar-fill");
    const style = getComputedStyle(fill);
    return {
      background: style.backgroundColor,
      fallback: getComputedStyle(element).getPropertyValue("--uif-semantic-color-foreground-subtle").trim(),
    };
  });
  expect(colors.background.replaceAll(",", "")).toBe(colors.fallback);

  for (const suffix of ["", "-njk", "-wc"]) {
    await expect(page.locator(`#progress-bar-playground-code${suffix}`)).toContainText("info");
  }
});

test("Inline Alert generated examples encode text and preserve action and dismissal semantics", async ({ page }) => {
  const { root, controls } = await openPlayground(page, "inline-alert");
  const unsafeTitle = '<img src=x onerror="window.__unsafe=true">';
  await controls.locator('[name="title"]').fill(unsafeTitle);
  await controls.locator('[name="description"]').fill("Details & context");
  await controls.locator('[name="actionLabel"]').fill("Retry <now>");
  await controls.locator('[name="actionHref"]').fill("javascript:alert(1)");
  await controls.locator('[name="dismissible"]').check();

  const alert = root.getByRole("alert");
  await expect(alert.locator(".uif-inline-alert-title")).toHaveText(unsafeTitle);
  await expect(alert.locator("img")).toHaveCount(0);
  await expect(alert.getByRole("link", { name: "Retry <now>" })).toHaveAttribute("href", "#");
  expect(await page.evaluate(() => window.__unsafe)).toBeUndefined();

  await expect(page.locator("#inline-alert-playground-code")).toContainText("&lt;img");
  await expect(page.locator("#inline-alert-playground-code-wc")).toContainText("&lt;img");
  await expect(page.locator("#inline-alert-playground-code-njk")).toContainText('title="<img src=x onerror=\\"window.__unsafe=true\\">"');
  for (const suffix of ["", "-wc"]) {
    await expect(page.locator(`#inline-alert-playground-code${suffix}`)).toContainText("Retry &lt;now&gt;");
  }
  await expect(page.locator("#inline-alert-playground-code-njk")).toContainText('actionLabel="Retry <now>"');
  await expect(page.locator("#inline-alert-playground-code-njk")).toContainText('actionHref="#"');
  await expect(page.locator("#inline-alert-playground-code-wc")).toContainText('action-href="#"');

  const dismiss = alert.getByRole("button", { name: "Dismiss" });
  await alert.getByRole("link", { name: "Retry <now>" }).focus();
  await page.keyboard.press("Tab");
  await expect(dismiss).toBeFocused();
  const target = await dismiss.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, outline: getComputedStyle(element).outlineStyle };
  });
  expect(target.width).toBeGreaterThanOrEqual(24);
  expect(target.height).toBeGreaterThanOrEqual(24);
  expect(target.outline).not.toBe("none");
  await root.locator("uif-inline-alert").evaluate((element) => {
    element.addEventListener("uif-dismiss", () => { window.__dismissed = true; }, { once: true });
  });
  await dismiss.click();
  await expect(alert).toBeHidden();
  expect(await page.evaluate(() => window.__dismissed)).toBe(true);
  expect(await page.evaluate(() => document.activeElement?.closest?.(".is-hidden") === null)).toBe(true);
});

test("Inline Alert moves focus to an explicit consumer target on keyboard dismissal", async ({ page }) => {
  const { root } = await openPlayground(page, "inline-alert");
  await root.evaluate((container) => {
    container.replaceChildren();
    const alert = document.createElement("uif-inline-alert");
    alert.setAttribute("title", "Dismiss me");
    alert.setAttribute("dismissible", "");
    const automaticTarget = document.createElement("button");
    automaticTarget.id = "automatic-target";
    automaticTarget.textContent = "Automatic target";
    const explicitTarget = document.createElement("button");
    explicitTarget.id = "explicit-target";
    explicitTarget.textContent = "Explicit target";
    container.append(alert, automaticTarget, explicitTarget);
    alert.dismissFocusTarget = explicitTarget;
  });

  const dismiss = root.getByRole("button", { name: "Dismiss" });
  await dismiss.focus();
  await page.keyboard.press("Enter");

  await expect(root.getByRole("alert")).toBeHidden();
  await expect(root.locator("#explicit-target")).toBeFocused();
});

test("Inline Alert falls forward to the next focusable element", async ({ page }) => {
  const { root } = await openPlayground(page, "inline-alert");
  await root.evaluate((container) => {
    container.replaceChildren();
    const alert = document.createElement("uif-inline-alert");
    alert.setAttribute("title", "Dismiss me");
    alert.setAttribute("dismissible", "");
    const next = document.createElement("button");
    next.id = "next-target";
    next.textContent = "Next target";
    container.append(alert, next);
  });

  const dismiss = root.getByRole("button", { name: "Dismiss" });
  await dismiss.focus();
  await page.keyboard.press("Enter");

  await expect(root.locator("#next-target")).toBeFocused();
});

test("Inline Alert falls back at the end of the document order", async ({ page }) => {
  await openPlayground(page, "inline-alert");
  await page.evaluate(() => {
    const previous = document.createElement("button");
    previous.id = "previous-target";
    previous.textContent = "Previous target";
    const alert = document.createElement("uif-inline-alert");
    alert.id = "end-alert";
    alert.setAttribute("title", "Dismiss me");
    alert.setAttribute("dismissible", "");
    document.body.append(previous, alert);
  });

  const dismiss = page.locator("#end-alert").getByRole("button", { name: "Dismiss" });
  await dismiss.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("#previous-target")).toBeFocused();
});

test("Illustrated Message generated examples encode overrides and retain action focus", async ({ page }) => {
  const { root, controls } = await openPlayground(page, "illustrated-message");
  await controls.locator('[name="heading"]').fill("Could not <load>");
  await controls.locator('[name="description"]').fill('Try again & keep "working".');
  await controls.locator('[name="actionLabel"]').fill("Retry <now>");
  await controls.locator('[name="actionHref"]').fill("/retry");
  await controls.locator('[name="actionVariant"]').selectOption("outline");

  await expect(root.locator(".uif-illustrated-message-heading")).toHaveText("Could not <load>");
  await expect(root.locator(".uif-illustrated-message-content img")).toHaveCount(0);
  const action = root.getByRole("link", { name: "Retry <now>" });
  await expect(action).toHaveAttribute("href", "/retry");

  for (const suffix of ["", "-wc"]) {
    const code = page.locator(`#illustrated-message-playground-code${suffix}`);
    await expect(code).toContainText("Could not &lt;load&gt;");
    await expect(code).toContainText("Retry &lt;now&gt;");
  }
  await expect(page.locator("#illustrated-message-playground-code-njk")).toContainText('heading="Could not <load>"');
  await expect(page.locator("#illustrated-message-playground-code-njk")).toContainText('actionLabel="Retry <now>"');
  await expect(page.locator("#illustrated-message-playground-code-njk")).toContainText('actionHref="/retry"');
  await expect(page.locator("#illustrated-message-playground-code-wc")).toContainText('action-href="/retry"');
  expect(await action.getAttribute("href")).toBe("/retry");
});

test("Existing component slice retains reflow, forced-color, reduced-motion and axe evidence", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });

  for (const slug of ["progress-bar", "inline-alert", "illustrated-message"]) {
    const { root, controls } = await openPlayground(page, slug);
    if (slug === "progress-bar") {
      await controls.locator('[name="indeterminate"]').check();
      await expect(root.locator(".uif-progress-bar-fill")).toHaveCSS("animation-name", "none");
    }
    if (slug === "inline-alert") {
      await controls.locator('[name="dismissible"]').check();
      const dismiss = root.getByRole("button", { name: "Dismiss" });
      await dismiss.focus();
      await expect(dismiss).toBeFocused();
    }

    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const geometry = await root.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);

    const results = await new AxeBuilder({ page }).include(`#${slug}-playground-root`).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  }
});
