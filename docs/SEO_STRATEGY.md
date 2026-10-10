# SEO Strategy — wahyuandikaputra.my.id

**Entity:** Wahyu Andika Putra (Andika Putra Dev)
**Scope:** White-hat, engineer-centric, zero paid links, zero PBN
**Audit date:** 2026-10-10
**Review cycle:** Quarterly

---

## Current State (Audit Findings)

| Area | Status | Action |
|------|--------|--------|
| Canonical URL | Correct — `astro.config.mjs` sets `site`, BaseLayout emits `<link rel="canonical">` | None |
| `robots.txt` | Correct — `/admin`, `/api` disallowed; major crawlers whitelisted | None |
| Sitemap | Dynamic `/sitemap.xml` covers all published routes; `/sitemap-index.xml` redirects to it | None |
| `X-Robots-Tag` for admin | **Gap** — now fixed via middleware | Done |
| Person schema `sameAs` | Missing Facebook, TikTok | Done |
| Person schema `telephone` / `address` / `geo` | Missing | Done |
| Service schema `address` / `geo` / `telephone` | Missing | Done |
| `@graph` combined entity | Missing — Service could not cross-reference Person | Done |
| `/jasa` H1 keyword match | "Pembuatan Website & Aplikasi..." had no exact keyword | Done |
| OG image attribution | Cards showed no author or domain | Done |
| Instagram handle discrepancy | identity.ts has `w.andikaputraa`; request specified `andikaputradev` | **Needs human confirmation** |

---

## Phase 1: Entity Authority (Knowledge Panel)

### What to do

1. **Google Search Console** — verify `https://wahyuandikaputra.my.id` (meta tag already in `BaseLayout`). Submit `sitemap.xml`. Request indexing for `/`, `/jasa`, `/artikel`.

2. **Google Business Profile** — create a listing for "Andika Putra Dev" with:
   - Category: Software Company / Web Designer
   - Address: Wonosobo, Jawa Tengah 56311
   - Phone: +6287730139582
   - Website: https://wahyuandikaputra.my.id
   - Description: "Jasa pembuatan website dan aplikasi profesional. Full-stack web (Astro, Next.js), Android, security hardening, Web3."

3. **Wikidata** — create a minimal item: `Q` entity for "Wahyu Andika Putra", type Person, occupation Software Engineer, official website, social media links. This helps Google form a Knowledge Panel.

