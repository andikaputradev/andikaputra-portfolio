import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Article Feature & SEO E2E Tests', () => {
  const articleSlug = 'kepatuhan-uu-pdp-bagi-pengembang-kontrol-teknis';

  test('halaman listing artikel /artikel/ memiliki metadata SEO dan paginasi', async ({ page }) => {
    await page.goto('/artikel/');
    await page.waitForLoadState('domcontentloaded');

    // Title & Meta Description
    await expect(page).toHaveTitle(/Artikel & Insights/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /Artikel tentang/);

    // Canonical tag
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /https:\/\/.*\/artikel\//);

    // RSS alternate link
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute('href', /\/artikel\/rss\.xml/);

    // Kategori filter dapat diakses
    const filters = page.locator('.artikel-filter-btn');
    await expect(filters.first()).toBeVisible();

    // Kartu artikel ter-render
    const cards = page.locator('.article-card');
    await expect(cards.first()).toBeVisible();

    // Axe-core a11y audit
    const results = await new AxeBuilder({ page })
      .exclude('.telemetry-strip')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('detail artikel memuat TOC, word count, reading time, dan JSON-LD BlogPosting', async ({
    page,
  }) => {
    await page.goto(`/artikel/${articleSlug}/`);
    await page.waitForLoadState('domcontentloaded');

    // Header metadata: tanggal, jumlah kata, reading time
    const metaHeader = page.locator('.article-detail__meta');
    await expect(metaHeader).toContainText('kata');
    await expect(metaHeader).toContainText('min read');

    // Table of contents (jika artikel memiliki minimal 2 heading)
    const toc = page.locator('.article-toc');
    const tocVisible = await toc.isVisible();
    if (tocVisible) {
      await expect(toc.locator('.article-toc__title')).toHaveText('DAFTAR ISI');
      const tocLinks = toc.locator('.article-toc__link');
      const firstHref = await tocLinks.first().getAttribute('href');
      expect(firstHref).toMatch(/^#/);
    }

    // Artikel terkait (related articles)
    const relatedSection = page.locator('.article-detail__related');
    await expect(relatedSection).toBeVisible();

    // Verifikasi JSON-LD di tag script
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThan(0);

    let hasBlogPosting = false;
    let hasBreadcrumbs = false;

    for (let i = 0; i < count; i++) {
      const text = await jsonLdScripts.nth(i).innerText();
      try {
        const parsed = JSON.parse(text);
        const schemas = Array.isArray(parsed) ? parsed : [parsed];
        for (const s of schemas) {
          if (s['@type'] === 'BlogPosting') {
            hasBlogPosting = true;
            expect(s.headline).toBeTruthy();
            expect(s.datePublished).toBeTruthy();
            expect(s.author).toBeDefined();
            expect(s.publisher).toBeDefined();
            expect(s.inLanguage).toBe('id');
          }
          if (s['@type'] === 'BreadcrumbList') {
            hasBreadcrumbs = true;
            expect(s.itemListElement.length).toBeGreaterThan(0);
          }
        }
      } catch {
        // ignore parsing errors on individual blocks
      }
    }

    expect(hasBlogPosting).toBe(true);
    expect(hasBreadcrumbs).toBe(true);
  });

  test('feed RSS /artikel/rss.xml menghasilkan XML yang valid', async ({ request }) => {
    const response = await request.get('/artikel/rss.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/xml');

    const body = await response.text();
    expect(body).toContain('<rss version="2.0"');
    expect(body).toContain('<channel>');
    expect(body).toContain('<title>Wahyu Andika Putra - Artikel &amp; Insights</title>');
    expect(body).toContain('<item>');
    expect(body).toContain('</channel>');
  });

  test('robots.txt menyertakan Sitemap dan blokir area terproteksi', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /api');
    expect(body).toContain('Sitemap:');
  });
});
