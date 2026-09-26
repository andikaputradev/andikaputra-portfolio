---
name: performance-cwv-audit
description: Gunakan skill ini saat mengoptimasi performa portfolio ini (Astro + Neon + Cloudinary + Three.js/GSAP). Aktif untuk permintaan seperti "optimasi performa", "perbaiki Core Web Vitals", "percepat loading", "kurangi bundle size".
---

# Optimasi Performa Maksimal

## Target Terukur (Bukan Klaim Kualitatif)

- Core Web Vitals field data (CrUX, bukan hanya lab): LCP ≤2,5 detik, INP ≤200 ms, CLS ≤0,1 pada persentil ke-75, mobile dan desktop dipisah. Verifikasi ulang angka ini ke web.dev/Google Search Central bila sudah lama sejak pemeriksaan terakhir.
- Lighthouse CI budget eksplisit per halaman kunci (`/`, `/work/[id]`, `/jasa`, `/artikel`, `/artikel/[slug]`) dengan gagal-build bila skor performa turun di bawah ambang yang disepakati.
- Bundle size budget per route, khususnya halaman dengan Three.js dan GSAP di hero.

## Tindakan Konkret

- **Rendering strategy**: halaman publik yang kontennya jarang berubah (`/artikel/[slug]` setelah publish, halaman proyek stabil) jadi kandidat prerender/hybrid rendering Astro, bukan SSR penuh tiap request. Admin dan endpoint personalisasi tetap SSR/on-demand.
- **Gambar**: AVIF dengan fallback WebP via transformasi Cloudinary otomatis, `width`/`height` eksplisit atau `aspect-ratio` CSS (anti-CLS), `loading="lazy"` di luar viewport awal, `fetchpriority="high"` pada elemen LCP.
- **Three.js hero**: muat dinamis setelah first paint, fallback statis untuk `prefers-reduced-motion` dan perangkat rendah, batasi pixel ratio di mobile.
- **Font**: `font-display: swap`/`optional`, preload font kritis (Fraunces heading di atas lipatan), subsetting bila memungkinkan.
- **Admin htmx + Alpine.js**: pertahankan filosofi hypermedia-driven (payload JS minimal) — ini keunggulan arsitektur yang sudah ada, jangan diubah ke pendekatan SPA penuh.
- **Caching**: `Cache-Control` agresif + `stale-while-revalidate` untuk aset statis dan halaman publik jarang berubah; `no-store` tetap untuk seluruh `/admin/**`.
- **Database**: audit query N+1, terutama karena driver Neon HTTP tanpa koneksi persisten membuat setiap query punya round-trip sendiri; gabungkan jadi query tunggal (JOIN/batching) bila memungkinkan.

## Bukti yang Wajib Dilampirkan

Tunjukkan angka LCP/INP/CLS (atau proksi lab Lighthouse bila field data belum cukup sampel) sebelum dan sesudah perubahan pada setiap halaman kunci — bukan hanya pernyataan "sudah dioptimasi".
