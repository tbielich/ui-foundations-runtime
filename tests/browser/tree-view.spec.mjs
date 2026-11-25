import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page) {
  await page.goto("/patterns/tree-view-playground/");
  await page.evaluate(async () => {
    await customElements.whenDefined("uif-tree-view");
    await customElements.whenDefined("uif-tree-item");
  });
  return page.locator("#tree-view-playground-root");
}

test("TreeView exposes hierarchy and visible-node keyboard navigation", async ({ page }) => {
  const root = await openPlayground(page);
  const tree = root.getByRole("tree", { name: "Destinations" });
  const europe = tree.getByRole("treeitem", { name: "Europe" });
  const spain = tree.getByRole("treeitem", { name: "Spain" });
  const greece = tree.getByRole("treeitem", { name: "Greece" });

  await expect(tree).toHaveAttribute("aria-multiselectable", "true");
  await expect(europe).toHaveAttribute("aria-level", "1");
  await expect(spain).toHaveAttribute("aria-level", "2");
  await expect(europe).toHaveAttribute("aria-expanded", "true");
  await europe.focus();
  await page.keyboard.press("ArrowRight");
  await expect(spain).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(greece).toBeFocused();
  await page.keyboard.press("Home");
  await expect(europe).toBeFocused();
  await page.keyboard.press("g");
  await expect(greece).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(europe).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(europe).toHaveAttribute("aria-expanded", "false");
  await expect(spain).toBeHidden();
  await page.keyboard.press("End");
  await expect(tree.getByRole("treeitem", { name: "Islands" })).toBeFocused();
});

test("TreeView multi-selection is explicit and emits complete values", async ({ page }) => {
  const root = await openPlayground(page);
  const tree = root.getByRole("tree");
  const host = root.locator("uif-tree-view");
  await host.evaluate((element) => {
    window.__treeSelections = [];
    element.addEventListener("uif-selection", (event) => {
      window.__treeSelections.push({ value: event.detail.value, selected: event.detail.selected, values: event.detail.values });
    });
  });
  const europe = tree.getByRole("treeitem", { name: "Europe" });
  const spain = tree.getByRole("treeitem", { name: "Spain" });
  await europe.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(europe).toHaveAttribute("aria-selected", "true");
  await expect(spain).toHaveAttribute("aria-selected", "true");
  await expect(europe.locator(":scope > .uif-tree-item-row .uif-tree-item-selection")).toHaveText("✓ Selected");
  await expect.poll(() => page.evaluate(() => window.__treeSelections)).toEqual([
    { value: "europe", selected: true, values: ["europe"] },
    { value: "spain", selected: true, values: ["europe", "spain"] },
  ]);
});

test("TreeView keyboard reorder preserves focus, hierarchy and announcements", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = `<uif-tree-view label="Files" reorderable>
      <uif-tree-item value="alpha" label="Alpha"></uif-tree-item>
      <uif-tree-item value="beta" label="Beta"></uif-tree-item>
      <uif-tree-item value="gamma" label="Gamma"></uif-tree-item>
    </uif-tree-view>`;
    const tree = container.querySelector("uif-tree-view");
    window.__treeReorders = [];
    tree.addEventListener("uif-reorder", (event) => window.__treeReorders.push({
      value: event.detail.value,
      toParent: event.detail.toParent,
      position: event.detail.position,
      method: event.detail.method,
    }));
  });
  const tree = root.getByRole("tree", { name: "Files" });
  const host = root.locator("uif-tree-view");
  const alpha = tree.getByRole("treeitem", { name: "Alpha" });
  await alpha.focus();
  await page.keyboard.press("Control+Shift+ArrowDown");
  await expect(alpha).toBeFocused();
  await expect(tree.getByRole("treeitem")).toHaveText([/Beta/, /Alpha/, /Gamma/]);
  await page.keyboard.press("Control+Shift+ArrowRight");
  await expect(alpha).toHaveAttribute("aria-level", "2");
  await expect(alpha).toBeFocused();
  await page.keyboard.press("Control+Shift+ArrowLeft");
  await expect(alpha).toHaveAttribute("aria-level", "1");
  await expect(host.getByRole("status")).toContainText("Alpha moved after Beta");
  await expect.poll(() => page.evaluate(() => window.__treeReorders)).toEqual([
    { value: "alpha", toParent: null, position: "after", method: "keyboard" },
    { value: "alpha", toParent: "beta", position: "inside", method: "keyboard" },
    { value: "alpha", toParent: null, position: "after", method: "keyboard" },
  ]);
});

