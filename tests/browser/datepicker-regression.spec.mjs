import { test, expect } from "@playwright/test";

// Bounded real-browser regression test (UIF-VLT ADR:
// decisions/bounded-browser-verification.md; Runtime issue #307).
//
// This proves the browser-only failure class the lightweight `node --test`
// stack cannot: a real user click on a rendered calendar day must travel
// through the DOM/event path (a genuine mousedown → mouseup → click sequence in
// Chromium) and land in the Date Picker's day/month/year state with the correct
// selected DOM state. Scope is intentionally the single Datepicker interaction
// that motivated the decision — nothing broader.

const PLAYGROUND_PATH = "/components/date-picker-playground/";

// Fixed visible month so the assertion is deterministic regardless of "today".
const TARGET_MONTH = "3"; // March (1-based, as the day/month/year controls use)
const TARGET_YEAR = "2026";
const TARGET_DAY = "15";

test("clicking a calendar day drives day/month/year state and selected DOM state", async ({
  page,
}) => {
  await page.goto(PLAYGROUND_PATH);

  const controls = "#date-picker-playground-controls";
  const dayControl = page.locator(`${controls} [name='day']`);
  const monthControl = page.locator(`${controls} [name='month']`);
  const yearControl = page.locator(`${controls} [name='year']`);
  const stateControl = page.locator(`${controls} [name='state']`);

  // Playground controls are the source of truth; the preview re-renders from
  // them. Pin a deterministic visible month/year, then open the calendar.
  await monthControl.fill(TARGET_MONTH);
  await yearControl.fill(TARGET_YEAR);
  await stateControl.selectOption("open");

  const mount = page.locator("#date-picker-playground-root");
  const calendar = mount.locator(".uif-calendar");
  await expect(calendar).toBeVisible();
  await expect(calendar.locator(".uif-calendar-table")).toHaveAttribute(
    "aria-label",
    "March 2026",
  );

  // Commit control state and drop focus so no focus-driven re-render happens
  // between the day cell's mousedown and mouseup. This mirrors a real user
  // clicking a day in an already-open, settled calendar.
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  // 1. + 2. Click an actual rendered calendar day with a real Chromium mouse
  // click (produces a genuine mousedown → mouseup → click event sequence).
  const dayCell = mount.locator("button.uif-calendar-cell", { hasText: /^15$/ });
  await expect(dayCell).toBeVisible();
  await dayCell.click();

  // 3. / 4. / 5. Verify the resulting day / month / year state.
  await expect(dayControl).toHaveValue(TARGET_DAY);
  await expect(monthControl).toHaveValue(TARGET_MONTH);
  await expect(yearControl).toHaveValue(TARGET_YEAR);

  // 6. Verify the clicked date has the expected selected DOM state after the
  // re-render (class + ARIA both assert the real rendered selection).
  const selectedCell = mount.locator("button.uif-calendar-cell.is-selected", {
    hasText: /^15$/,
  });
  await expect(selectedCell).toHaveCount(1);
  await expect(selectedCell).toHaveAttribute("aria-selected", "true");
});
