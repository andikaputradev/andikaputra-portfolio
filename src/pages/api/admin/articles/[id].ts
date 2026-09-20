import { z } from 'astro/zod';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { articles } from '../../../../db/schema';
import { ArticleInputSchema } from '../../../../lib/admin-schemas';
import { isCsrfValid, csrfError } from '../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../lib/audit';
import { toastTrigger } from '../../../../lib/hx-trigger';

export const prerender = false;

function parseId(idParam: string | undefined): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const id = parseId(params.id);
  if (id === null) {
    return new Response(JSON.stringify({ error: 'ID tidak valid' }), { status: 400 });
  }

  const [row] = await db.select().from(articles).where(eq(articles.id, id));
  if (!row) {
    return new Response(JSON.stringify({ error: 'Artikel tidak ditemukan' }), { status: 404 });
  }
  return new Response(JSON.stringify(row), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async (context) => {
  const { params, request, locals } = context;
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!isCsrfValid(context)) {
    return csrfError();
  }
  const id = parseId(params.id);
  if (id === null) {
    return new Response(JSON.stringify({ error: 'ID tidak valid' }), { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body JSON tidak valid' }), { status: 400 });
  }

  const parsed = ArticleInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: 422 });
  }

  const [existing] = await db.select().from(articles).where(eq(articles.id, id));
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Artikel tidak ditemukan' }), { status: 404 });
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const d = parsed.data;
  if (d.slug !== undefined) updateData.slug = d.slug;
  if (d.title !== undefined) updateData.title = d.title;
  if (d.category !== undefined) updateData.category = d.category;
  if (d.summary !== undefined) updateData.summary = d.summary;
  if (d.bodyMarkdown !== undefined) updateData.bodyMarkdown = d.bodyMarkdown;
  if (d.coverImagePublicId !== undefined) updateData.coverImagePublicId = d.coverImagePublicId ?? null;
  if (d.tags !== undefined) updateData.tags = d.tags;
  if (d.readingTimeMinutes !== undefined) updateData.readingTimeMinutes = d.readingTimeMinutes ?? null;
  if (d.displayOrder !== undefined) updateData.displayOrder = d.displayOrder;
  if (d.published !== undefined) updateData.published = d.published;
  if (d.metaTitle !== undefined) updateData.metaTitle = d.metaTitle ?? null;
  if (d.metaDescription !== undefined) updateData.metaDescription = d.metaDescription ?? null;

  const [updated] = await db
    .update(articles)
    .set(updateData)
    .where(eq(articles.id, id))
    .returning();

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'update',
    entityType: 'article',
    entityId: String(id),
    ipAddress: getClientIp(request),
  });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async (context) => {
  const { params, request, locals } = context;
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!isCsrfValid(context)) {
    return csrfError();
  }
  const id = parseId(params.id);
  if (id === null) {
    return new Response(JSON.stringify({ error: 'ID tidak valid' }), { status: 400 });
  }

  const [deleted] = await db.delete(articles).where(eq(articles.id, id)).returning();
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Artikel tidak ditemukan' }), { status: 404 });
  }

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'delete',
    entityType: 'article',
    entityId: String(id),
    ipAddress: getClientIp(request),
  });

  if (request.headers.get('HX-Request')) {
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'text/html', 'HX-Trigger': toastTrigger(`Artikel "${deleted.title}" dihapus`) },
    });
  }

  return new Response(null, { status: 204 });
};
