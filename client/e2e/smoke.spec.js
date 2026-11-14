import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("landing explains the product honestly", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /money made clear/i })).toBeVisible();
    await expect(page.getByText(/Aurora testnet/i).first()).toBeVisible();
    await expect(page.getByText(/No recovery phrases, ever/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /start learning free/i })).toBeVisible();
  });

  test("register page has accessible fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
    await expect(page.getByLabel(/your first name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/create a password/i)).toBeVisible();
  });

  test("login page links to registration", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await page.getByRole("link", { name: /create a free account/i }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
  });

  test("unknown routes are calm and useful", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText(/page not found/i)).toBeVisible();
    await expect(page.getByText(/your money is safe/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /back to start/i })).toBeVisible();
  });

  test("protected pages redirect a signed-out visitor", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
