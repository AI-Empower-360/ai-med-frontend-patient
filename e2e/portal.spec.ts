import { test, expect } from "@playwright/test";

test.describe("Patient Portal - Portal Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Login first (assuming demo mode is enabled)
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("demo@example.com");
    await page.getByPlaceholder(/access code/i).fill("demo123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/portal/);
  });

  test("should display portal overview", async ({ page }) => {
    await expect(page.getByText(/overview|labs|medications/i)).toBeVisible();
  });

  test("should navigate to labs page", async ({ page }) => {
    await page.getByRole("link", { name: /labs/i }).click();
    await expect(page).toHaveURL(/\/portal\/labs/);
    await expect(page.getByText(/lab results/i)).toBeVisible();
  });

  test("should navigate to medications page", async ({ page }) => {
    await page.getByRole("link", { name: /medications/i }).click();
    await expect(page).toHaveURL(/\/portal\/medications/);
    await expect(page.getByText(/medications/i)).toBeVisible();
  });

  test("should navigate to appointments page", async ({ page }) => {
    await page.getByRole("link", { name: /appointments/i }).click();
    await expect(page).toHaveURL(/\/portal\/appointments/);
    await expect(page.getByText(/appointments/i)).toBeVisible();
  });

  test("should navigate to summaries page", async ({ page }) => {
    await page.getByRole("link", { name: /summaries/i }).click();
    await expect(page).toHaveURL(/\/portal\/summaries/);
    await expect(page.getByText(/summaries/i)).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
