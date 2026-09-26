---
name: seo-article-system
description: Gunakan skill ini saat mengaudit SEO teknis portfolio ini atau merancang/mengimplementasikan fitur Artikel/Blog yang belum ada di kodebase. Aktif untuk permintaan seperti "audit SEO", "perbaiki sitemap/JSON-LD", "buat fitur artikel/blog", "optimasi meta tag".
---

# SEO Menyeluruh dan Implementasi Fitur Artikel

## Audit SEO Teknis pada Struktur yang Ada

- Verifikasi `sitemap-index.xml` dan `robots.txt` dinamis mencakup seluruh route publik baru (termasuk `/artikel/**` setelah diimplementasikan).
- Verifikasi setiap halaman punya `<title>` dan `meta description` unik (panduan umum: title ±50–60 karakter, description ±150–160 karakter — bukan batas keras resmi Google, verifikasi bila ada perubahan kebijakan).
- Validasi JSON-LD tanpa error via Schema Markup Validator / Rich Results Test sebelum dan sesudah perubahan.
- `canonical` eksplisit di setiap halaman, termasuk halaman dengan parameter filter (mis. filter tag `SelectedWork`), untuk mencegah duplicate content.
- Konsistensi `lang`, `og:locale`, dan `hreflang` bila ke depan ada versi bahasa lain.

## Spesifikasi Fitur Artikel/Blog (Baru)

**Tabel `articles`**: `id`, `slug` (unik, terindeks), `title`, `excerpt`, `body_markdown`, `cover_image_public_id`, `author` (referensi profil, bukan string bebas), `tags`, `reading_time_minutes` (dihitung sekali saat simpan), `status` (draft/published), `published_at`, `updated_at`, `canonical_url_override` (nullable), `og_image_override` (nullable).

**Route**:
- `/artikel` — index berpaginasi (bukan infinite scroll tanpa fallback, agar tetap crawlable).
- `/artikel/[slug]` — JSON-LD `BlogPosting` (headline, datePublished, dateModified, author, image, mainEntityOfPage) + `BreadcrumbList` terpisah.
- `/artikel/rss.xml` — feed seluruh artikel `published`.
- OG image dinamis mengikuti pola `/og/[id].png` yang sudah ada (Satori + Sharp), jangan buat komponen terpisah.
- Reading time, jumlah kata, table of contents otomatis dari heading `body_markdown`.
- Related articles berdasarkan overlap tag, bukan sekadar artikel terbaru.

**Catatan yang wajib diverifikasi ulang sebelum implementasi (kebijakan mesin pencari dapat berubah):**
- Google menghentikan sinyal `rel="next"`/`rel="prev"` untuk paginasi sejak 2019; gunakan `canonical` self-referencing per halaman paginasi, bukan `rel=next/prev`.
- Ambang Core Web Vitals per verifikasi terakhir: LCP baik ≤2,5 detik, INP baik ≤200 ms, CLS baik ≤0,1, diukur pada persentil ke-75 data pengguna nyata (field data CrUX, bukan hanya lab Lighthouse). Rumor pengetatan LCP ke 2 detik **belum** dikonfirmasi dokumentasi resmi Google — jangan jadikan target sampai ada konfirmasi baru.

## Konten Duplikat

- Pastikan `/jasa` dan `ExpertiseMatrix` di homepage tidak saling menduplikasi frasa kunci hingga kanibalisasi; petakan search intent masing-masing halaman secara eksplisit sebelum menulis ulang konten.
