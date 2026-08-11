import { test, expect } from '@playwright/test';

/**
 * Catatan eksekusi: test ini memakai page.route() untuk mock endpoint auth,
 * mengikuti pola contact-form.spec.ts. Tetap membutuhkan `astro dev`/`preview`
 * berjalan dengan DATABASE_URL ter-set (boleh dummy tapi syntactically valid)
 * karena middleware memanggil auth.api.getSession() di setiap request ke /admin/**.
 * Jalankan terhadap staging dengan DB nyata untuk verifikasi penuh alur sesi.
 */

test.describe('Admin login flow (mocked)', () => {
  test('menampilkan form login', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#totp-form')).toBeHidden();
  });

  test('menampilkan pesan error pada kredensial salah (mocked 401)', async ({ page }) => {
    await page.route('**/api/auth/sign-in/email', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      });
    });

    await page.goto('/admin/login');
    await page.locator('#email').fill('admin@example.com');
    await page.locator('#password').fill('salah-password');
    await page.locator('#login-form button[type="submit"]').click();

    await expect(page.locator('#login-error')).not.toBeEmpty();
  });

  test('menampilkan step TOTP ketika 2FA aktif (mocked twoFactorRedirect)', async ({ page }) => {
    await page.route('**/api/auth/sign-in/email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ twoFactorRedirect: true }),
      });
    });

    await page.goto('/admin/login');
    await page.locator('#email').fill('admin@example.com');
    await page.locator('#password').fill('password-benar');
    await page.locator('#login-form button[type="submit"]').click();

    await expect(page.locator('#totp-form')).toBeVisible();
    await expect(page.locator('#login-form')).toBeHidden();
  });

  test('redirect ke /admin setelah verifikasi TOTP berhasil (mocked)', async ({ page }) => {
    await page.route('**/api/auth/sign-in/email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ twoFactorRedirect: true }),
      });
    });
    await page.route('**/api/auth/two-factor/verify-totp', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/admin', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Dashboard</h1>' });
    });

    await page.goto('/admin/login');
    await page.locator('#email').fill('admin@example.com');
    await page.locator('#password').fill('password-benar');
    await page.locator('#login-form button[type="submit"]').click();
    await page.locator('#totp-code').fill('123456');
    await page.locator('#totp-form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test('toggle ke mode kode backup mengubah label dan endpoint yang dipanggil', async ({ page }) => {
    await page.route('**/api/auth/sign-in/email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ twoFactorRedirect: true }),
      });
    });

    let calledBackupEndpoint = false;
    await page.route('**/api/auth/two-factor/verify-backup-code', async (route) => {
      calledBackupEndpoint = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/admin', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Dashboard</h1>' });
    });

    await page.goto('/admin/login');
    await page.locator('#email').fill('admin@example.com');
    await page.locator('#password').fill('password-benar');
    await page.locator('#login-form button[type="submit"]').click();

    await page.locator('#toggle-backup-mode').click();
    await expect(page.locator('#totp-code-label')).toHaveText('Kode backup');

    await page.locator('#totp-code').fill('a1b2-c3d4');
    await page.locator('#totp-form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin\/?$/);
    expect(calledBackupEndpoint).toBe(true);
  });
});

test.describe('Proteksi rute admin (butuh environment dengan DB nyata)', () => {
  test.skip('mengarahkan ke /admin/login saat mengakses /admin tanpa sesi', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test.skip('mengembalikan 401 saat mengakses /api/admin/projects tanpa sesi', async ({ request }) => {
    const response = await request.get('/api/admin/projects');
    expect(response.status()).toBe(401);
  });

  test.skip('request ke-61 dalam satu menit ke /api/admin/** mendapat 429 (Fase 4)', async ({ request }) => {
    let lastStatus = 0;
    for (let i = 0; i < 61; i++) {
      const response = await request.get('/api/admin/projects');
      lastStatus = response.status();
    }
    expect(lastStatus).toBe(429);
  });
});

test.describe('Cron backup (Fase 4)', () => {
  test('mengembalikan 401 tanpa header Authorization yang benar', async ({ request }) => {
    const response = await request.get('/api/cron/backup');
    expect(response.status()).toBe(401);
  });

  test('mengembalikan 401 dengan Bearer token yang salah', async ({ request }) => {
    const response = await request.get('/api/cron/backup', {
      headers: { Authorization: 'Bearer token-salah' },
    });
    expect(response.status()).toBe(401);
  });
});
