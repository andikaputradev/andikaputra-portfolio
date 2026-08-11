import { test, expect } from '@playwright/test';

test.describe('Project filter', () => {
  test('filters grid cards by SECURITY tag', async ({ page }) => {
    await page.goto('/');

    const grid = page.locator('[data-project-grid]');
    const securityButton = page.locator('[data-filter-btn="SECURITY"]');
    await securityButton.click();

    await expect(securityButton).toHaveAttribute('aria-pressed', 'true');

    const visibleCards = grid.locator('[data-project-card]:not(.is-filtered-out)');
    const visibleCount = await visibleCards.count();
    expect(visibleCount).toBeGreaterThan(0);

    for (let i = 0; i < visibleCount; i++) {
      await expect(visibleCards.nth(i)).toHaveAttribute('data-project-tag', 'SECURITY');
    }
  });

  test('shows all grid cards again when ALL filter is reselected', async ({ page }) => {
    await page.goto('/');

    const grid = page.locator('[data-project-grid]');
    await page.locator('[data-filter-btn="WEB3"]').click();
    await page.locator('[data-filter-btn="ALL"]').click();

    const hiddenCards = grid.locator('[data-project-card].is-filtered-out');
    await expect(hiddenCards).toHaveCount(0);
  });

  test('featured carousel remains unaffected by grid filter state', async ({ page }) => {
    await page.goto('/');

    const featuredMotion = page.locator('.selected-work__featured--motion [data-project-card]');
    const countBefore = await featuredMotion.count();

    await page.locator('[data-filter-btn="WEB3"]').click();

    const countAfter = await featuredMotion.count();
    expect(countAfter).toBe(countBefore);

    for (let i = 0; i < countAfter; i++) {
      await expect(featuredMotion.nth(i)).not.toHaveClass(/is-filtered-out/);
    }
  });
});