test("TreeView pointer reorder emits a pointer move with valid feedback", async ({ page }) => {
  const root = await openPlayground(page);
  const tree = root.getByRole("tree");
  const host = root.locator("uif-tree-view");
  const europe = tree.getByRole("treeitem", { name: "Europe" });
  const americas = tree.getByRole("treeitem", { name: "Americas" });
  await host.evaluate((element) => {
    window.__pointerReorder = null;
    element.addEventListener("uif-reorder", (event) => {
      window.__pointerReorder = { value: event.detail.value, position: event.detail.position, method: event.detail.method };
    });
  });
  await tree.evaluate((element) => {
    const source = [...element.querySelectorAll("uif-tree-item")].find((item) => item.getAttribute("value") === "europe");
    const target = [...element.querySelectorAll("uif-tree-item")].find((item) => item.getAttribute("value") === "americas");
    const transfer = new DataTransfer();
    source.querySelector(":scope > .uif-tree-item-row").dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: transfer }));
    const row = target.querySelector(":scope > .uif-tree-item-row");
    const rect = row.getBoundingClientRect();
    row.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, clientY: rect.bottom - 1, dataTransfer: transfer }));
    row.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, clientY: rect.bottom - 1, dataTransfer: transfer }));
  });
  await expect(europe).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.__pointerReorder)).toEqual({ value: "europe", position: "after", method: "pointer" });
  await expect(tree.getByRole("treeitem").nth(0)).toHaveAccessibleName("Americas");
  await expect(americas).not.toHaveAttribute("data-drop-position");
});

test("TreeView replaces single selection and deselects in multiple mode", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = `<uif-tree-view label="Single tree">
      <uif-tree-item value="alpha" label="Alpha" selected></uif-tree-item>
      <uif-tree-item value="beta" label="Beta"></uif-tree-item>
    </uif-tree-view>
    <uif-tree-view label="Multiple tree" selection="multiple">
      <uif-tree-item value="gamma" label="Gamma" selected></uif-tree-item>
      <uif-tree-item value="delta" label="Delta"></uif-tree-item>
    </uif-tree-view>`;
  });

  const singleTree = root.getByRole("tree", { name: "Single tree" });
  const alpha = singleTree.getByRole("treeitem", { name: "Alpha" });
  const beta = singleTree.getByRole("treeitem", { name: "Beta" });
  await beta.focus();
  await page.keyboard.press("Space");
  await expect(alpha).toHaveAttribute("aria-selected", "false");
  await expect(beta).toHaveAttribute("aria-selected", "true");

  const multipleTree = root.getByRole("tree", { name: "Multiple tree" });
  const gamma = multipleTree.getByRole("treeitem", { name: "Gamma" });
  await gamma.focus();
  await page.keyboard.press("Space");
  await expect(gamma).toHaveAttribute("aria-selected", "false");
});

