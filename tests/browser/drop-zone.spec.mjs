import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openPlayground(page) {
  await page.goto("/patterns/drop-zone-playground/");
  await page.evaluate(async () => customElements.whenDefined("uif-drop-zone"));
  return page.locator("#drop-zone-playground-root");
}

async function dropFiles(target, files) {
  await target.evaluate((element, entries) => {
    const transfer = new DataTransfer();
    entries.forEach(({ name, type, content }) => {
      transfer.items.add(new File([content], name, { type }));
    });
    element.dispatchEvent(new DragEvent("dragenter", { bubbles: true, dataTransfer: transfer }));
    element.dispatchEvent(new DragEvent("dragover", { bubbles: true, dataTransfer: transfer }));
    element.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: transfer }));
  }, files);
}

test("DropZone exposes a named native picker and persistent status", async ({ page }) => {
  const root = await openPlayground(page);
  const zone = root.locator("uif-drop-zone");
  const input = root.locator('input[type="file"]');
  const status = root.getByRole("status");
  await zone.evaluate((element) => {
    window.__dropZoneEvents = [];
    element.addEventListener("uif-files-selected", (event) => {
      window.__dropZoneEvents.push({
        names: event.detail.files.map((file) => file.name),
        source: event.detail.source,
      });
    });
  });

  await expect(input).toHaveAttribute("accept", ".pdf,image/*");
  await expect(input).toHaveAttribute("multiple", "");
  await expect(input).toHaveAccessibleName("Travel documents Choose files");
  await expect(input).toHaveAttribute("aria-describedby", /description.*status/);
  await expect(root.getByText("Choose files", { exact: true })).toBeVisible();
  await expect(status).toHaveCount(1);
  await expect(status).toHaveText("");
  await expect(status).not.toHaveAttribute("hidden", "");

  await input.setInputFiles([
    { name: "passport.pdf", mimeType: "application/pdf", buffer: Buffer.from("pdf") },
    { name: "portrait.png", mimeType: "image/png", buffer: Buffer.from("png") },
  ]);

  await expect(root.getByRole("list", { name: "Selected files" })).toBeVisible();
  await expect(root.getByRole("listitem")).toHaveText(["passport.pdf", "portrait.png"]);
  await expect(status).toHaveText("2 files selected.");
  await expect(zone).toHaveAttribute("data-filled", "");
  await expect.poll(() => page.evaluate(() => window.__dropZoneEvents)).toEqual([
    { names: ["passport.pdf", "portrait.png"], source: "picker" },
  ]);
});

test("DropZone keeps default, custom and localized action names unique", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = `
      <uif-drop-zone></uif-drop-zone>
      <uif-drop-zone label="Travel documents" button-label="Browse files"></uif-drop-zone>
      <uif-drop-zone label="Reisedokumente" button-label="Dateien auswählen"></uif-drop-zone>
    `;
  });
  const inputs = root.locator('input[type="file"]');
  await expect(inputs).toHaveCount(3);
  await expect(inputs.nth(0)).toHaveAccessibleName("Choose files");
  await expect(inputs.nth(1)).toHaveAccessibleName("Travel documents Browse files");
  await expect(inputs.nth(2)).toHaveAccessibleName("Reisedokumente Dateien auswählen");
  await expect(root.getByText("Browse files", { exact: true })).toBeVisible();
  await expect(root.getByText("Dateien auswählen", { exact: true })).toBeVisible();
  await expect.poll(() => inputs.evaluateAll((elements) => {
    const ids = elements.map((element) => element.id);
    const labelledBy = elements.map((element) => element.getAttribute("aria-labelledby"));
    return new Set([...ids, ...labelledBy]).size;
  })).toBe(6);
});

test("DropZone applies accept filtering to picker and drop with recoverable text", async ({ page }) => {
  const root = await openPlayground(page);
  const zone = root.locator("uif-drop-zone");
  const input = root.locator('input[type="file"]');
  await zone.evaluate((element) => {
    window.__dropZoneEvents = [];
    element.addEventListener("uif-files-selected", (event) => {
      window.__dropZoneEvents.push(event.detail.files.map((file) => file.name));
    });
  });

  await input.setInputFiles([
    { name: "notes.exe", mimeType: "application/x-msdownload", buffer: Buffer.from("exe") },
    { name: "passport.pdf", mimeType: "application/pdf", buffer: Buffer.from("pdf") },
  ]);
  await expect(root.getByRole("status")).toContainText("notes.exe");
  await expect(root.getByRole("status")).toContainText("not an accepted file type");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(root.getByRole("listitem")).toHaveText(["passport.pdf"]);

  await dropFiles(root.locator(".uif-drop-zone-target"), [
    { name: "photo.jpg", type: "image/jpeg", content: "jpg" },
  ]);
  await expect(root.getByRole("status")).toHaveText("1 file selected.");
  await expect(input).toHaveAttribute("aria-invalid", "false");
  await expect(root.getByRole("listitem")).toHaveText(["photo.jpg"]);
  await expect.poll(() => page.evaluate(() => window.__dropZoneEvents)).toEqual([
    ["passport.pdf"],
    ["photo.jpg"],
  ]);
});

