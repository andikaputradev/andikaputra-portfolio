# SEO FIX IMPLEMENTATION BRIEF

Source: FULL-AUDIT-REPORT.md and ACTION-PLAN.md, audit dated 2026-09-27. Independently spot-checked against the live site before writing this brief.

## Verified before execution
- Confirmed by direct fetch of the live homepage: it renders two H1 elements, the hero tagline and the "DarkStar Tools" project title.
- Confirmed by direct fetch: github.com/andikaputradev/pldlearn returns 404.
- Confirmed by direct fetch: github.com/andikaputradev/MediaPembelajaranJarkom returns 404.
- Not independently re-checked in this pass: robots.txt content, /llms.txt 404, /sitemap.xml 404, exact title character count, JSON-LD field completeness. The audit's evidence for these looks reliable, but re-confirm with a raw crawl before editing rather than trusting the report alone.
- The audit's numeric scores (78/100, per-category scores, "target 92+") are the auditing agent's own heuristic rubric, not a standardized benchmark like real Lighthouse. Do not treat reaching a target number as the definition of done. The Performance/CWV figure specifically was DOM-estimated because the PageSpeed API returned 429 during the audit, it is not a real field measurement.

## Phase 0: Get real performance data first
- Re-run PageSpeed Insights or `lhci autorun` against the live domain now that rate limiting may have cleared. Record actual LCP, INP, CLS. Do not rely on the DOM-estimated 88/100 figure for any decision.

## Phase 1: Critical, do first
1. Two GitHub repository links return 404: `pldlearn`, `MediaPembelajaranJarkom`.
   - Before making either repository public, scan its full commit history for committed secrets or credentials, for example `gitleaks detect --source . --log-opts="--all"`. These are portfolio pieces for a security specialist, a leaked secret in an old commit is a worse outcome than a missing project link.
   - If clean, set repository visibility to public.
   - If it contains anything sensitive, or the repository no longer exists, remove the GitHub button from that project card, or point it to a public demo or write-up URL instead. Do not fabricate a repository URL.
2. Duplicate `<h1>` on the homepage, hero tagline and the flagship project title both render as `<h1>`. Change the flagship/project-card title element to `<h2>`, keep the hero tagline as the only `<h1>`. Apply the same fix to the shared project-card component used on `/work/[id]` pages, check there too, not only the homepage instance.

## Phase 2: Quick wins
3. Title tag is 65 characters, truncates on desktop SERP. Change to one of:
   - "Wahyu Andika Putra | Software & Cybersecurity Engineer" (56 chars)
   - "Wahyu Andika Putra | Software Engineer & Security Specialist" (58 chars)
   Update every place the title is set (page meta, og:title, twitter:title), keep all three consistent.
4. `/sitemap.xml` returns 404, only `/sitemap-index.xml` exists. Add a redirect, do not restructure the sitemap generator:
   ```json
   { "source": "/sitemap.xml", "destination": "/sitemap-index.xml", "permanent": true }
   ```
   Add this entry to the existing `redirects` array already in `vercel.json`, alongside the `.vercel.app` host redirect configured earlier, do not create a second `redirects` block or overwrite the array.
5. AI crawler access in `robots.txt` is currently unmanaged for ClaudeBot, PerplexityBot, Applebot-Extended, Bytespider, anthropic-ai, ChatGPT-User, FacebookBot, Amazonbot. This is a content-exposure decision, not a pure technical fix. Confirm whether full-content scraping access for AI training and answer engines is actually wanted before applying a blanket `Allow: /` to every one of them. If the intent is visibility in AI answer engines specifically rather than model training, consider allowing PerplexityBot and ClaudeBot while leaving generic training-only bots such as Bytespider unmanaged or disallowed.

## Phase 3: Strategic, lower urgency
6. Add `public/llms.txt` with the bio, stack, and services content already drafted in the action plan. No AI provider, Anthropic, OpenAI, or Perplexity, has published confirmation that `/llms.txt` affects crawling, ranking, or citation behavior as of this writing. Treat this as a low-cost experiment, not a guaranteed SEO or GEO gain.
7. Wrap the existing `Person` schema in a `ProfilePage` type per the action plan's JSON-LD snippet.
8. Populate `<lastmod>` in the sitemap generator using actual build or content-update timestamps, not a static value.

## Definition of done
- Phase 1 items verified fixed by re-fetching the live URLs: both repository links return 200 or are removed, homepage has exactly one `<h1>`.
- Phase 0 real CWV numbers recorded, compared against the DOM-estimated figures, discrepancy noted if any.
- No em dash in any file touched.
- Report back per finding: fixed, verified how, residual risk if any. Do not report a new aggregate score as if it were a measured benchmark.