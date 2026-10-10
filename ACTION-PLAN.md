# Prioritized SEO Action Plan: wahyuandikaputra.my.id

- **Target**: `https://wahyuandikaputra.my.id`
- **Current Score**: **78 / 100**
- **Target Score Post-Implementation**: **92+ / 100**

---

## Phase 1: Immediate Blockers (Fix within 24-48 hours)

### 1. Fix Broken External Project Links
- **Area**: Link Profile & Trust
- **Severity**: 🔴 Critical
- **Problem**: Portfolio project cards link to 404 GitHub repositories:
  - `https://github.com/andikaputradev/pldlearn`
  - `https://github.com/andikaputradev/MediaPembelajaranJarkom`
- **Action**:
  1. If the repositories are private, toggle visibility to **Public** on GitHub.
  2. If the repository names were changed or deleted, update the `github` field in the database/project content or remove the button.

### 2. Resolve Duplicate `<h1>` Heading Tags
- **Area**: On-Page Architecture & Semantic Hierarchy
- **Severity**: ⚠️ High
- **Problem**: Both the hero text (`"I build systems, then try to break them first."`) and the featured project title (`"DarkStar Tools"`) use `<h1>`.
- **Action**: Keep exactly one `<h1>` per page. Downgrade project title tags in project components/modals to `<h2>` or `<h3>`.
- **Code Change**:
  ```diff
  - <h1 class="project-title">DarkStar Tools</h1>
  + <h2 class="project-title">DarkStar Tools</h2>
  ```

---

## Phase 2: Quick Wins (Fix within 1 week)

### 3. Shorten Primary Title Tag and Open Graph Title
- **Area**: On-Page SEO & SERP Snippet Optimization
- **Severity**: ⚠️ Medium
- **Problem**: `Wahyu Andika Putra | Software Engineer & Cybersecurity Specialist` is 65 characters long, which gets truncated on Google desktop SERP (limit ~60 characters / 600px).
- **Recommended Titles**:
  - `Wahyu Andika Putra | Software & Cybersecurity Engineer` (54 characters)
  - `Wahyu Andika Putra | Software Engineer & Security Specialist` (58 characters)
- **Code Change**:
  ```diff
  - <title>Wahyu Andika Putra | Software Engineer & Cybersecurity Specialist</title>
  + <title>Wahyu Andika Putra | Software & Cybersecurity Engineer</title>
  ```

### 4. Configure Standard Sitemap Redirection
- **Area**: Crawlability & Search Engine Discovery
- **Severity**: ⚠️ Medium
- **Problem**: Standard crawler queries to `/sitemap.xml` and `/sitemap_index.xml` return 404, because Astro generates `/sitemap-index.xml`.
- **Action**: Add 301 permanent redirects in `astro.config.mjs` or `vercel.json`:
  ```json
  // vercel.json
  {
    "redirects": [
      { "source": "/sitemap.xml", "destination": "/sitemap-index.xml", "permanent": true },
      { "source": "/sitemap_index.xml", "destination": "/sitemap-index.xml", "permanent": true }
    ]
  }
  ```

### 5. Expand AI Crawler Coverage in `robots.txt`
- **Area**: AI Search & Generative Engine Optimization (GEO)
- **Severity**: ⚠️ Medium
- **Problem**: 8 key AI crawlers currently lack explicit rules and fallback to wildcard `*`.
- **Action**: Add explicit permissions in `public/robots.txt`:
  ```text
  User-agent: GPTBot
  Allow: /

  User-agent: ClaudeBot
  Allow: /

  User-agent: PerplexityBot
  Allow: /

  User-agent: Applebot-Extended
  Allow: /

  User-agent: Google-Extended
  Allow: /

  User-agent: CCBot
  Allow: /

  User-agent: *
  Allow: /
  Disallow: /api/
  Disallow: /admin/
  Disallow: /private/

  Sitemap: https://wahyuandikaputra.my.id/sitemap-index.xml
  ```

