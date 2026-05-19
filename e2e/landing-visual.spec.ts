import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 1024, height: 1366 },
  { name: "desktop", width: 1920, height: 1080 },
];

test.describe("Landing visual regression", () => {
  for (const v of viewports) {
    test(`landing matches baseline at ${v.name}`, async ({ page }) => {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      // Pause needle deterministically for the snapshot.
      await page.addStyleTag({
        content: `#needle { animation: none !important; transform: rotate(45deg) !important; }`,
      });
      await expect(page).toHaveScreenshot(`landing-${v.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.001,
      });
    });
  }
});
