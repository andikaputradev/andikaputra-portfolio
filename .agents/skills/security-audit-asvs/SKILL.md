---
name: security-audit-asvs
description: Gunakan skill ini saat mengaudit, mengeraskan (harden), atau meninjau kontrol keamanan portfolio ini (Astro + Neon + Better Auth + Cloudinary + Turnstile). Aktif untuk permintaan seperti "audit keamanan", "perbaiki kerentanan", "harden auth/2FA", "review CSP/header", "buat laporan temuan keamanan". Jangan pernah menyimpulkan sistem "fully secure" secara absolut.
---

# Hardening Keamanan — Level Audit Profesional

## Kerangka Acuan

- **OWASP ASVS 5.0.0** (rilis Mei 2025, versi stabil terkini per pemeriksaan terakhir — verifikasi ulang bila lebih dari beberapa bulan sejak tanggal ini) sebagai checklist verifikasi utama. Target Level 2 untuk keseluruhan aplikasi, Level 3 untuk modul autentikasi dan 2FA.
- **OWASP Top 10** versi terbaru yang dipublikasikan OWASP — verifikasi nomor versi saat implementasi.
- **NIST SP 800-218 (SSDF)** untuk praktik siklus hidup pengembangan aman; **NIST SP 800-53 / NIST CSF** sebagai rujukan kontrol umum.
- **STRIDE** untuk threat modeling per komponen.
- **MITRE ATT&CK/D3FEND** hanya untuk pemetaan deteksi dan mitigasi, tidak pernah untuk instruksi ofensif terhadap sistem pihak ketiga.
- **CVSS v3.1** untuk penilaian keparahan setiap temuan, vektor lengkap dinyatakan, bukan hanya skor angka.

## Threat Model Ringkas (STRIDE per Komponen)

| Komponen | Ancaman Utama | Kontrol yang Diverifikasi |
|---|---|---|
| Better Auth + 2FA | Spoofing (credential stuffing), Elevation of Privilege (bypass 2FA) | Rate limiting login, lockout TOTP, backup code hashing, session fixation prevention |
| Admin CRUD (`/api/admin/**`) | Tampering, Elevation of Privilege | Otorisasi per-request (bukan hanya autentikasi), CSRF double-submit cookie, validasi Zod pada body |
| Contact form publik | Denial of Service, Spoofing (spam) | Turnstile, honeypot, rate limiting per IP, validasi server-side |
| Upload Cloudinary | Tampering (file berbahaya), Information Disclosure | Validasi ulang ke Cloudinary API sebelum simpan `public_id`, pembatasan tipe MIME dan ukuran |
| Cron backup | Repudiation, Spoofing | `CRON_SECRET` constant-time compare, logging akses |
| Endpoint publik (`/api/public/**`) | Information Disclosure | Filter `published=true` konsisten, tidak mengembalikan field internal |

## Checklist Hardening Konkret

- Header keamanan via `vercel.json`: CSP ketat (nonce/hash untuk Alpine.js CSP build, tanpa `unsafe-inline`), HSTS dengan `includeSubDomains`/`preload` setelah dipastikan seluruh subdomain HTTPS, `X-Frame-Options: DENY` atau `frame-ancestors 'none'`, `Permissions-Policy` membatasi API yang tidak dipakai, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Audit secret: pastikan tidak ada API key (Cloudinary, Resend, Turnstile, `CRON_SECRET`, database URL) ter-hardcode atau ter-commit; pindai riwayat git (mis. gitleaks/truffleHog).
- Dependency security: `npm audit` + SCA, hasilkan SBOM (CycloneDX/SPDX), kebijakan update untuk dependensi dengan kerentanan diketahui.
- Rate limiting di level middleware untuk seluruh endpoint publik yang menulis data.
- Validasi Zod `.strict()` pada seluruh route API — tolak field tak dikenal, jangan diamkan.
- Least privilege koneksi database: role runtime tanpa hak `DROP`/`ALTER` pada tabel produksi, role terpisah untuk migrasi.
- Logging aman: `audit_log` dan log aplikasi tidak pernah mencatat password, token sesi, TOTP secret, atau backup code plaintext.
- Backup/recovery: verifikasi backup harian benar-benar dapat direstorasi (uji restorasi berkala).

## Format Laporan Wajib per Temuan

```
Judul temuan:
Komponen terdampak:
Prasyarat eksploitasi:
Dampak:
Tingkat keparahan (CVSS v3.1, vektor lengkap):
Bukti (langkah reproduksi di lingkungan lokal/lab):
Mitigasi yang diterapkan:
Verifikasi perbaikan (test yang membuktikan mitigasi bekerja):
Risiko residual:
```
