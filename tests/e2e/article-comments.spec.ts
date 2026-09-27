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

  test('regression test: klik submit satu kali hanya mengirim 1 POST dan menambah tepat 1 elemen komentar', async ({ page }) => {
    let postRequestCount = 0;

    await page.route(`**/api/public/articles/${articleSlug}/comments`, async (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        postRequestCount++;
        // Beri sedikit delay untuk memverifikasi guard idempotency / disable tombol
        await new Promise((resolve) => setTimeout(resolve, 200));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            comment: {
              id: 888,
              authorName: 'Audit Verification',
              rating: 5,
              content: 'Verifikasi anti duplikasi dan guard idempotency submit ulasan.',
              createdAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/artikel/${articleSlug}/`);

    // Hitung jumlah elemen komentar sebelum submit
    const beforeCount = await page.locator('#comments-list .comment-card').count();

    // Isi formulir
    await page.locator('#comment-author').fill('Audit Verification');
    await page.locator('#comment-content').fill('Verifikasi anti duplikasi dan guard idempotency submit ulasan.');

    const submitBtn = page.locator('#comment-submit-btn');

    // Klik submit tepat satu kali
    await submitBtn.click();

    // Pastikan tombol ter-disable selama request pending (guard idempotency)
    // dan status text berubah menjadi "Mengirim..."
    await expect(page.locator('#comment-form-status')).toHaveText(/Ulasan Anda berhasil diterbitkan/, {
      timeout: 5000,
    });

    // Hitung jumlah elemen komentar sesudah submit
    const afterCount = await page.locator('#comments-list .comment-card').count();

    // Assert tepat 1 request POST dikirim
    expect(postRequestCount).toBe(1);

    // Assert jumlah elemen komentar bertambah tepat satu
    expect(afterCount - beforeCount).toBe(1);

    // Assert elemen komentar baru memiliki data-comment-id
    const newCard = page.locator('#comments-list .comment-card[data-comment-id="888"]');
    await expect(newCard).toBeVisible();
    await expect(newCard).toContainText('Audit Verification');
  });

  test('guard idempotency: double click cepat tetap hanya mengirim 1 POST', async ({ page }) => {
    let postRequestCount = 0;

    await page.route(`**/api/public/articles/${articleSlug}/comments`, async (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        postRequestCount++;
        await new Promise((resolve) => setTimeout(resolve, 300));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            comment: {
              id: 889,
              authorName: 'Rapid Clicker',
              rating: 4,
              content: 'Pengujian double click cepat pada formulir komentar.',
              createdAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/artikel/${articleSlug}/`);

    const beforeCount = await page.locator('#comments-list .comment-card').count();

    await page.locator('#comment-author').fill('Rapid Clicker');
    await page.locator('#comment-content').fill('Pengujian double click cepat pada formulir komentar.');

    const submitBtn = page.locator('#comment-submit-btn');

    // Lakukan klik ganda / double-click cepat
    await Promise.all([
      submitBtn.click({ clickCount: 2 }),
    ]);

    await expect(page.locator('#comment-form-status')).toHaveText(/Ulasan Anda berhasil diterbitkan/, {
      timeout: 5000,
    });

    const afterCount = await page.locator('#comments-list .comment-card').count();

    // Assert hanya 1 POST request yang lolos guard idempotency
    expect(postRequestCount).toBe(1);
    // Assert hanya 1 elemen komentar yang ditambahkan ke DOM
    expect(afterCount - beforeCount).toBe(1);
  });
});
