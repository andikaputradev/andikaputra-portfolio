import { test, expect } from '@playwright/test';

test.describe('Article Comments and Star Reviews Flow (mocked)', () => {
  const articleSlug = 'kepatuhan-uu-pdp-bagi-pengembang-kontrol-teknis';

  test('menampilkan elemen ulasan & formulir rating bintang di halaman artikel', async ({ page }) => {
    await page.goto(`/artikel/${articleSlug}/`);

    const commentsSection = page.locator('#comments-section');
    await expect(commentsSection).toBeVisible();

    await expect(page.locator('#comment-form')).toBeVisible();
    await expect(page.locator('.star-rating-picker')).toBeVisible();
    await expect(page.locator('#comment-author')).toBeVisible();
    await expect(page.locator('#comment-content')).toBeVisible();
    await expect(page.locator('#comment-submit-btn')).toBeVisible();
  });

  test('menampilkan pesan validasi saat submit input tidak lengkap', async ({ page }) => {
    await page.goto(`/artikel/${articleSlug}/`);

    await page.locator('#comment-author').fill('');
    await page.locator('#comment-content').fill('');
    await page.locator('#comment-submit-btn').click();

    await expect(page.locator('#comment-author-error')).toHaveText('Nama minimal 2 karakter');
  });

  test('berhasil mengirim ulasan rating bintang (mocked 201)', async ({ page }) => {
    await page.route(`**/api/public/articles/${articleSlug}/comments`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            comment: {
              id: 999,
              authorName: 'Security Reviewer',
              rating: 5,
              content: 'Pembahasan UU PDP sangat aplikatif bagi engineer Web2 dan Web3.',
              createdAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/artikel/${articleSlug}/`);

    // Pilih rating 5 bintang
    await page.locator('.star-btn[data-star-value="5"]').click();
    await page.locator('#comment-author').fill('Security Reviewer');
    await page.locator('#comment-content').fill('Pembahasan UU PDP sangat aplikatif bagi engineer Web2 dan Web3.');
    await page.locator('#comment-submit-btn').click();

    await expect(page.locator('#comment-form-status')).toHaveText(/Ulasan Anda berhasil diterbitkan/);
    await expect(page.locator('#comments-list')).toContainText('Security Reviewer');
    await expect(page.locator('#comments-list')).toContainText('Pembahasan UU PDP sangat aplikatif bagi engineer Web2 dan Web3.');
  });
});
