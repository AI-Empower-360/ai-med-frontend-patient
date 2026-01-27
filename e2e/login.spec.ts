import { test, expect } from "@playwright/test";

test.describe("Patient Portal - Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login page", async ({ page }) => {
    await expect(page.getByText("Patient Portal")).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/access code/i)).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill("invalid@example.com");
    await page.getByPlaceholder(/access code/i).fill("wrong");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid|error/i)).toBeVisible();
  });

  test("should login successfully with demo mode", async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill("demo@example.com");
    await page.getByPlaceholder(/access code/i).fill("demo123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should redirect to portal
    await expect(page).toHaveURL(/\/portal/);
    await expect(page.getByText(/overview|labs|medications/i)).toBeVisible();
  });

  test("should require email and access code", async ({ page }) => {
    const signInButton = page.getByRole("button", { name: /sign in/i });

    // Try to submit without filling fields
    await signInButton.click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByPlaceholder(/email/i);
    const accessCodeInput = page.getByPlaceholder(/access code/i);

    await expect(emailInput).toBeInvalid();
    await expect(accessCodeInput).toBeInvalid();
  });
});
