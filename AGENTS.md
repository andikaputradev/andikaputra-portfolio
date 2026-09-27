# AGENTS.md — Portfolio wahyuandikaputra.my.id

Berkas ini dibaca otomatis oleh Antigravity CLI (agy) setiap sesi di workspace ini. Simpan di root repositori.

## Konteks Proyek

Portfolio pribadi dengan persona Software Engineer & Cybersecurity Specialist (Web2/Web3), desain "Phosphor Terminal Editorial".

Stack: Astro 7.1.5 (SSR, adapter @astrojs/vercel), Neon Postgres via @neondatabase/serverless 1.1.0 (driver HTTP, **tanpa transaksi native**, diselesaikan via UPSERT `CASE WHEN` atomik), Drizzle ORM 0.45.2, Better Auth 1.6.25 (+twoFactor plugin), Cloudinary (signed upload dari klien), Resend, Cloudflare Turnstile, GSAP + anime.js + Three.js, Swiper, Tiptap, admin htmx + Alpine.js (CSP build, tanpa React/Vue), SortableJS, Tailwind 4.3.2, Satori + Sharp (OG image dinamis), Vitest + Playwright + @axe-core/playwright + @lhci/cli, deploy Vercel Hobby tier + Vercel Cron.

10 tabel aktif: projects, certifications, site_profile, audit_log, page_views, user, session, account, verification, two_factor.

Fitur Artikel/Blog **belum ada** di kodebase saat ini dan perlu dirancang dari nol (lihat skill `seo-article-system`).

## Aturan Mutlak (berlaku di seluruh fase, tanpa pengecualian)

1. Baca `package.json`, `astro.config.mjs`, `drizzle.config.ts`, `schema.ts`, `middleware.ts`, dan seluruh route `/api/**` sebelum membuat perubahan apa pun pada suatu area.
2. Tidak ada placeholder, TODO, atau kode dummy. Setiap perubahan lengkap dan dapat dijalankan.
3. Tidak menyatakan "sudah diuji" atau "sudah aman" tanpa benar-benar menjalankan test suite dan menunjukkan output-nya di laporan.
4. Satu commit per kategori perbaikan (Conventional Commits: `fix:`, `feat:`, `perf:`, `security:`), pesan deskriptif.
5. Tidak menghapus fungsionalitas yang berjalan tanpa menyatakan alasan eksplisit dalam laporan.
6. "Zero bug" dan "full secure" bukan kriteria penerimaan yang bisa diklaim absolut. Gunakan Definition of Done di bagian bawah berkas ini sebagai proksi terukur; laporkan risiko residual, jangan nyatakan nihil.
7. Jalankan `astro check`, ESLint, Vitest, dan Playwright setelah setiap fase, bukan hanya di akhir seluruh pekerjaan.

## Rencana Eksekusi (4 Fase Berurutan)

Jalankan berurutan. Jangan mulai fase berikutnya sebelum fase sebelumnya dilaporkan selesai dengan bukti.

- **Fase 1 — Bug dan Kesalahan Logika**: gunakan skill `bug-logic-audit`.
- **Fase 2 — Hardening Keamanan**: gunakan skill `security-audit-asvs`.
- **Fase 3 — SEO Menyeluruh + Fitur Artikel**: gunakan skill `seo-article-system`.
- **Fase 4 — Optimasi Performa**: gunakan skill `performance-cwv-audit`.

Skill-skill di atas berada di `.agents/skills/` dan akan aktif otomatis saat deskripsinya cocok dengan permintaan; jika tidak aktif otomatis, panggil eksplisit dengan menyebut namanya dalam prompt.

## Definition of Done (kriteria penerimaan pengganti "zero bug / full secure")

1. `astro check`, ESLint, `tsc` tanpa error.
2. Vitest dan Playwright (termasuk axe-core) hijau, laporan cakupan disertakan.
3. Lighthouse CI memenuhi budget pada `/`, `/work/[id]`, `/jasa`, `/artikel`, `/artikel/[slug]`.
4. `npm audit`/SCA tanpa kerentanan High/Critical yang belum dimitigasi atau didokumentasikan sebagai risiko diterima.
5. JSON-LD tervalidasi tanpa error pada seluruh tipe halaman.
6. Setiap temuan keamanan dilaporkan dengan format pada skill `security-audit-asvs`.
7. Tidak ada secret baru ter-commit (verifikasi dengan pemindaian riwayat git).
8. Ringkasan perubahan per fase tersedia untuk ditinjau manusia sebelum deploy produksi.

## Format Laporan Wajib per Fase

```
Fase:
Tindakan yang dilakukan:
Bukti (output test/log/screenshot):
Temuan yang belum selesai / butuh keputusan manusia:
Risiko residual:
```

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, ask the user when antislop applies: during the work, or after it is done.
To update antislop later: download `antislop.md` again, or run `npx antislop-ai --update` if it was installed as skill folders.
<!-- antislop:end -->

