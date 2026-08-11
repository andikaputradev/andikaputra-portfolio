import { test, expect } from '@playwright/test';

test.describe('Contact form submission (mocked)', () => {
  test('shows success message on successful mocked submission', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    await page.locator('#contact-name').fill('Test User');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('This is a test message for E2E verification.');
    await page.locator('#contact-form button[type="submit"]').click();

    await expect(page.locator('#contact-form-status')).toHaveText('Message sent — thank you.');
    await expect(page.locator('#contact-form-status')).toHaveAttribute('data-state', 'success');
  });

  test('shows field-specific message under Email on mocked 422 with invalid email', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'validation', fields: { email: ['Invalid email'] } }),
      });
    });

    await page.goto('/');
    await page.locator('#contact-name').fill('Test User');
    await page.locator('#contact-email').fill('fggff@mm.c');
    await page.locator('#contact-message').fill('This is a test message for E2E verification.');
    await page.locator('#contact-form button[type="submit"]').click();

    await expect(page.locator('#contact-email-error')).toHaveText(
      'Please enter a valid email address.',
    );
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-name-error')).toBeEmpty();
    await expect(page.locator('#contact-form-status')).toHaveText(
      'Please correct the highlighted fields.',
    );
    await expect(page.locator('#contact-form-status')).toHaveAttribute('data-state', 'error');
  });

  test('shows verification message when only turnstileToken fails validation', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'validation', fields: { turnstileToken: ['Required'] } }),
      });
    });

    await page.goto('/');
    await page.locator('#contact-name').fill('Test User');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('This is a test message for E2E verification.');
    await page.locator('#contact-form button[type="submit"]').click();

    await expect(page.locator('#contact-form-status')).toHaveText(
      'Please complete the verification challenge above and try again.',
    );
    await expect(page.locator('#contact-email-error')).toBeEmpty();
  });

  test('shows turnstile-specific message on mocked siteverify failure', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'turnstile_failed' }),
      });
    });

    await page.goto('/');
    await page.locator('#contact-name').fill('Test User');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('This is a test message for E2E verification.');
    await page.locator('#contact-form button[type="submit"]').click();

    await expect(page.locator('#contact-form-status')).toHaveText(
      'Security verification failed — reload the page and try again.',
    );
  });

  test('shows generic message on mocked server failure', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'turnstile_unavailable' }),
      });
    });

    await page.goto('/');
    await page.locator('#contact-name').fill('Test User');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('This is a test message for E2E verification.');
    await page.locator('#contact-form button[type="submit"]').click();

    await expect(page.locator('#contact-form-status')).toHaveText(
      'Verification is temporarily unavailable — please email directly instead.',
    );
  });
});
