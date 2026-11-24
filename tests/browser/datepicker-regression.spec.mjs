import { test, expect } from "@playwright/test";

// Bounded real-browser regression test (UIF-VLT ADR:
// decisions/bounded-browser-verification.md; Runtime issue #307/#309).
//
// This proves the real end-user Datepicker interaction that the lightweight
// `node --test` stack cannot: opening the calendar from the rendered trigger and
// selecting a day with a genuine Chromium mouse click must update the SAME
// user-facing Datepicker value that direct keyboard entry updates, and the
// selected day must survive the subsequent re-render.
//
// The assertions target the rendered Datepicker's OWN segment inputs
// (`.date-segment` inside the preview mount) and the rendered calendar cell —
// i.e. the value a consumer sees and edits — NOT the external playground config
// panel (`#date-picker-playground-controls`), which is only test configuration.
// Setup uses the Datepicker's own affordances (trigger + calendar month/year
// selectors), never manual entry of the selected day into the config panel.

const PLAYGROUND_PATH = "/components/date-picker-playground/";

const TARGET_MONTH_INDEX = "2"; // March, 0-based (calendar <select> is 0-based)
const TARGET_YEAR = "2026";
const TARGET_DAY = "15";

// Locators scoped to the rendered Datepicker preview (the user-facing UI).
const mountSelector = "#date-picker-playground-root";

test("selecting a calendar day updates the rendered Datepicker value", async ({
  page,
}) => {
  await page.goto(PLAYGROUND_PATH);

  const mount = page.locator(mountSelector);

  // The rendered Datepicker's own value = its segment inputs.
  const day = mount.locator(".date-segment.day");
  const month = mount.locator(".date-segment.month");
  const year = mount.locator(".date-segment.year");

  // 1. + 2. Open the calendar via the actual visible trigger a user clicks.
  await mount.locator("[aria-label='Open calendar']").click();
  const calendar = mount.locator(".uif-calendar");
  await expect(calendar).toBeVisible();

  // Deterministic setup using the calendar's OWN month/year selectors (real
  // user affordances inside the Datepicker), not the external config panel.
  await mount
    .locator(".uif-calendar-header-select[name='month']")
    .selectOption(TARGET_MONTH_INDEX);
  await mount
    .locator(".uif-calendar-header-select[name='year']")
    .selectOption(TARGET_YEAR);
  await expect(mount.locator(".uif-calendar-table")).toHaveAttribute(
    "aria-label",
    "March 2026",
  );

  // 3. Click a real rendered calendar day with a genuine Chromium mouse click
  // (produces a real mousedown → mouseup → click sequence). No blur workaround,
  // no dispatchEvent, no writing the day into the config panel.
  const dayCell = mount.locator("button.uif-calendar-cell", { hasText: /^15$/ });
  await expect(dayCell).toBeVisible();
  await dayCell.click();

  // 4. The actual rendered Datepicker value (its segment inputs) must reflect
  // the selected date — the same value keyboard entry would produce.
  await expect(day).toHaveValue(TARGET_DAY);
  await expect(month).toHaveValue("3"); // segment shows 1-based month
  await expect(year).toHaveValue(TARGET_YEAR);

  // 5. The selected day must remain selected after the re-render.
  const selectedCell = mount.locator("button.uif-calendar-cell.is-selected", {
    hasText: /^15$/,
  });
  await expect(selectedCell).toHaveCount(1);
  await expect(selectedCell).toHaveAttribute("aria-selected", "true");
});

test("typing a date and clicking a day converge on one Datepicker value", async ({
  page,
}) => {
  await page.goto(PLAYGROUND_PATH);

  const mount = page.locator(mountSelector);
  const day = mount.locator(".date-segment.day");
  const month = mount.locator(".date-segment.month");
  const year = mount.locator(".date-segment.year");

  // Type a date directly into the rendered Datepicker input (keyboard entry).
  await month.click();
  await month.pressSequentially("3");
  await year.click();
  await year.pressSequentially(TARGET_YEAR);

  // The typed value must survive re-render (opening the calendar re-renders).
  await mount.locator("[aria-label='Open calendar']").click();
  await expect(mount.locator(".uif-calendar")).toBeVisible();
  await expect(mount.locator(".uif-calendar-table")).toHaveAttribute(
    "aria-label",
    "March 2026",
  );
  await expect(month).toHaveValue("3");
  await expect(year).toHaveValue(TARGET_YEAR);

  // Now select a day by clicking. It must update the same value, preserving the
  // typed month/year (one coherent selected-date state), even though a control
  // is focused and no manual blur() is performed first.
  const dayCell = mount.locator("button.uif-calendar-cell", { hasText: /^15$/ });
  await dayCell.click();

  await expect(day).toHaveValue(TARGET_DAY);
  await expect(month).toHaveValue("3");
  await expect(year).toHaveValue(TARGET_YEAR);

  const selectedCell = mount.locator("button.uif-calendar-cell.is-selected", {
    hasText: /^15$/,
  });
  await expect(selectedCell).toHaveCount(1);
  await expect(selectedCell).toHaveAttribute("aria-selected", "true");
});
