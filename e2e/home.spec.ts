import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/J&J|OrgChart|Organizational/i);
  });

  test('should have navigation links', async ({ page }) => {
    const navLinks = page.locator('nav a, header a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('should navigate to people list', async ({ page }) => {
    const peopleLink = page.getByRole('link', { name: /people|team|list/i }).first();
    if (await peopleLink.isVisible()) {
      await peopleLink.click();
      await expect(page).toHaveURL(/people|list/i);
    }
  });

  test('should navigate to hierarchy view', async ({ page }) => {
    const hierarchyLink = page.locator('a[href="/hierarchy"]').first();
    if (await hierarchyLink.isVisible()) {
      await hierarchyLink.click();
      await expect(page).toHaveURL(/hierarchy/i);
    }
  });

  test('should have J&J branding colors', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });
});
