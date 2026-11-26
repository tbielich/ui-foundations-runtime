import { test, expect } from "@playwright/test";
import fs from "node:fs";

async function fixture(page) {
  await page.goto("/patterns/content/");
  await page.setContent('<html data-brand="a" data-mode="light"><head><link rel="stylesheet" href="/vendor/ui-foundations/main.css"></head><body><main id="content" style="max-inline-size:100%;min-inline-size:0"></main></body></html>');
  await page.locator("body").evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function render(page, source, options = {}) {
  return page.evaluate(async ({ source, options }) => {
    const { renderContent } = await import("/vendor/ui-foundations/components/content.js");
    const result = renderContent(document.getElementById("content"), source, options);
    return { source: result.source, fallback: result.fallback };
  }, { source, options });
}

test("content example has semantic headings, nested lists, emphasis, code and a table", async ({ page }) => {
  await page.goto("/patterns/content/");
  await page.locator("[data-content-variant=formatted]").click();
  const content = page.locator("#content-example");
  await expect(content.locator("h3")).toHaveText("Working with formatted content");
  await expect(content.locator("ol > li")).toHaveCount(2);
  await expect(content.locator("ol ul > li")).toHaveCount(2);
  await expect(content.locator("strong")).toHaveText("Content");
  await expect(content.locator("em")).toHaveText("emphasis");
  await expect(content.locator("blockquote")).toContainText("untrusted");
  await expect(content.locator("th[scope=col]")).toHaveCount(2);
});

test("untrusted HTML, executable links and images remain inert text", async ({ page }) => {
  await fixture(page);
  const requests = [];
  page.on("request", request => requests.push(request.url()));
  await render(page, [
    '<script>window.contentAttack = 1</script>',
    '<img src="https://evil.invalid/x" onerror="window.contentAttack=2">',
    '<svg onload="window.contentAttack=3"></svg>',
    '[bad](javascript:alert%281%29) [data](data:text/html,evil)',
    '[obfuscated](java\tscript:evil) ![image](https://evil.invalid/image)',
    '[allowed](https://example.com/) **safe** `literal <script>`',
  ].join("\n\n"));
  await expect(page.locator("#content script, #content img, #content svg, #content iframe")).toHaveCount(0);
  await expect(page.locator("#content a")).toHaveCount(1);
  await expect(page.locator("#content a")).toHaveAttribute("href", "https://example.com/");
  expect(await page.evaluate(() => window.contentAttack)).toBeUndefined();
  expect(requests.some(url => url.includes("evil.invalid"))).toBe(false);
  await expect(page.locator("#content")).toContainText('<script>window.contentAttack = 1</script>');
});

test("copy is keyboard accessible, exact and announces success and failure", async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    window.copiedCode = [];
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => { window.copiedCode.push(text); } } });
  });
  const code = "\tconst text = '<img>';  \r\n\r\n";
  await render(page, "```js\r\n" + code + "```\r\n", { copy: true });
  const copy = page.getByRole("button", { name: "Copy code" });
  await copy.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Code copied.");
  expect(await page.evaluate(() => window.copiedCode)).toEqual([code]);
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("Denied"); }; });
  await copy.click();
  await expect(page.getByRole("status")).toHaveText("Copy unavailable. Select and copy the code manually.");
  await expect(copy).toBeEnabled();
  await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }); });
  await copy.click();
  await expect(page.getByRole("status")).toContainText("Copy unavailable");
});

test("plain output preserves Unicode, whitespace and uses actual monospaced metrics", async ({ page }) => {
  await fixture(page);
  const drawing = "╭────╮\n│    │\n╰────╯\n";
  const result = await render(page, drawing, { format: "text" });
  expect(result.source).toBe(drawing);
  expect(await page.locator("#content pre").textContent()).toBe(drawing);
  await page.locator("#content").evaluate(root => {
    const field = document.createElement("textarea"); field.className = "uif-textarea uif-code uif-code-grid";
    field.value = "  iii\n  WWW\n"; field.wrap = "off"; root.append(field);
  });
  const metrics = await page.locator("textarea").evaluate(field => {
    const style = getComputedStyle(field), context = document.createElement("canvas").getContext("2d");
    context.font = style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
    return { i: context.measureText("iiii").width, w: context.measureText("WWWW").width, font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight), value: field.value };
  });
  expect(metrics.i).toBeCloseTo(metrics.w, 3);
  expect(metrics.line).toBe(metrics.font);
  expect(metrics.value).toBe("  iii\n  WWW\n");
});

