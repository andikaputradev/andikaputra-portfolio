import { test, expect } from '@playwright/test';

/**
 * Butuh environment dengan DATABASE_URL live (lihat catatan di admin-auth.spec.ts) —
 * request-level test terhadap middleware/CSRF tidak bisa di-mock karena keduanya
 * dievaluasi server-side sebelum handler endpoint sempat dipanggil.
 */

test.describe('Keamanan endpoint reorder (butuh environment dengan DB nyata)', () => {
  test.skip('menolak reorder proyek tanpa sesi (401)', async ({ request }) => {
    const response = await request.post('/api/admin/projects/reorder', {
      data: [{ id: 1, displayOrder: 1 }],
    });
    expect(response.status()).toBe(401);
  });

  test.skip('menolak reorder sertifikasi tanpa sesi (401)', async ({ request }) => {
    const response = await request.post('/api/admin/certifications/reorder', {
      data: [{ id: 1, displayOrder: 1 }],
    });
    expect(response.status()).toBe(401);
  });

  test.skip('menolak reorder tanpa header CSRF meski sesi valid (403)', async ({ request }) => {
    const response = await request.post('/api/admin/projects/reorder', {
      data: [{ id: 1, displayOrder: 1 }],
      headers: { Cookie: 'better-auth.session_token=SESSION_VALID_DUMMY' },
    });
    expect(response.status()).toBe(403);
  });

  test.skip('menolak payload reorder kosong (422)', async ({ request }) => {
    const response = await request.post('/api/admin/projects/reorder', {
      data: [],
      headers: { Cookie: 'better-auth.session_token=SESSION_VALID_DUMMY' },
    });
    expect(response.status()).toBe(422);
  });
});
