import type { APIRoute } from 'astro';
import { db } from '../db';
import { projects, articles } from '../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changefreq: 'weekly' },
  { path: 'jasa/', priority: 0.9, changefreq: 'monthly' },
  { path: 'artikel/', priority: 0.8, changefreq: 'weekly' },
];

function buildUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

function formatDate(dateValue: Date | string | null | undefined): string | undefined {
  if (!dateValue) return undefined;
  try {
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  } catch {
    return undefined;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const rawSiteUrl = site?.toString() ?? 'https://wahyuandikaputra.my.id/';

  const [publishedProjects, publishedArticles] = await Promise.all([
    db
      .select({ slug: projects.slug, updatedAt: projects.updatedAt })
      .from(projects)
      .where(eq(projects.published, true)),
    db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.published, true)),
  ]);

  const latestArticleUpdate = publishedArticles.reduce<Date | null>((latest, a) => {
    if (!a.updatedAt) return latest;
    const d = new Date(a.updatedAt);
    return !latest || d > latest ? d : latest;
  }, null);

  const latestProjectUpdate = publishedProjects.reduce<Date | null>((latest, p) => {
    if (!p.updatedAt) return latest;
    const d = new Date(p.updatedAt);
    return !latest || d > latest ? d : latest;
  }, null);

  const latestOverallUpdate = [latestArticleUpdate, latestProjectUpdate]
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date();

  const getStaticRouteLastMod = (path: string): string | undefined => {
    if (path === '') return formatDate(latestOverallUpdate);
    if (path === 'artikel/') return formatDate(latestArticleUpdate ?? latestOverallUpdate);
    if (path === 'jasa/') return formatDate(latestOverallUpdate);
    return formatDate(latestOverallUpdate);
  };

  const urls = [
    ...STATIC_ROUTES.map((route) => ({
      loc: buildUrl(rawSiteUrl, route.path),
      lastmod: getStaticRouteLastMod(route.path),
      priority: route.priority.toFixed(1),
      changefreq: route.changefreq,
    })),
    ...publishedProjects.map((p) => ({
      loc: buildUrl(rawSiteUrl, `work/${p.slug}/`),
      lastmod: formatDate(p.updatedAt),
      priority: (0.8).toFixed(1),
      changefreq: 'monthly' as const,
    })),
    ...publishedArticles.map((a) => ({
      loc: buildUrl(rawSiteUrl, `artikel/${a.slug}/`),
      lastmod: formatDate(a.updatedAt),
      priority: (0.7).toFixed(1),
      changefreq: 'monthly' as const,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
