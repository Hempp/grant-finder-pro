import { test, expect } from "@playwright/test";

test.describe("Pricing page", () => {
  test("all four org plan cards render", async ({ page }) => {
    await page.goto("/pricing");
    for (const plan of ["Starter", "Growth", "Pro", "Organization"]) {
      await expect(
        page.getByRole("heading", { level: 3, name: plan, exact: true })
      ).toBeVisible();
    }
  });

  test("annual toggle changes displayed prices", async ({ page }) => {
    await page.goto("/pricing");
    // The annual button contains "Annual" + "Save up to" badge text,
    // so target via aria-pressed to avoid multi-match.
    const annualBtn = page.locator("button", { hasText: "Annual" }).first();
    if (await annualBtn.isVisible()) {
      const proBefore = await page.locator("#plan-pro").textContent();
      await annualBtn.click();
      await page.waitForTimeout(300);
      const proAfter = await page.locator("#plan-pro").textContent();
      expect(proBefore).not.toEqual(proAfter);
    }
  });

  test("?plan=pro deep link scrolls and highlights Pro card", async ({ page }) => {
    await page.goto("/pricing?plan=pro");
    const proCard = page.locator("#plan-pro");
    await expect(proCard).toBeVisible();
    const classes = await proCard.getAttribute("class");
    expect(classes).toContain("ring-2");
  });

  test("team seat counts displayed on Pro and Organization", async ({ page }) => {
    await page.goto("/pricing");
    // Use .first() because the feature may appear in both the card
    // and a comparison table — we just need at least one visible.
    await expect(
      page.getByText(/up to 3 team members/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/up to 10 team members/i).first()
    ).toBeVisible();
  });
});
