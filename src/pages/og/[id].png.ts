import type { APIRoute } from 'astro';
import { db } from '../../db';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { renderOgPng } from '../../lib/og-image';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const slug = context.params.id;
  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
  if (!project) {
    return new Response('Not found', { status: 404 });
  }

  const png = await renderOgPng(
    {
      eyebrow: `[${project.tag}]`,
      title: project.title,
      subtitle: project.summary,
    },
    context.url,
  );

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
