// Bounded real-browser verification config (UIF-VLT ADR:
// decisions/bounded-browser-verification.md). Deliberately minimal and headless,
// Chromium-only for the initial slice. Not a general E2E platform: no visual
// regression, no cross-browser matrix, no Page Objects, no shared fixtures.
const { defineConfig, devices } = require("@playwright/test");

const PORT = Number(process.env.SITE_PORT || 8099);
const BASE_URL = `http://127.0.0.1:${PORT}`;

module.exports = defineConfig({
  testDir: "tests/browser",
  testMatch: /.*\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "artifacts/accessibility/playwright.json" }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node scripts/serve-site.mjs",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
