import { test, expect } from '@playwright/test';

test.describe('Theme toggle persistence', () => {
  test('persists light theme choice after reload', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-theme', 'light');

    await page.locator('[data-theme-toggle]').first().click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('toggles back to dark on second click', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const themeToggle = page.locator('[data-theme-toggle]').first();

    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await themeToggle.click();
    await expect(html).not.toHaveAttribute('data-theme', 'light');
  });
});
