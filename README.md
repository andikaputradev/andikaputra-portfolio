# Wahyu Andika Putra | Portfolio

<p align="center">
  <img src="https://img.shields.io/badge/Astro-7.x-BC52EE?style=for-the-badge&logo=astro&logoColor=white" alt="Astro">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Three.js-WebGPU%2FTSL-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/GSAP-3.x-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22.12.0-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/Database-Neon%20Postgres-00E599?style=flat-square&logo=postgresql&logoColor=white" alt="Neon Postgres">
  <img src="https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=flat-square" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/Auth-Better%20Auth%20%2B%202FA-FF6B6B?style=flat-square" alt="Better Auth">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License">
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/andikaputradev/andikaputra-portfolio?style=flat-square" alt="Last Commit">
  <img src="https://img.shields.io/github/issues/andikaputradev/andikaputra-portfolio?style=flat-square" alt="Open Issues">
  <img src="https://img.shields.io/github/stars/andikaputradev/andikaputra-portfolio?style=flat-square" alt="Stars">
  <img src="https://visitor-badge.laobi.icu/badge?page_id=andikaputradev.andikaputra-portfolio" alt="Visitor Count">
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=astro,ts,threejs,tailwind,postgres,vercel,nodejs,git,github" alt="Tech stack icons">
</p>

<p align="center">
  <b>Editorial premium bertemu bahasa visual terminal operasi keamanan.</b><br>
  Portfolio production-grade dengan CMS admin custom, autentikasi dua faktor, dan rendering 3D berbasis WebGPU.
