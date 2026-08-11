import { test, expect } from '@playwright/test';

test.describe('Project detail navigation', () => {
  test('navigates from a grid card to its detail page', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('[data-project-grid] [data-project-card]').first();
    const cardTitle = await firstCard.locator('.project-card__title').textContent();

    await firstCard.locator('a').click();

    await expect(page).toHaveURL(/\/work\/[a-z0-9-]+\/?$/);
    await expect(page.locator('h1')).toHaveText(cardTitle ?? '');
  });

  test('detail page renders tag badge, stack, and published date', async ({ page }) => {
    await page.goto('/work/darkstar-tools/');

    await expect(page.locator('h1')).toHaveText('DarkStar Tools');
    await expect(page.locator('.tag-badge--security')).toBeVisible();
    await expect(page.locator('.project-detail__published')).toHaveText('January 2024');
  });

  test('detail page for a non-flagship project omits the stack section when empty', async ({
    page,
  }) => {
    await page.goto('/work/viddey/');

    await expect(page.locator('h1')).toHaveText('Viddey');
    await expect(page.locator('.project-detail__stack-list')).toHaveCount(0);
  });

  test('back to work link returns to the homepage work section', async ({ page }) => {
    await page.goto('/work/darkstar-tools/');

    await page.locator('.project-detail__back').click();

    await expect(page).toHaveURL(/\/#work$/);
  });
});
