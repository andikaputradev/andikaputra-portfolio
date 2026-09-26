import type { APIRoute } from 'astro';
import { db } from '../../db';
import { articles } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const prerender = false;

function escapeXml(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const rawSiteUrl = site?.toString() ?? 'https://andikaputra.vercel.app/';
  const siteUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl : `${rawSiteUrl}/`;

  const rows = await db
    .select({
      slug: articles.slug,
      title: articles.title,
      summary: articles.summary,
      category: articles.category,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.publishedAt));

  const latestBuildDate = rows.length > 0 && rows[0].publishedAt
    ? new Date(rows[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const itemsXml = rows
    .map((article) => {
      const itemUrl = `${siteUrl}artikel/${article.slug}/`;
      const pubDate = new Date(article.publishedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <description>${escapeXml(article.summary)}</description>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Wahyu Andika Putra - Artikel &amp; Insights</title>
    <link>${siteUrl}artikel/</link>
    <description>Tulisan seputar pengembangan web &amp; aplikasi, keamanan siber, Web3, dan topik teknis lainnya oleh Wahyu Andika Putra.</description>
    <language>id</language>
    <atom:link href="${siteUrl}artikel/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${latestBuildDate}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