---

## Phase 3: Strategic Enhancements (Fix within 2-4 weeks)

### 6. Implement Machine-Readable `/llms.txt`
- **Area**: AI Engine Optimization (AEO / GEO)
- **Severity**: ⚠️ Medium
- **Problem**: `/llms.txt` does not exist (HTTP 404). AI reasoning models lack concise machine-readable context.
- **Action**: Create `public/llms.txt` with structured project and service outlines:
  ```markdown
  # Wahyu Andika Putra

  > Software Engineer and Cybersecurity Specialist based in Indonesia. Focused on production-grade Web2 product engineering, smart contract audits, and Web3 protocol security.

  ## Core Competencies
  - Full-Stack Web Development: TypeScript, Astro, Node.js, Next.js, Postgres
  - Cybersecurity: Penetration testing, Web security hardening, ASVS compliance
  - Web3 / Blockchain: Smart contract security auditing, Solidity, DeFi risk analysis

  ## Key Pages
  - [Portfolio Projects](https://wahyuandikaputra.my.id/#work): Featured production applications
  - [Articles & Technical Insights](https://wahyuandikaputra.my.id/artikel): Engineering and security publications
  - [Services & Consultations](https://wahyuandikaputra.my.id/jasa): Professional engineering and audit services

  ## Contact
  - Website: https://wahyuandikaputra.my.id
  - GitHub: https://github.com/andikaputradev
  - LinkedIn: https://linkedin.com/in/wahyu-andika-putra
  - Email: wahyuandikaputra.co.id@gmail.com
  ```

### 7. Upgrade Structured Data to `ProfilePage`
- **Area**: Schema.org & E-E-A-T Signals
- **Severity**: ℹ️ Low (Strategic)
- **Action**: Wrap the existing `Person` schema in a `ProfilePage` container to explicitly declare the homepage as an author and personal profile page:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "@id": "https://wahyuandikaputra.my.id#person",
      "name": "Wahyu Andika Putra",
      "jobTitle": "Software Engineer & Cybersecurity Specialist",
      "url": "https://wahyuandikaputra.my.id/",
      "image": "https://wahyuandikaputra.my.id/og/index.png",
      "sameAs": [
        "https://github.com/andikaputradev",
        "https://linkedin.com/in/wahyu-andika-putra",
        "https://instagram.com/w.andikaputraa"
      ]
    }
  }
  ```

### 8. Automate `<lastmod>` in XML Sitemaps
- **Area**: Crawl Freshness & Indexing Priority
- **Severity**: ℹ️ Low
- **Action**: Ensure that the Astro sitemap integration or custom sitemap generator automatically sets the ISO 8601 `<lastmod>` date for `/`, `/jasa/`, and `/artikel/` whenever content updates.

---

## Summary of Implementation Effort vs Impact

| Task | Priority | Effort | Expected SEO & UX Impact |
|---|---|---|---|
| Fix 2 broken GitHub links | 🔴 Immediate | 10 mins | Eliminates 404 crawl errors & restores user trust on portfolio cards |
| Resolve multi-H1 issue | ⚠️ Phase 1 | 15 mins | Establishes single clean topic anchor for search engines |
| Shorten title to ≤ 60 chars | ⚠️ Phase 2 | 5 mins | Prevents truncation on SERP snippets |
| Add /sitemap.xml 301 redirect | ⚠️ Phase 2 | 10 mins | Ensures standard search bot crawler compatibility |
| Add AI bots to robots.txt | ⚠️ Phase 2 | 10 mins | Prevents AI scrapers from defaulting to restrictive rules |
| Deploy `/llms.txt` | ⚠️ Phase 3 | 20 mins | Positions site for Perplexity, ChatGPT, and AI Overview citations |
| Wrap schema in `ProfilePage` | ℹ️ Phase 3 | 15 mins | Conforms with Google's Dec 2023 personal brand schema recommendations |
