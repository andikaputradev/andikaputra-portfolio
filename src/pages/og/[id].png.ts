import type { APIRoute } from 'astro';
import { db } from '../../db';
import { projects, articles } from '../../db/schema';
import { and, eq } from 'drizzle-orm';
import { renderOgPng } from '../../lib/og-image';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const slug = context.params.id;
  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  // Wajib filter published = true untuk mencegah kebocoran informasi draft
  const [project] = await db
    .select({
      tag: projects.tag,
      title: projects.title,
      summary: projects.summary,
    })
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.published, true)));

  if (project) {
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
  }

  const [article] = await db
    .select({
      category: articles.category,
      title: articles.title,
      summary: articles.summary,
    })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)));

  if (article) {
    const png = await renderOgPng(
      {
        eyebrow: `[${article.category}]`,
        title: article.title,
        subtitle: article.summary,
      },
      context.url,
    );

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return new Response('Not found', { status: 404 });
};
