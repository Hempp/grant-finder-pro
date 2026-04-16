import { test, expect } from "@playwright/test";

test.describe("Trust & legal pages", () => {
  test("/trust renders security controls", async ({ page }) => {
    await page.goto("/trust");
    await expect(
      page.getByRole("heading", { level: 1, name: /Security.*trust/i })
    ).toBeVisible();
    await expect(page.getByText("Encryption in transit")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Subprocessors" })
    ).toBeVisible();
  });

  test("/dpa renders the data processing agreement", async ({ page }) => {
    await page.goto("/dpa");
    await expect(
      page.getByRole("heading", { level: 1, name: /Data Processing Agreement/i })
    ).toBeVisible();
    // Check a specific section heading instead of a word that appears
    // in every paragraph.
    await expect(
      page.getByRole("heading", { name: "2. Roles and Scope" })
    ).toBeVisible();
  });

  test("/trust links to /dpa", async ({ page }) => {
    await page.goto("/trust");
    const dpaLink = page.getByRole("link", { name: /Data Processing Agreement/i });
    await expect(dpaLink).toBeVisible();
    await dpaLink.click();
    await expect(page).toHaveURL(/\/dpa/);
  });
});

test.describe("Invitation accept page", () => {
  test("shows error for missing token", async ({ page }) => {
    await page.goto("/invite/accept");
    await expect(
      page.getByText(/invitation link is incomplete/i)
    ).toBeVisible();
  });

  test("shows error for invalid token", async ({ page }) => {
    await page.goto("/invite/accept?token=bogus_token_12345");
    await expect(
      page.getByText(/invalid or has expired/i)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Footer links", () => {
  test("footer contains Trust and DPA links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Trust" })).toBeVisible();
    await expect(page.getByRole("link", { name: "DPA" })).toBeVisible();
  });
});