test("DropZone applies the single-file rule and announces native form reset", async ({ page }) => {
  const root = await openPlayground(page);
  await root.evaluate((container) => {
    container.innerHTML = '<form><uif-drop-zone label="Attachments" name="attachments" accept=".pdf"></uif-drop-zone></form>';
  });
  const form = root.locator("form");
  const zone = form.locator("uif-drop-zone");
  const target = zone.locator(".uif-drop-zone-target");

  await dropFiles(target, [
    { name: "first.pdf", type: "application/pdf", content: "one" },
    { name: "second.pdf", type: "application/pdf", content: "two" },
  ]);
  await expect(zone.getByRole("listitem")).toHaveText(["first.pdf"]);
  await expect(zone.getByRole("status")).toContainText("only one file is allowed");
  await expect.poll(() => form.evaluate((element) => {
    const value = new FormData(element).get("attachments");
    return value instanceof File ? value.name : "";
  })).toBe("first.pdf");

  await form.evaluate((element) => element.reset());
  await expect(zone.getByRole("list", { name: "Selected files" })).toBeHidden();
  await expect(zone.getByRole("status")).toHaveText("File selection cleared.");
  await expect(zone.getByRole("status")).not.toHaveAttribute("hidden", "");
  await expect(zone).not.toHaveAttribute("data-filled", "");
});

test("DropZone ignores drag handling while disabled or loading", async ({ page }) => {
  const root = await openPlayground(page);
  const zone = root.locator("uif-drop-zone");
  const target = root.locator(".uif-drop-zone-target");
  const input = root.locator('input[type="file"]');

  await zone.evaluate((element) => element.setAttribute("disabled", ""));
  await expect(input).toBeDisabled();
  await dropFiles(target, [{ name: "passport.pdf", type: "application/pdf", content: "pdf" }]);
  await expect(root.getByRole("list", { name: "Selected files" })).toBeHidden();

  await zone.evaluate((element) => {
    element.removeAttribute("disabled");
    element.setAttribute("loading", "");
  });
  await expect(input).toBeDisabled();
  await expect(target).toHaveAttribute("aria-busy", "true");
  await expect(root.getByRole("status")).toHaveText("Processing files…");
  await dropFiles(target, [{ name: "passport.pdf", type: "application/pdf", content: "pdf" }]);
  await expect(root.getByRole("list", { name: "Selected files" })).toBeHidden();
});

test("DropZone drag feedback resists nested enter and leave events", async ({ page }) => {
  const root = await openPlayground(page);
  const target = root.locator(".uif-drop-zone-target");
  await target.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["pdf"], "passport.pdf", { type: "application/pdf" }));
    element.dispatchEvent(new DragEvent("dragenter", { bubbles: true, dataTransfer: transfer }));
    element.firstElementChild.dispatchEvent(new DragEvent("dragenter", { bubbles: true, dataTransfer: transfer }));
    element.firstElementChild.dispatchEvent(new DragEvent("dragleave", { bubbles: true, dataTransfer: transfer }));
  });
  await expect(target).toHaveAttribute("data-drag-active", "");
  await target.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["pdf"], "passport.pdf", { type: "application/pdf" }));
    element.dispatchEvent(new DragEvent("dragleave", { bubbles: true, dataTransfer: transfer }));
  });
  await expect(target).not.toHaveAttribute("data-drag-active", "");
});

test("DropZone keeps keyboard focus, target size, reflow and forced-color cues", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const root = await openPlayground(page);
  const input = root.locator('input[type="file"]');
  const button = root.locator(".uif-drop-zone-button");
  const target = root.locator(".uif-drop-zone-target");

  await input.focus();
  await expect(input).toBeFocused();
  await expect(button).toHaveCSS("outline-style", "solid");
  await expect.poll(() => button.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44;
  })).toBe(true);

  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.emulateMedia({ forcedColors: "active" });
  await target.evaluate((element) => element.setAttribute("data-drag-active", ""));
  await expect(target).toHaveCSS("border-style", "solid");
  await expect(button).toHaveCSS("outline-style", "solid");

  const results = await new AxeBuilder({ page }).include("#drop-zone-playground-root").analyze();
  expect(results.violations).toEqual([]);
});
