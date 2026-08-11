import type { APIRoute } from 'astro';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../../../db';
import { projects } from '../../../db/schema';

export const prerender = false;

export const GET: APIRoute = async () => {
  const rows = await db
    .select({
      slug: projects.slug,
      title: projects.title,
      tag: projects.tag,
      flagship: projects.flagship,
      summary: projects.summary,
      stack: projects.stack,
      liveUrl: projects.liveUrl,
      repoUrl: projects.repoUrl,
      coverImagePath: projects.coverImagePath,
      coverImagePublicId: projects.coverImagePublicId,
      displayOrder: projects.displayOrder,
      publishedAt: projects.publishedAt,
    })
    .from(projects)
    .where(and(eq(projects.published, true)))
    .orderBy(desc(projects.displayOrder));

  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
