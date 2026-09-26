---
name: bug-logic-audit
description: Gunakan skill ini saat mengaudit atau memperbaiki bug dan kesalahan logika pada portfolio Astro/Neon/Better Auth ini — termasuk race condition, partial write, kebocoran draft ke endpoint publik, atau integritas audit log. Aktif untuk permintaan seperti "cari bug", "perbaiki logika", "audit kode", "kenapa data tidak konsisten".
---

# Audit Bug dan Kesalahan Logika

## Area Berisiko Tinggi (Wajib Diperiksa)

- **Operasi database via Neon HTTP driver.** Driver ini tidak mendukung transaksi native; setiap operasi multi-statement (mis. update `displayOrder` untuk banyak baris saat drag-reorder) wajib memakai UPSERT `CASE WHEN` atomik atau prosedur SQL tunggal. Tandai sebagai bug kritis bila ditemukan operasi multi-statement tanpa atomisitas terjaga.
- **Drag-reorder `displayOrder` (SortableJS + htmx).** Periksa penanganan concurrent reorder dari dua sesi admin berbeda; pastikan strategi locking (optimistic lock atau last-write-wins) dinyatakan eksplisit dalam kode, bukan implisit.
- **Filter `published` vs `draft`.** Seluruh query publik (`/api/public/projects`, `/api/public/certifications`, sitemap generator, OG image generator) wajib memfilter `published = true` secara konsisten. Kebocoran draft ke endpoint publik adalah bug kritis sekaligus celah keamanan (information disclosure) — laporkan ke skill `security-audit-asvs` juga bila ditemukan.
- **Better Auth + 2FA + backup codes.** Verifikasi: penonaktifan 2FA memerlukan re-autentikasi, backup codes di-hash (bukan plaintext), backup code ditandai "used" setelah sekali pakai, session tidak tetap valid setelah password diganti, `disableSignUp: true` juga diberlakukan di level middleware.
- **Audit log.** Pencatatan audit log dan operasi yang diaudit harus berada dalam satu unit kerja yang sama; audit log yang gagal tercatat karena error terpisah dari operasi utama adalah bug integritas.
- **Upload Cloudinary via signed URL klien.** Verifikasi signature/expiry benar-benar divalidasi di server sebelum `public_id` disimpan ke DB.
- **Generator OG image (Satori + Sharp) dan sitemap dinamis.** Periksa penanganan karakter khusus di title/slug, proyek tanpa cover image, dan potensi kebutuhan paginasi sitemap jika URL bertambah banyak.
- **Cron backup harian.** Periksa idempotensi (backup ganda saat re-trigger), autentikasi `CRON_SECRET` dengan constant-time comparison, dan penanganan kegagalan (retry/alerting), bukan silent fail.

## Metodologi

1. TypeScript strict mode aktif, `astro check` nol error sebelum lanjut.
2. ESLint memblokir `any` implisit dan floating promises.
3. Validasi Zod eksplisit pada seluruh boundary (form, route param, query string, header) — tidak ada input yang dipercaya tanpa validasi.
4. Property-based test untuk logika non-trivial (mis. perhitungan `displayOrder`, reading time artikel).

## Format Laporan per Temuan

```
Lokasi (file:baris):
Deskripsi bug:
Skenario pemicu:
Perbaikan yang diterapkan:
Test yang membuktikan perbaikan bekerja:
```