4. **Schema.org validation** — after deploy, run both:
   - [Rich Results Test](https://search.google.com/test/rich-results) on `/jasa`
   - [Schema Markup Validator](https://validator.schema.org) on `/`, `/jasa`, one `/artikel/[slug]`
   - Fix any errors before continuing to Phase 2.

---

## Phase 2: Local SEO (Wonosobo)

Local citations build NAP (Name / Address / Phone) consistency, which Google cross-references with the `address` node in structured data.

### Priority citation targets

| Directory | URL | Type | Priority |
|-----------|-----|------|----------|
| Google Business Profile | maps.google.com | Local listing | Critical |
| Yellow Pages Indonesia | yellowpages.co.id | Business directory | High |
| Kominfo UMKM | kominfo.go.id | Government | High |
| Indonetwork | indonetwork.co.id | B2B directory | Medium |
| Tokopedia (freelance) | tokopedia.com | Marketplace | Medium |
| Sribulancer | sribulancer.com | Freelance directory | Medium |
| Fastwork Indonesia | fastwork.id | Freelance directory | Medium |
| Projects.co.id | projects.co.id | Freelance platform | Medium |

**NAP to use consistently across all citations:**
```
Name:    Wahyu Andika Putra / Andika Putra Dev
Address: Wonosobo, Jawa Tengah 56311, Indonesia
Phone:   +62 877-3013-9582
Email:   wahyuandikaputra.co.id@gmail.com
URL:     https://wahyuandikaputra.my.id
```

Any variation in spacing, country code format, or abbreviation creates NAP inconsistency. Use this exact format everywhere.

---

## Phase 3: Developer Profile Links (Technical Authority)

These are legitimate profile links on high-authority platforms. Each one creates a `sameAs`-aligned citation.

### Profiles to complete or verify

| Platform | URL | Status | What to do |
|----------|-----|--------|------------|
| GitHub | github.com/andikaputradev | Exists | Add website URL in profile. Pin 3 strongest repos. Write detailed READMEs. |
| LinkedIn | linkedin.com/in/wahyu-andika-putra | Exists | Add portfolio URL. List all skills matching target keywords. Request 3+ endorsements from real connections. |
| Dev.to | dev.to | Create | Register, link to blog. Each published article should link back to the site. |
| Hashnode | hashnode.com | Create | Mirror or cross-post articles with `canonical` pointing to the original `/artikel/[slug]` URL. |
| StackOverflow | stackoverflow.com | Create/verify | Complete profile, add website URL. Do not post self-promotional answers. |
| Dicoding | dicoding.com | Create | Indonesian developer platform. High local authority. Add profile + link. |
| Kelas.work | kelas.work | Create | Indonesian tech community. Complete profile. |

### GitHub repository SEO

For each public repository:
1. Write a full `README.md` with: project purpose, tech stack, live demo link (pointing to portfolio), and a "Contact" section linking to `wahyuandikaputra.my.id`.
2. Add `website: https://wahyuandikaputra.my.id` in repository settings.
3. Use descriptive topics/tags (`astro`, `nextjs`, `cybersecurity`, `indonesia`, `wonosobo`).
4. `pinned-repos`: pin the 6 most technically impressive ones.

---

## Phase 4: Content Strategy (Artikel)

The `/artikel` section is the primary topical authority builder. Search intent for commercial queries (jasa pembuatan website) is often preceded by informational queries from the same potential clients.

### Content pillars

| Pillar | Intent | Example titles |
|--------|--------|----------------|
| Web Development | Informational / ToFU | "Berapa biaya jasa pembuatan website 2025?", "Perbedaan landing page dan company profile" |
| Android & Mobile | Informational / ToFU | "Cara publish aplikasi Android ke Play Store: langkah demi langkah", "ASO: cara aplikasi Anda ditemukan di Play Store" |
| Security | Technical / authority | "Cara audit CSP header di website Astro", "5 kerentanan umum di REST API dan cara memitigasinya" |
| Web3 | Technical / authority | "Reentrancy attack: cara kerja dan cara mencegah dalam Solidity", "Checklist audit smart contract sebelum deploy" |
| Local / personal | Trust / authority | "Software engineer Wonosobo: ini cara saya bekerja dengan klien jarak jauh" |

### Internal linking rules

- Every `/artikel/[slug]` must link back to `/jasa` at least once (contextual anchor, not generic "klik di sini").
- The `/jasa` page should not link to individual articles (prevents diluting service-page authority).
- The homepage `/` links to both `/jasa` and `/artikel`.
- Articles in the same pillar should link to each other (topic cluster).

### Publishing cadence

- Minimum: 2 articles per month.
- Do not publish an article unless it is complete: no "coming soon" sections, no placeholder content (antislop C-2, R-38).
- Every article must have: a real `publishedAt` date, real `readingTimeMinutes`, real `tags`, and a real `summary` of 150-160 characters.

---

## Phase 5: Digital PR Outreach

### Guest posting targets (verified Indonesian developer platforms)

| Platform | Domain | Topic fit | Submission |
|----------|--------|-----------|------------|
| Medium Indonesia | medium.com | General dev | Self-publish, canonical to original |
| Dicoding Blog | dicoding.com/blog | Mobile & web dev | Contact editorial team |
| Codepolitan | codepolitan.com | Web dev | Contact editorial team |
| JurnalDev | jurnaldev.com | General dev | Contact editorial team |
| Glints Blog (tech) | glints.com | Career + tech | Contact editorial team |

### Outreach template: Guest post pitch

```
Subject: Kontribusi Artikel Teknis — [Topik Spesifik]

Halo [nama editor],

Saya Wahyu Andika Putra, software engineer dan cybersecurity specialist
berbasis di Wonosobo, Jawa Tengah. Saya tertarik berkontribusi artikel
teknis untuk [nama platform].

Topik yang saya usulkan:
[Judul artikel] — [1-2 kalimat menjelaskan isi dan nilai untuk pembaca]

Latar belakang saya:
- [Pengalaman spesifik yang relevan dengan topik, bukan klaim generik]
- Portfolio: https://wahyuandikaputra.my.id
- GitHub: https://github.com/andikaputradev

Artikel akan ditulis dalam bahasa Indonesia, panjang sekitar [X] kata,
dengan kode contoh yang bisa dijalankan.

Apakah topik ini cocok untuk editorial kalian saat ini?

Hormat saya,
Wahyu Andika Putra
wahyuandikaputra.co.id@gmail.com
+62 877-3013-9582
```

**Rules for outreach:**
- Send one pitch at a time to each platform. Wait for response before following up.
- Do not request a specific anchor text in the bio link. Use `wahyuandikaputra.my.id` naturally.
- Do not submit the same article to two platforms simultaneously.
- If a platform publishes without a canonical tag pointing back to the original, do not publish there again.

---

## Phase 6: AI / LLM Visibility (GEO)

LLMs (ChatGPT, Perplexity, Gemini) cite sources that are: clearly authored, factually specific, structured, and accessible without JavaScript.

### Checks already done

- JSON-LD `Person` and `ProfessionalService` with `sameAs`, `telephone`, `address`, `geo` — done.
- `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended — done.
- All public pages render full HTML server-side (Astro SSR) — done.

### Additional steps

1. **`llms.txt`** — create `public/llms.txt` listing what each section of the site covers. Format:
```
# wahyuandikaputra.my.id

## About
Software engineer dan cybersecurity specialist berbasis di Wonosobo, Jawa Tengah.
Jasa: pembuatan website dan aplikasi (Astro, Next.js, Android), security hardening, smart contract audit.

## Pages
- /: portfolio utama, profil, dan daftar proyek
- /jasa: deskripsi layanan dan cara kerja
- /artikel: tulisan teknis seputar web dev, security, Web3

## Contact
Email: wahyuandikaputra.co.id@gmail.com
WhatsApp: +6287730139582
```

2. **Answer-optimized content** — write at least 2 articles that directly answer a high-intent question in the first paragraph (BLUF format). Example: "Berapa biaya jasa pembuatan website di Indonesia?" should start with a direct price range, not a preamble.

3. **Mention strategy** — post substantive technical replies on Reddit (r/webdev, r/indonesia), Dicoding forum, and Kaskus Tech with genuine answers. Do not include links in the reply body. Include portfolio URL only in profile bio.

---

## Monitoring & KPIs

| Metric | Tool | Target (6 months) |
|--------|------|-------------------|
| Google Search Console impressions (brand) | GSC | Baseline + 50% |
| GSC impressions (non-brand, jasa keywords) | GSC | Baseline + 200% |
| GSC average position for "jasa pembuatan website dan aplikasi" | GSC | Top 20 |
| GSC average position for "software engineer wonosobo" | GSC | Top 5 |
| Core Web Vitals (LCP, INP, CLS) | CrUX / LHCI | LCP <=2.5s, INP <=200ms, CLS <=0.1 |
| Indexed pages | GSC Coverage | 0 excluded public pages |
| Citation NAP consistency | Manual audit | 100% match across all directories |
| Rich Results for `/jasa` | Rich Results Test | FAQPage + ProfessionalService pass |

### What not to track

- Domain Authority (Moz) or Domain Rating (Ahrefs) — these are third-party estimates, not ranking factors.
- Number of backlinks in isolation — quality and relevance matter, raw count does not.

---

## Definition of Done

This strategy is complete when:

- [ ] Google Business Profile live with complete NAP
- [ ] All citation platforms listed in Phase 2 have consistent NAP entries
- [ ] All developer profiles in Phase 3 link back to the site
- [ ] Schema validation passes without errors on `/`, `/jasa`, one `/artikel/[slug]`
- [ ] At least 4 articles published across 2 pillars
- [ ] `llms.txt` deployed to `public/llms.txt`
- [ ] GSC shows zero "Excluded" status for public routes
- [ ] LHCI budget passes for `/`, `/jasa`, `/artikel`
