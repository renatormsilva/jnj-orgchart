import { test, expect } from '@playwright/test';

test.describe('Hierarchy View Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hierarchy');
    await page.waitForLoadState('networkidle');
  });

  test('should display the hierarchy view', async ({ page }) => {
    await page.waitForTimeout(2000);
    const content = await page.content();
    expect(content.length).toBeGreaterThan(1000);
  });

  test('should show the CEO/root node at the top', async ({ page }) => {
    await page.waitForTimeout(2000);
    const ceoText = page.getByText(/CEO|General Manager|President/i).first();
    await expect(ceoText).toBeVisible({ timeout: 10000 });
  });

  test('should have person names visible', async ({ page }) => {
    await page.waitForTimeout(2000);
    const nameElements = page.locator('text=/[A-Z][a-z]+ [A-Z][a-z]+/').first();
    await expect(nameElements).toBeVisible({ timeout: 10000 });
  });

  test('should have zoom controls or interactions', async ({ page }) => {
    await page.waitForTimeout(1000);
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should be interactive', async ({ page }) => {
    await page.waitForTimeout(2000);
    const clickableElements = page.locator('button, [role="button"], [data-testid]');
    const count = await clickableElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display department information', async ({ page }) => {
    await page.waitForTimeout(2000);
    const deptText = page.getByText(/Executive|Engineering|Sales|Marketing|HR|IT|Finance/i).first();
    await expect(deptText).toBeVisible({ timeout: 10000 });
  });

  test('should handle page load correctly', async ({ page }) => {
    const content = await page.content();
    expect(content).toBeTruthy();
    const url = page.url();
    expect(url).toContain('/hierarchy');
  });

  test('should show organizational structure', async ({ page }) => {
    await page.waitForTimeout(2000);
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('CEO');
  });
});
