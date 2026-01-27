import { test, expect } from "@playwright/test";

test.describe("Patient Portal - Labs Page", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("demo@example.com");
    await page.getByPlaceholder(/access code/i).fill("demo123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/portal/);

    // Navigate to labs
    await page.getByRole("link", { name: /labs/i }).click();
    await page.waitForURL(/\/portal\/labs/);
  });

  test("should display labs page", async ({ page }) => {
    await expect(page.getByText(/lab results/i)).toBeVisible();
  });

  test("should search labs", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search labs/i);
    await searchInput.fill("Hemoglobin");
    await expect(searchInput).toHaveValue("Hemoglobin");
  });

  test("should filter labs by date range", async ({ page }) => {
    // Click date range filter
    await page.getByRole("button", { name: /date range/i }).click();
    
    // Set date range (if date inputs are visible)
    const dateInputs = page.locator('input[type="date"]');
    if (await dateInputs.count() > 0) {
      await dateInputs.first().fill("2024-01-01");
    }
  });

  test("should export labs to PDF", async ({ page }) => {
    // Wait for labs to load
    await page.waitForSelector('text=/lab|test/i', { timeout: 5000 });

    // Click export PDF button
    const exportButton = page.getByRole("button", { name: /export pdf/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();
      // PDF download should be triggered (hard to verify without file system access)
    }
  });

  test("should print labs", async ({ page }) => {
    // Mock window.print
    await page.addInitScript(() => {
      window.print = () => {};
    });

    const printButton = page.getByRole("button", { name: /print/i });
    if (await printButton.isVisible()) {
      await printButton.click();
    }
  });
});
