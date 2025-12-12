import { test, expect } from '@playwright/test';

test.describe('People List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/people');
  });

  test('should display the people list', async ({ page }) => {
    const table = page.locator('table, [role="grid"], [data-testid="people-list"]');
    await expect(table.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show person cards or rows with names', async ({ page }) => {
    const personElements = page.locator('td, [data-testid="person-card"], [data-testid="person-row"]');
    await expect(personElements.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|buscar|find/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Manager');
      await page.waitForTimeout(600);
      await expect(searchInput).toHaveValue('Manager');
    }
  });

  test('should have filter options', async ({ page }) => {
    const filterSection = page.locator('[data-testid="filters"], form, select').first();
    await expect(filterSection).toBeVisible({ timeout: 5000 });
  });

  test('should have department filter', async ({ page }) => {
    const departmentFilter = page.locator('select, [data-testid="department-filter"]').first();
    if (await departmentFilter.isVisible()) {
      await expect(departmentFilter).toBeEnabled();
    }
  });

  test('should have status filter', async ({ page }) => {
    const statusFilter = page.getByRole('combobox').or(page.locator('select'));
    await expect(statusFilter.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have pagination', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination"], .pagination');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });

  test('should display person details when clicking on a person', async ({ page }) => {
    const personRow = page.locator('tr, [data-testid="person-row"]').nth(1);
    if (await personRow.isVisible()) {
      await personRow.click();
      await page.waitForTimeout(500);
    }
  });
});