test("long code and tables scroll locally at mobile width and large text", async ({ page }) => {
  await fixture(page);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await render(page, "```\n" + "X".repeat(300) + "\n```\n\n| A | B |\n| --- | --- |\n| " + "Z".repeat(300) + " | value |\n\nhttps://example.com/" + "long".repeat(200));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const region of await page.locator("#content [role=region]").all()) {
    await expect(region).toHaveAttribute("tabindex", "0");
    expect(await region.evaluate(e => e.scrollWidth > e.clientWidth)).toBe(true);
  }
});

test("heading configuration, oversized fallback and re-render lifecycle preserve source", async ({ page }) => {
  await fixture(page);
  await render(page, "# First\n\n###### Last", { headingLevel: 4 });
  await expect(page.locator("#content h4")).toHaveText("First");
  await expect(page.locator("#content h6")).toHaveText("Last");
  const source = "*".repeat(200001);
  expect((await render(page, source)).fallback).toBe(true);
  expect(await page.locator("#content pre").textContent()).toBe(source);
  await page.evaluate(async () => {
    const { renderContent } = await import("/vendor/ui-foundations/components/content.js");
    window.copyDone = null;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => new Promise(resolve => { window.copyDone = resolve; }) } });
    renderContent(document.getElementById("content"), "```\nold\n```", { copy: true });
  });
  await page.getByRole("button", { name: "Copy code" }).click();
  await render(page, "Replacement");
  await page.evaluate(() => window.copyDone());
  await expect(page.locator("#content")).toHaveText("Replacement");
});

test("content has readable code and focus across brand/scheme contexts without motion", async ({ page }) => {
  await fixture(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const rows = [];
  for (const brand of ["a", "b", "c"]) for (const mode of ["light", "dark"]) {
    await page.evaluate(({ brand, mode }) => { document.documentElement.dataset.brand = brand; document.documentElement.dataset.mode = mode; }, { brand, mode });
    await render(page, "Readable paragraph\n\n```\ncode\n```");
    const region = page.getByRole("region", { name: "Code example" });
    await region.focus();
    const value = await region.evaluate(e => {
      const style = getComputedStyle(e);
      const rgb = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
      const lum = c => c.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const a = lum(rgb(style.color)), b = lum(rgb(style.backgroundColor));
      const focus = lum(rgb(style.outlineColor));
      return { contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), focusContrast: (Math.max(focus, b) + 0.05) / (Math.min(focus, b) + 0.05), outline: parseFloat(style.outlineWidth), animation: style.animationName };
    });
    expect(value.contrast).toBeGreaterThanOrEqual(4.5);
    expect(value.outline).toBeGreaterThan(0);
    expect(value.focusContrast).toBeGreaterThanOrEqual(3);
    expect(value.animation).toBe("none");
    rows.push({ brand, mode, ...value });
  }
  await test.info().attach("content-contexts", { body: JSON.stringify(rows, null, 2), contentType: "application/json" });
});

test("Pi chat patch preserves text fallback, upgrades history and formats only assistant messages", async ({ page }) => {
  await fixture(page);
  const patch = fs.readFileSync("docs/examples/pi-chat-content.patch", "utf8").split("\n");
  const start = patch.findIndex(line => line.startsWith("+    var text ="));
  const end = patch.findIndex((line, i) => i > start && line.includes("article.appendChild(heading); article.appendChild(text)"));
  const snippet = patch.slice(start, end).filter(line => !line.startsWith("-")).map(line => line.slice(1)).join("\n") + "\nreturn text;";
  await page.evaluate(snippet => {
    window.makePiMessage = new Function("message", snippet);
    const target = window.makePiMessage({ role: "assistant", content: "# Pending answer\n\n```\noriginal\n```" });
    target.id = "pending"; document.getElementById("content").append(target);
  }, snippet);
  await expect(page.locator("#pending")).toHaveClass("uif-code");
  await expect(page.locator("#pending")).toContainText("# Pending answer");
  const module = fs.readFileSync("docs/examples/pi-chat-content.js", "utf8")
    .replace('"ui-foundations/behaviors/content"', '"/vendor/ui-foundations/components/content.js"')
    .replace(/^import "ui-foundations\/(?:core|ui)\.css";\n/gm, "");
  await page.route("**/pi-content-integration.js", route => route.fulfill({ contentType: "text/javascript", body: module }));
  await page.evaluate(() => import("/pi-content-integration.js"));
  await expect(page.locator("#pending h4")).toHaveText("Pending answer");
  await expect(page.locator("#pending")).not.toHaveClass(/uif-code(?:\s|$)/);
  await expect(page.getByRole("button", { name: "Code kopieren" })).toBeVisible();
  await page.evaluate(() => {
    for (const role of ["user", "assistant"]) {
      const target = window.makePiMessage({ role, content: "**Message**" });
      target.id = "new-" + role; document.getElementById("content").append(target);
    }
  });
  await expect(page.locator("#new-user")).toHaveText("**Message**");
  await expect(page.locator("#new-user strong")).toHaveCount(0);
  await expect(page.locator("#new-assistant strong")).toHaveText("Message");
});


