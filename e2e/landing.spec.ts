import { test, expect } from "@playwright/test";

/**
 * Smoke tests that prove the three public surfaces render and the auth
 * form is keyboard-operable. These are NOT trying to be thorough — they
 * catch routing / build / import regressions in CI, nothing more.
 */
test.describe("Public surfaces", () => {
  test("landing hero is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Stop writing grants/i })
    ).toBeVisible();
  });

  test("pricing renders the four org plans", async ({ page }) => {
    await page.goto("/pricing");
    for (const name of ["Starter", "Growth", "Pro", "Organization"]) {
      await expect(
        page.getByRole("heading", { level: 3, name, exact: true })
      ).toBeVisible();
    }
  });

  test("login form inputs are keyboard-operable", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator("#email");
    const password = page.locator("#password");
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await email.focus();
    await expect(email).toBeFocused();
    await password.focus();
    await expect(password).toBeFocused();
  });
});
