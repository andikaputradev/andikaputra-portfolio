import type { APIRoute } from 'astro';
import { db } from '../db';
import { projects } from '../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const STATIC_ROUTES = ['', 'jasa/'];

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() ?? 'https://wahyuandikaputra.dev/';

  const publishedProjects = await db
    .select({ slug: projects.slug, updatedAt: projects.updatedAt })
    .from(projects)
    .where(eq(projects.published, true));

  const urls = [
    ...STATIC_ROUTES.map((path) => ({ loc: `${siteUrl}${path}`, lastmod: undefined as string | undefined })),
    ...publishedProjects.map((p) => ({
      loc: `${siteUrl}work/${p.slug}/`,
      lastmod: p.updatedAt.toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
