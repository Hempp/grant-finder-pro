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

  test("comparison table renders all four columns", async ({ page }) => {
    await page.goto("/");
    const table = page.locator("section#compare table");
    await expect(table.locator("thead th").nth(1)).toContainText("GrantPilot");
    await expect(table.locator("thead th").nth(2)).toContainText("Instrumentl");
    await expect(table.locator("thead th").nth(3)).toContainText("Submittable");
    await expect(table.locator("thead th").nth(4)).toContainText("Consultants");
  });

  test("pricing renders the two audience cards", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section#pricing");
    await expect(section.getByRole("heading", { level: 3, name: "For organizations" })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3, name: "For students" })).toBeVisible();
  });

  test("pre-launch panel CTA links to signup", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Join the launch list/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/signup");
  });
});
