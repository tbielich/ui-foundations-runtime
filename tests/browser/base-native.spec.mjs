import { test, expect } from "@playwright/test";

const properties = ["appearance", "borderStyle", "borderRadius", "backgroundColor", "color"];
test.use({ timezoneId: "Europe/Berlin" });

for (const scheme of ["light", "dark"]) {
  test(`Base preserves native controls and makes no font requests (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const fonts = [];
    page.on("request", request => { if (request.resourceType() === "font" || /fonts\.(googleapis|gstatic)/.test(request.url())) fonts.push(request.url()); });
    await page.goto("/base/preview/");
    await expect(page.locator("#base-button > button")).toBeVisible();
    const reference = await page.context().newPage();
    await reference.emulateMedia({ colorScheme: scheme });
    await reference.setContent('<html lang="de" style="color-scheme:light dark"><body><button id="plain-button">Browser-Button</button><input id="plain-input" placeholder="Text"></body></html>');
    for (const [plain, enhanced] of [["#plain-button", "#base-button > button"], ["#plain-input", "#base-input input"]]) {
      const metrics = await page.evaluate(({ plain, enhanced, properties }) => [plain, enhanced].map(selector => {
        const s = getComputedStyle(document.querySelector(selector));
        return Object.fromEntries(properties.map(property => [property, s[property]]));
      }), { plain, enhanced, properties });
      expect(metrics[1].appearance).toEqual(metrics[0].appearance);
      const native = await reference.locator(plain).evaluate((element, properties) => {
        const style = getComputedStyle(element);
        return Object.fromEntries(properties.map(property => [property, style[property]]));
      }, properties);
      expect(metrics[1]).toEqual(native);
    }
    const body = target => target.locator("body").evaluate(element => ({ margin:getComputedStyle(element).margin, family:getComputedStyle(element).fontFamily }));
    expect((await body(page)).family).toMatch(/system-ui/);
    expect((await body(page)).margin).toBe("0px");
    await reference.close();
    await expect(page.getByRole("button", { name: "Deaktiviert", exact: true })).toBeDisabled();
    await expect(page.locator("uif-switch input")).not.toBeChecked();
    await page.locator("uif-switch input").check();
    await expect(page.locator("uif-switch input")).toBeChecked();
    await expect(page.locator("uif-checkbox input")).toBeChecked();
    expect(await page.locator("uif-checkbox input").evaluate(element => getComputedStyle(element).appearance)).toBe("auto");
    await expect(page.locator("uif-meter meter")).toBeVisible();
    await expect(page.locator("#base-progress progress")).toBeVisible();
    expect(await page.locator("#base-progress progress").evaluate(element => element.value)).toBe(42);
    await page.locator("#base-progress").evaluate(element => element.setAttribute("value", "77"));
    expect(await page.locator("#base-progress progress").evaluate(element => element.value)).toBe(77);
    await expect(page.locator("uif-meter .uif-meter-track")).toBeHidden();
    expect(fonts).toEqual([]);
  });
}

test("Base retains tabs keyboard selection, native details and dialog focus", async ({ page }) => {
  await page.goto("/base/preview/");
  const first = page.getByRole("tab", { name: "Übersicht" });
  await first.focus(); await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Details" })).toBeFocused();
  await expect(page.locator("#base-panel-a")).toBeHidden();
  await expect(page.locator("#base-panel-b")).toBeVisible();
  await page.locator("uif-accordion-item summary").click();
  await expect(page.locator("uif-accordion-item details")).toHaveAttribute("open", "");
  await page.evaluate(() => {
    const item = document.createElement("uif-accordion-item");
    item.id = "disabled-accordion";
    item.setAttribute("title", "Disabled details");
    item.setAttribute("disabled", "");
    document.body.append(item);
  });
  await page.locator("#disabled-accordion summary").click({ force: true });
  expect(await page.locator("#disabled-accordion details").evaluate(element => element.open)).toBe(false);
  const opener = page.locator("#open-dialog");
  await expect(page.locator("#base-dialog dialog")).toBeHidden();
  await opener.click();
  expect(await page.locator("#base-dialog dialog").evaluate(element => element.matches(":modal"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#base-dialog dialog")).toBeHidden();
  await expect(opener).toBeFocused();
});

test("Base retains tooltip, input enhancement, dismiss and date selection", async ({ page }) => {
  await page.goto("/base/preview/");
  const tooltip = page.locator("uif-tooltip [role=tooltip]");
  await expect(tooltip).toBeHidden();
  await page.locator("#tooltip-trigger").focus();
  await expect(tooltip).toBeVisible();
  await page.locator("#plain-button").focus();
  await expect(tooltip).toBeHidden();
  await page.locator("#base-input input").fill("Test");
  await page.locator("#base-input button").click();
  await expect(page.locator("#base-input input")).toHaveValue("");
  await page.locator("uif-inline-alert button").click();
  await expect(page.locator("uif-inline-alert [role=alert]")).toBeHidden();
  const date = page.locator("#base-date");
  await expect(date.locator(".uif-calendar")).toBeHidden();
  await date.getByRole("button", { name: "Open calendar" }).click();
  await expect(date.locator(".uif-calendar")).toBeVisible();
  await date.locator("button.uif-calendar-cell", { hasText: /^17$/ }).click();
  await expect(date.locator(".date-segment.day")).toHaveValue("17");
  await expect(date.locator(".uif-calendar")).toBeHidden();
});

test("Base calendar/table selection stays visible and requests sorting through existing behavior", async ({ page }) => {
  await page.goto("/base/preview/");
  const calendar = page.locator("#base-calendar");
  await calendar.locator("button.uif-calendar-cell", { hasText: /^18$/ }).click();
  await expect(calendar.locator("button.uif-calendar-cell", { hasText: /^18$/ })).toHaveAttribute("aria-selected", "true");
  await page.locator("#base-table").evaluate(table => table.addEventListener("uif:sort", event => { table.dataset.sortRequest = `${event.detail.columnIndex}:${event.detail.direction}`; }));
  await page.locator("#base-table th").first().click();
  await expect(page.locator("#base-table th").first()).toHaveAttribute("aria-sort", "ascending");
  await expect(page.locator("#base-table")).toHaveAttribute("data-sort-request", "0:ascending");
  await page.setViewportSize({ width: 320, height: 1000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("Base month navigation follows the current header and local date values", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/base/preview/");
  const calendar = page.locator("#base-calendar .uif-calendar");
  await expect(calendar.locator("select[name=month]")).toHaveValue("2");
  await calendar.locator("select[name=month]").selectOption("3");
  await expect(calendar.locator("table")).toHaveAttribute("aria-label", "April 2026");
  await calendar.getByRole("button", { name:"Next month", exact:true }).click();
  await expect(calendar.locator("select[name=month]")).toHaveValue("4");
  await calendar.locator("button.uif-calendar-cell[data-date='2026-05-18']").click();
  await expect(calendar.locator("button.uif-calendar-cell[data-date='2026-05-18']")).toHaveAttribute("aria-selected", "true");
  expect(errors).toEqual([]);
});

test("Calendar retains keyboard focus after selection and month rerender", async ({ page }) => {
  await page.goto("/base/preview/");
  const calendar = page.locator("#base-calendar .uif-calendar");
  await calendar.locator("select[name=month]").selectOption("4");
  const day = calendar.locator("button[data-date='2026-05-18']");
  await day.focus();
  await page.keyboard.press("Enter");
  await expect(day).toHaveAttribute("aria-selected", "true");
  await expect(day).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(calendar.locator("button[data-date='2026-05-19']")).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect(calendar.locator("button[data-date='2026-06-19']")).toBeFocused();
  await expect(calendar.locator("button[tabindex='0']")).toHaveCount(1);
});