test("TreeView keeps drop feedback within a row and clears it between targets", async ({ page }) => {
  const root = await openPlayground(page);
  const tree = root.getByRole("tree");
  const americas = tree.getByRole("treeitem", { name: "Americas" });
  await tree.evaluate((element) => {
    const source = element.querySelector('uif-tree-item[value="europe"]');
    const target = element.querySelector('uif-tree-item[value="americas"]');
    const nextTarget = element.querySelector('uif-tree-item[value="islands"]');
    const transfer = new DataTransfer();
    source.querySelector(":scope > .uif-tree-item-row").dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: transfer }));
    const row = target.querySelector(":scope > .uif-tree-item-row");
    const label = row.querySelector(".uif-tree-item-label");
    const rect = row.getBoundingClientRect();
    row.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, clientY: rect.top + rect.height / 2, dataTransfer: transfer }));
    row.dispatchEvent(new DragEvent("dragleave", { bubbles: true, relatedTarget: label, dataTransfer: transfer }));
    window.__dropFeedbackWithinRow = target.getAttribute("data-drop-position");
    row.dispatchEvent(new DragEvent("dragleave", {
      bubbles: true,
      relatedTarget: nextTarget.querySelector(":scope > .uif-tree-item-row"),
      dataTransfer: transfer,
    }));
  });
  await expect.poll(() => page.evaluate(() => window.__dropFeedbackWithinRow)).toBe("inside");
  await expect(americas).not.toHaveAttribute("data-drop-position");
});

test("TreeView lazy loading supports failure, retry, idempotency and cancellation", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = `<uif-tree-view label="Lazy tree">
      <uif-tree-item value="islands" label="Islands" lazy></uif-tree-item>
      <uif-tree-item value="remote" label="Remote" lazy></uif-tree-item>
    </uif-tree-view>`;
    const tree = container.querySelector("uif-tree-view");
    let attempts = 0;
    window.__aborted = false;
    tree.addEventListener("uif-load", (event) => {
      if (event.detail.value === "remote") {
        event.detail.signal.addEventListener("abort", () => { window.__aborted = true; });
        window.__remoteResolve = event.detail.resolve;
        return;
      }
      attempts += 1;
      if (attempts === 1) event.detail.reject("Service unavailable");
      else event.detail.resolve([
        { value: "crete", label: "Crete" },
        { value: "crete", label: "Crete duplicate" },
      ]);
    });
  });
  const tree = root.getByRole("tree");
  const host = root.locator("uif-tree-view");
  const islands = tree.getByRole("treeitem", { name: "Islands" });
  await islands.focus();
  await page.keyboard.press("ArrowRight");
  await expect(islands).toHaveAttribute("data-load-error", "");
  await expect(host.getByRole("status")).toContainText("Service unavailable");
  await page.keyboard.press("Enter");
  await expect(islands).toHaveAttribute("aria-expanded", "true");
  await expect(tree.getByRole("treeitem", { name: "Crete" })).toHaveCount(1);
  await expect(islands).not.toHaveAttribute("aria-busy");

  const remote = tree.getByRole("treeitem", { name: "Remote" });
  await remote.focus();
  await page.keyboard.press("ArrowRight");
  await expect(remote).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => page.evaluate(() => window.__aborted)).toBe(true);
  await expect(remote).not.toHaveAttribute("aria-busy");
  await page.evaluate(() => window.__remoteResolve([{ value: "late", label: "Late result" }]));
  await expect(tree.getByRole("treeitem", { name: "Late result" })).toHaveCount(0);
});

test("TreeView keeps target size, reflow, forced-color cues and axe semantics", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const root = await openPlayground(page);
  const tree = root.getByRole("tree");
  const first = tree.getByRole("treeitem").first();
  await first.focus();
  await expect(first).toBeFocused();
  await expect(first.locator(":scope > .uif-tree-item-row")).toHaveCSS("outline-style", "solid");
  await expect.poll(() => first.locator(":scope > .uif-tree-item-row").evaluate((element) => element.getBoundingClientRect().height >= 44)).toBe(true);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await first.evaluate((element) => element.setAttribute("data-drop-position", "inside"));
  await expect(first.locator(":scope > .uif-tree-item-row")).toHaveCSS("outline-style", "solid");
  const results = await new AxeBuilder({ page }).include("#tree-view-playground-root").analyze();
  expect(results.violations).toEqual([]);
});
