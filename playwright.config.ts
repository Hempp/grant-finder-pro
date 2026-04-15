import { defineConfig, devices } from "@playwright/test";

/**
 * Minimum-viable Playwright config.
 *
 * Starts `npm run dev` on 3000 automatically, runs the smoke tests under
 * `e2e/`, and writes an HTML report. Intentionally single-browser
 * (Chromium) to keep CI cheap — add Firefox/WebKit when a specific
 * regression demands cross-browser verification.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
