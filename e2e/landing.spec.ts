import { test, expect } from "@playwright/test";

test.describe("Public surfaces — editorial landing", () => {
  test("hero headline is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Win grants and scholarships/i })
    ).toBeVisible();
  });

  test("FAQ accordion opens and closes", async ({ page }) => {
    await page.goto("/");
    const firstQuestion = page.locator("#faq details").first();
    await expect(firstQuestion).not.toHaveAttribute("open", "");
    await firstQuestion.locator("summary").click();
    await expect(firstQuestion).toHaveAttribute("open", "");
  });

  test("theme toggle persists across reloads", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", {
      name: /Switch to (dark|light)/,
    });
    await toggle.click();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const mode = await page.locator("html").getAttribute("data-theme-mode");
    expect(["dark", "light"]).toContain(mode);
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

  test("nav transitions to frosted state on scroll", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const nav = page.locator("nav").first();
    await expect(nav).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(nav).toHaveAttribute("data-scrolled", "true");
  });
});