</p>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi dan Setup Lokal](#instalasi-dan-setup-lokal)
- [Environment Variables](#environment-variables)
- [Perintah Tersedia](#perintah-tersedia)
- [Autentikasi Admin dan 2FA](#autentikasi-admin-dan-2fa)
- [Kontrak API Admin](#kontrak-api-admin)
- [Pengujian](#pengujian)
- [Deployment](#deployment)
- [Keamanan](#keamanan)
- [Batasan Diketahui](#batasan-diketahui)
- [Status Proyek dan Tindakan Tersisa](#status-proyek-dan-tindakan-tersisa)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)
- [Kontak](#kontak)
- [Ucapan Terima Kasih](#ucapan-terima-kasih)

---

## Tentang Proyek

Portfolio pribadi dengan filosofi desain **Phosphor Terminal Editorial**: tipografi dan grid editorial premium disilangkan dengan bahasa visual terminal operasi keamanan (telemetry strip, monospace accent, status indicator). Situs dibangun hybrid, lima library dengan tanggung jawab spesifik masing-masing (Astro untuk struktur dan rendering, GSAP dan Anime.js untuk animasi, Three.js untuk elemen 3D, Swiper untuk carousel), bukan satu framework monolitik yang dipaksa menangani semua kebutuhan.

Proyek berkembang dalam dua tahap:

- **Fase 0 (situs statis):** 9 studi kasus proyek dikelola sebagai Astro Content Collection berbasis Markdown, contact form dengan validasi dan proteksi bot, OG image dinamis, dan SEO terstruktur (JSON-LD, sitemap).
- **Fase 1 dan 2 (CMS admin):** konten dimigrasi ke Postgres (Neon) melalui panel admin dengan autentikasi dua faktor, upload aset via Cloudinary, editor rich text, workflow draft/publish, dan drag-and-drop reorder.

## Fitur Utama

**Frontend publik**

- Landing page 7 section (Hero sampai Contact)
- Filter proyek dengan carousel yang terisolasi dari regresi filter (diverifikasi via E2E)
- Theme switcher (light/dark) dengan persistensi
- OG image dinamis per proyek (Satori + Sharp, on-demand)
- Contact form: validasi Zod, proteksi Cloudflare Turnstile, pengiriman via Resend
- SEO terstruktur: JSON-LD, sitemap otomatis (`sitemap-index.xml`)
- Section Certification pada landing page, tampil setelah Expertise Matrix

**CMS admin (Fase 1 dan 2)**

- Login admin dengan 2FA wajib (TOTP + backup codes) via Better Auth
- Upload foto profil dan CV langsung dari `/admin/profile` (Cloudinary)
- Editor rich text (Tiptap) dengan round-trip Markdown
- Workflow **draft** vs **publish** per proyek (`draft_data` JSONB)
- Drag-and-drop reorder untuk daftar proyek dan sertifikasi (bulk update atomik)
- Slug proyek immutable setelah dibuat (tidak dapat diedit dari form)
- Header `noindex` dan `no-store` otomatis di seluruh rute `/admin/**`

## Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Framework | Astro 7 | Static-first, island architecture |
| Bahasa | TypeScript | Strict mode |
| Animasi | GSAP 3, Anime.js v4 | Pembagian tanggung jawab per jenis animasi |
| Render 3D | Three.js (WebGPU / TSL) | Elemen visual signature |
| Carousel | Swiper 14 | Filter proyek |
| Auth | Better Auth + 2FA (TOTP, backup codes) | Panel admin |
| ORM | Drizzle ORM | Migrasi dan query tabel konten |
| Database | Neon Postgres (serverless), driver `neon-http` | Region Singapore direkomendasikan |
| Asset storage | Cloudinary | Foto profil dan CV |
| Email | Resend | Contact form |
| Bot protection | Cloudflare Turnstile | Mode non-interactive direkomendasikan |
| Deployment | Vercel, adapter `@astrojs/vercel`, runtime Node | Bukan Edge runtime |
| Unit test | Vitest | Schema, formatter, telemetry map, CSRF |
| E2E test | Playwright + axe-core | Termasuk audit aksesibilitas |
| CI | GitHub Actions (`quality-gate.yml`) | Gate wajib untuk PR |

## Arsitektur Sistem

```
┌──────────────────────┐      ┌───────────────────────┐      ┌─────────────────────┐
│   Astro Frontend      │      │   API Routes (Node)    │      │   Neon Postgres      │
│   (static + islands)  │◄────►│   /api/contact         │◄────►│   via Drizzle ORM     │
│                        │      │   /api/auth/*          │      │                       │
│   Content Collection   │      │   /api/admin/projects/*│      └─────────────────────┘
│   (arsip referensi)    │      │   /api/og/[id].png     │
└──────────────────────┘      └───────────┬───────────┘
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                  │  Cloudinary  │  │    Resend    │  │  Turnstile   │
                  │  (aset)      │  │  (email)     │  │  (anti-bot)  │
                  └──────────────┘  └──────────────┘  └──────────────┘
```

## Struktur Proyek

```
src/
├── components/
│   ├── layout/          # TelemetryStrip, Nav, ThemeToggle, Footer
│   ├── sections/        # 7 section homepage (Hero sampai Contact)
│   ├── ui/               # TagBadge, MagneticButton, DisclaimerNotice
│   ├── work/             # ProjectCard, ProjectFilter
│   └── seo/              # JsonLd
├── content/projects/     # 9 studi kasus (arsip referensi pasca-migrasi ke DB)
├── data/                 # identity.ts (single source of truth), rd-lab.ts
├── db/
│   └── schema.ts         # Skema Drizzle, termasuk kolom draft_data (JSONB)
├── layouts/               # BaseLayout, ProjectLayout
├── lib/                   # og-image, json-ld, contact-schema, format-date, telemetry-map
├── pages/
│   ├── admin/
│   │   ├── login.astro
│   │   ├── profile.astro
│   │   ├── settings/security.astro
│   │   └── projects/                 # Daftar (drag-reorder) + editor Tiptap
│   ├── api/
│   │   ├── contact.ts                # Hardened: Zod + Turnstile + Resend
│   │   ├── auth/                     # Handler Better Auth
│   │   └── admin/projects/
│   │       ├── [id].ts               # PUT konten (draft/publish)
│   │       ├── [id]/settings.ts      # PATCH field struktural
│   │       ├── reorder.ts
│   │       └── certifications/reorder.ts
│   ├── og/[id].png.ts                # OG image dinamis on-demand
│   └── work/[id].astro               # Detail proyek, static-generated
└── scripts/               # Modul vanilla TS, satu file per animasi/interaksi

drizzle/
├── 0000_melted_sersi.sql   # Migrasi awal Fase 1
└── 0001_orange_king_bedlam.sql  # Kolom draft_data, Fase 2

tests/
├── unit/                   # Vitest
└── e2e/                    # Playwright + axe-core
```

## Prasyarat

- Node.js `>=22.12.0` (lihat `package.json` → `engines`)
- Akun [Neon](https://neon.tech) (Postgres serverless)
- Akun [Cloudinary](https://cloudinary.com)
- Akun [Resend](https://resend.com)
- Akun [Cloudflare](https://dash.cloudflare.com) untuk Turnstile
- Git

## Instalasi dan Setup Lokal

**1. Clone dan install dependensi**

```bash
git clone https://github.com/andikaputradev/andikaputra-portfolio.git
cd andikaputra-portfolio
npm install
```

**2. Provisioning Neon**

Buat project baru, pilih region terdekat (Singapore untuk latensi Indonesia). Salin dua connection string dari dashboard: **pooled** (runtime aplikasi) dan **unpooled/direct** (migrasi). Driver `neon-http` yang dipakai proyek ini kompatibel dengan connection string pooled untuk kedua keperluan, namun simpan keduanya.

**3. Provisioning Cloudinary**

Catat `Cloud Name`, `API Key`, dan `API Secret` dari dashboard utama.

**4. Konfigurasi environment**

```bash
cp .env.example .env
```

Isi seluruh nilai (lihat tabel [Environment Variables](#environment-variables)). Generate `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

`ADMIN_INITIAL_PASSWORD` minimal 12 karakter, divalidasi oleh skrip seed.

**5. Migrasi database**

```bash
npx @better-auth/cli generate   # tabel user/session/account/verification
npm run db:generate              # migrasi tabel konten dari src/db/schema.ts
npm run db:migrate               # eksekusi ke Neon
```

**6. Seed admin dan migrasi konten**

```bash
npm run seed:admin
npm run migrate:content
```

`migrate:content` membaca ulang 9 file Markdown di `src/content/projects/`. Folder ini diarsipkan sebagai referensi, bukan dihapus.

**7. Jalankan secara lokal**

```bash
npm run dev
```

Buka `/admin/login`, masuk dengan `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`, segera aktifkan 2FA di `/admin/settings/security`, lalu ganti password.

> `astro preview` tidak didukung oleh adapter `@astrojs/vercel`. Gunakan `npm run dev` untuk pratinjau lokal, `npm run build` untuk memverifikasi output produksi.

## Environment Variables

| Variable | Scope | Keterangan |
|---|---|---|
| `DATABASE_URL` | Server-only | Connection string Neon, pooled |
| `DATABASE_URL_UNPOOLED` | Server-only | Connection string Neon, direct, untuk migrasi |
| `BETTER_AUTH_SECRET` | Server-only | Generate via `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Server-only | Email login admin awal |
| `ADMIN_INITIAL_PASSWORD` | Server-only | Minimal 12 karakter |
| `CLOUDINARY_CLOUD_NAME` | Server-only | Dashboard Cloudinary |
| `CLOUDINARY_API_KEY` | Server-only | Dashboard Cloudinary |
| `CLOUDINARY_API_SECRET` | Server-only | Dashboard Cloudinary |
| `RESEND_API_KEY` | Server-only | Jangan prefix `PUBLIC_` |
| `TURNSTILE_SECRET_KEY` | Server-only | Jangan prefix `PUBLIC_` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public | Aman diekspos ke client, dipakai widget |

Tanpa `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, dan `PUBLIC_TURNSTILE_SITE_KEY` terisi, situs tetap **build dan deploy dengan sempurna**. Contact form menampilkan pesan error yang jujur ke pengunjung, bukan gagal senyap; widget Turnstile tidak dirender sama sekali, bukan tampil rusak.

Untuk Vercel, seluruh variabel didaftarkan di **Project Settings → Environment Variables**, bukan file `.env` yang ter-commit. Nilai di-inline saat build, sehingga menambah variabel setelah deploy pertama memerlukan redeploy agar berlaku.

## Perintah Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server, `http://localhost:4321` |
| `npm run build` | Build produksi (static + serverless function Vercel) |
| `npm run typecheck` | `astro check`, baseline 0 error |
| `npm run lint` | ESLint (`eslint-plugin-astro`) |
| `npm run test:unit` | Vitest, tidak butuh database |
| `npm run test:e2e` | Playwright, sebagian skenario butuh database live |
| `npm run db:generate` | Generate migrasi baru setelah ubah `src/db/schema.ts` |
| `npm run db:migrate` | Eksekusi migrasi pending ke database |
| `npm run seed:admin` | Buat akun admin (sekali saja) |
| `npm run migrate:content` | Migrasi Markdown existing ke database (idempotent) |

## Autentikasi Admin dan 2FA

Login admin diproses oleh Better Auth dengan 2FA wajib berbasis TOTP dan backup codes:

1. `POST /api/auth/sign-in/email` dengan kredensial admin.
2. Jika 2FA aktif, alur diharapkan mengalihkan ke verifikasi kode (field `twoFactorRedirect`).
3. Setup 2FA melalui `POST /api/auth/two-factor/enable`, diharapkan mengembalikan `totpURI` (untuk aplikasi authenticator) dan `backupCodes`.

Bentuk respons pada poin 2 dan 3 **belum diverifikasi terhadap instance Better Auth live** karena proses pengembangan tidak memiliki akses database live. Jika bentuk respons riil berbeda, sesuaikan `src/pages/admin/login.astro` dan `src/pages/admin/settings/security.astro`.

## Kontrak API Admin

Fase 2 mengubah kontrak endpoint proyek. Perhatikan sebelum melakukan integrasi lanjutan:

- `PUT /api/admin/projects/[id]` berubah bentuk body dari objek datar menjadi `{ saveMode: 'draft' | 'publish', data: {...} }`, dan **hanya** menangani field konten: `title`, `summary`, `bodyMarkdown`, `liveUrl`, `andikaputra-portfolioUrl`.
- Field struktural (`tag`, `schemaType`, `flagship`, `stack`, `cover`, `published`) dipisah ke `PATCH /api/admin/projects/[id]/settings`.
- `displayOrder` tidak lagi diedit manual. Satu-satunya cara mengubahnya adalah drag-and-drop di halaman daftar, yang memanggil `POST /api/admin/projects/reorder` atau `.../certifications/reorder` (bulk update atomik).
- Slug proyek **immutable** setelah dibuat, tidak ada field slug pada form edit.

## Pengujian

**Unit (`tests/unit/`):** fungsi murni, mencakup Zod schema, CSRF, telemetry mapper, formatter tanggal. Tidak membutuhkan database.

**E2E (`tests/e2e/`):** persistensi theme, filter proyek (termasuk regresi carousel-tidak-terpengaruh-filter), contact form (mocked), navigasi detail proyek, axe-core accessibility scan, autentikasi admin. Sebagian skenario pada `tests/e2e/admin-auth.spec.ts` membutuhkan database live.

**CI (`.github/workflows/quality-gate.yml`):** typecheck, lint, unit test, dan build sebagai gate wajib pull request. E2E dan Lighthouse CI berjalan paralel setelahnya.

**Verifikasi migrasi database:** skema Fase 1 dan 2 telah diterapkan dan diuji terhadap instance PostgreSQL 16 lokal (bukan Neon): struktur tabel, bulk-reorder atomik, round-trip `draft_data` JSONB, dan constraint unique slug. Verifikasi lokal ini menangkap satu bug nyata: interpolasi `SET "table"."column"` yang dihasilkan Drizzle secara naif ternyata invalid di PostgreSQL, harus menggunakan `sql.identifier()` untuk kolom tanpa kualifikasi tabel. Verifikasi ini tidak menggantikan kebutuhan menjalankan migrasi sungguhan ke Neon.

## Deployment

1. Push andikaputra-portfoliository ke GitHub.
2. Import project di Vercel, adapter `@astrojs/vercel` terdeteksi otomatis, pastikan runtime function **Node** (bukan Edge).
3. Isi seluruh environment variable pada tabel di atas sebelum trigger deploy pertama.
4. Verifikasi `/sitemap-index.xml` dan `/robots.txt` dapat diakses.
5. Validasi JSON-LD via Google Rich Results Test menggunakan URL live.
6. Jalankan Lighthouse (Chrome DevTools atau PageSpeed Insights): target Performance ≥ 95, Accessibility/Best Practices/SEO = 100.

**Checklist pasca-deploy:**

- [ ] `/admin/**` mengembalikan header `noindex` dan `no-store` (cek via `curl -I`)
- [ ] Upload foto profil dan CV berhasil dari `/admin/profile`
- [ ] Foto muncul di Hero, tombol CV mengarah ke file yang benar
- [ ] Section Certification muncul di landing setelah Expertise Matrix
- [ ] `GET /sitemap-index.xml` memuat seluruh proyek published + `/jasa`
- [ ] `npm audit` tanpa kerentanan severity high/critical
- [ ] Contact form terdegradasi dengan pesan jujur bila env var belum lengkap
- [ ] Widget Turnstile tidak tampil rusak saat env var belum diisi

## Keamanan

Lapisan yang sudah diterapkan: validasi input via Zod pada seluruh endpoint publik dan admin, proteksi bot via Cloudflare Turnstile pada contact form, 2FA wajib (TOTP + backup codes) untuk akses admin, header `noindex` dan `no-store` pada seluruh rute `/admin/**`, dan CSRF protection yang tercakup dalam unit test. Detail konfigurasi ada pada `vercel.json` dan `src/pages/api/contact.ts`.

Keamanan adalah proses mitigasi berkelanjutan, bukan status absolut. Konfigurasi di atas mengurangi permukaan serangan yang umum (injection, CSRF, bot abuse, unauthorized admin access) namun tidak menggantikan audit keamanan independen sebelum peluncuran produksi, khususnya terhadap alur autentikasi admin dan endpoint upload aset.

## Batasan Diketahui

- **`npm audit`:** dependensi produksi 0 kerentanan. `@lhci/cli` (dev-only) membawa 5 temuan pada rantai dependensi transitif (`tmp`, `uuid`); jalur kode rentan hanya aktif pada mode CLI interaktif yang tidak pernah dipicu penggunaan CI otomatis. Tidak memengaruhi situs yang di-deploy.
- **Kontras warna, reduced-motion, estimasi Lighthouse:** diverifikasi matematis (kontras WCAG dihitung presisi via konversi OKLCH ke sRGB) dan via analisis kode, bukan pengujian visual manual di browser sungguhan. Disarankan verifikasi tambahan via DevTools emulation sebelum deploy final.
- **Bentuk respons Better Auth** (`twoFactorRedirect`, `totpURI`, `backupCodes`): belum diuji terhadap instance live, lihat [Autentikasi Admin dan 2FA](#autentikasi-admin-dan-2fa).
- **Round-trip `@tiptap/markdown`** untuk 9 proyek hasil migrasi Fase 1: belum diverifikasi dengan konten nyata. Buka setiap proyek di editor pasca-migrasi dan pastikan tidak ada konten yang hilang atau berubah.

## Status Proyek dan Tindakan Tersisa

| # | Item | Status | Keterangan |
|---|---|---|---|
| 1 | Domain final | Tertunda | Ganti placeholder di `astro.config.mjs` (`site:`) dan `api/contact.ts` (email `from:`) |
| 2 | Foto profesional | Selesai via CMS | Upload melalui `/admin/profile` |
| 3 | Screenshot 9 proyek | Tertunda | Capture manual, simpan di `public/assets/projects/{id}/cover.jpg` |
| 4 | Live URL dan andikaputra-portfolio URL per proyek | Dapat diedit via admin | Field konten pada editor, bukan lagi file Markdown |
| 5 | Stack riil Viddey dan Akademi Crypto | Tertunda | Field struktural, konfirmasi lalu update via `PATCH .../settings` |
| 6 | Sertifikasi (badge kredensial) | Selesai via CMS | Section Certification aktif di landing |
| 7 | Google Search Console | Tertunda | Daftarkan properti, verifikasi DNS TXT, submit sitemap manual |
| 8 | Resend API key | Tertunda | Daftar di resend.com, isi `RESEND_API_KEY` |
| 9 | Cloudflare Turnstile | Tertunda | Mode non-interactive direkomendasikan |
| 10 | Neon project | Tertunda | Region Singapore, simpan connection string pooled dan unpooled |
| 11 | Cloudinary account | Tertunda | Cloud Name, API Key, API Secret |
| 12 | Smoke-test bentuk respons 2FA | Tertunda | Lihat [Batasan Diketahui](#batasan-diketahui) |
| 13 | Verifikasi round-trip Tiptap markdown | Tertunda | Lihat [Batasan Diketahui](#batasan-diketahui) |

## Kontribusi

andikaputra-portfoliository ini adalah portfolio pribadi dan tidak dibuka untuk kontribusi kode eksternal. Laporan bug atau saran perbaikan tetap dipersilakan melalui tab **Issues**.

## Lisensi

Kode sumber didistribusikan di bawah **Lisensi MIT** (sesuaikan berkas `LICENSE` bila ketentuan berbeda). Konten personal, studi kasus, dan aset branding tetap menjadi hak cipta pemilik dan tidak termasuk dalam cakupan lisensi kode.

## Kontak

**Wahyu Andika Putra**
Software Engineer & Cybersecurity Specialist

- GitHub: `https://github.com/andikaputradev`
- LinkedIn: `https://linkedin.com/in/wahyu-andika-putra`
- Email: wahyuandikaputra.co.id@gmail.com
- Tiktok: `https://tiktok.com/@andikaputradev`
- Instagram: `https://instagram.com/andikaputradev`
- Instagram: `https://instagram.com/w.andikaputraa`

## Ucapan Terima Kasih

Dibangun dengan [Astro](https://astro.build), [GSAP](https://gsap.com), [Three.js](https://threejs.org), [Swiper](https://swiperjs.com), [Anime.js](https://animejs.com), [Drizzle ORM](https://orm.drizzle.team), [Better Auth](https://www.better-auth.com), [Neon](https://neon.tech), [Cloudinary](https://cloudinary.com), [Resend](https://resend.com), dan [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile).

---

<p align="center">
  <sub>Dibuat dan dirawat oleh Wahyu Andika Putra. Terakhir diperbarui: Agustus 2026.</sub>
</p>