test("content stage switches examples independently of brand and mode", async ({ page }) => {
  await page.goto("/patterns/content/");
  const stage = page.locator(".docs-hero-preview-stage");
  const content = stage.locator("#content-example");
  await page.getByRole("button", { name: "Brand B", exact: true }).click();
  await page.locator("[data-hero-mode=dark]").click();
  await page.locator("[data-content-variant=inline]").click();
  await expect(content.locator("code")).toHaveText("npm run build");
  await expect(content.locator("pre")).toHaveCount(0);
  await page.locator("[data-content-variant=code]").click();
  await expect(content.getByRole("button")).toHaveCount(0);
  await page.locator("[data-content-variant=unicode]").click();
  await expect(content.locator(".uif-code-grid")).toContainText("╭────╮");
  await expect(stage).toHaveAttribute("data-brand", "b");
  await expect(stage).toHaveAttribute("data-mode", "dark");
  await page.locator("[data-content-variant=formatted]").click();
  await expect(content.locator("table")).toHaveCount(1);
  for (const id of ["behaviors", "usage-guidelines"]) {
    await expect(page.locator(`h2#${id}`)).toBeVisible();
  }
});

test("opt-in legacy CSS supplies tokens, controls and the consumer-owned mono font", async ({ page }) => {
  await page.goto("/patterns/content/");
  await page.setContent('<html data-brand="a" data-mode="light"><head><link rel="stylesheet" href="/vendor/ui-foundations/legacy.css"><link rel="stylesheet" href="/assets/brand-fonts.css"></head><body><button class="uif-button solid">Action</button><textarea class="uif-textarea uif-code uif-code-grid" wrap="off">╭────╮\n│    │\n╰────╯</textarea></body></html>');
  await page.evaluate(async () => { await document.fonts.load('16px "DejaVu Sans Mono"'); await document.fonts.ready; });
  const result = await page.locator("textarea").evaluate(element => {
    const style = getComputedStyle(element), canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    ctx.font = '32px "DejaVu Sans Mono"';
    return { token: getComputedStyle(document.documentElement).getPropertyValue("--uif-semantic-color-border-default").trim(), family: style.fontFamily, widths: ["╭────╮", "│    │", "╰────╯"].map(row => ctx.measureText(row).width), lineHeight: style.lineHeight, fontSize: style.fontSize };
  });
  expect(result.token).not.toBe("");
  expect(result.family).toContain("DejaVu Sans Mono");
  expect(new Set(result.widths).size).toBe(1);
  expect(result.lineHeight).toBe(result.fontSize);
  const button = await page.locator("button").evaluate(e => getComputedStyle(e).backgroundColor);
  expect(button).not.toBe("rgba(0, 0, 0, 0)");
});


test("the real docs stage keeps Runtime code colors and the selected mono font", async ({ page }) => {
  await page.goto("/patterns/content/");
  await page.locator("[data-content-variant=code]").click();
  for (const mode of ["light", "dark"]) {
    await page.locator(`[data-hero-mode=${mode}]`).click();
    const values = await page.locator("#content-example pre").evaluate(pre => {
      const marker = document.createElement("span");
      marker.style.backgroundColor = "var(--uif-semantic-color-surface-default)";
      marker.style.color = "var(--uif-semantic-color-content-default)";
      pre.append(marker);
      const actual = getComputedStyle(pre), expected = getComputedStyle(marker);
      const result = { background: actual.backgroundColor, expectedBackground: expected.backgroundColor, color: actual.color, expectedColor: expected.color, font: actual.fontFamily, codeFont: getComputedStyle(pre.querySelector("code")).fontFamily };
      marker.remove();
      return result;
    });
    expect(values.background).toBe(values.expectedBackground);
    expect(values.color).toBe(values.expectedColor);
    expect(values.font).toContain("DejaVu Sans Mono");
    expect(values.codeFont).toContain("DejaVu Sans Mono");
  }
});
