import { z } from 'astro/zod';
import type { APIRoute } from 'astro';
import { desc } from 'drizzle-orm';
import { db } from '../../../../db';
import { articles } from '../../../../db/schema';
import { ArticleInputSchema } from '../../../../lib/admin-schemas';
import { isCsrfValid, csrfError } from '../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../lib/audit';
import { verifyCloudinaryResource } from '../../../../lib/cloudinary';
import { calculateReadingTime } from '../../../../lib/reading-time';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const rows = await db.select().from(articles).orderBy(desc(articles.displayOrder));
  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async (context) => {
  const { request, locals } = context;
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!isCsrfValid(context)) {
    return csrfError();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body JSON tidak valid' }), { status: 400 });
  }

  const parsed = ArticleInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: 422 });
  }

  if (parsed.data.coverImagePublicId) {
    const valid = await verifyCloudinaryResource(parsed.data.coverImagePublicId, 'image');
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Cover image tidak ditemukan di akun Cloudinary' }),
        { status: 422 },
      );
    }
  }

  const insertData = {
    ...parsed.data,
    canonicalUrlOverride: parsed.data.canonicalUrlOverride || null,
    ogImageOverride: parsed.data.ogImageOverride || null,
    readingTimeMinutes:
      parsed.data.readingTimeMinutes && parsed.data.readingTimeMinutes > 0
        ? parsed.data.readingTimeMinutes
        : calculateReadingTime(parsed.data.bodyMarkdown),
  };

  try {
    const [created] = await db
      .insert(articles)
      .values(insertData)
      .returning();

    await recordAudit({
      actorEmail: locals.admin.email,
      action: 'create',
      entityType: 'article',
      entityId: String(created.id),
      ipAddress: getClientIp(request),
    });

    if (request.headers.get('HX-Request')) {
      return new Response(null, { status: 200, headers: { 'HX-Redirect': '/admin/articles?flash=created' } });
    }

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      return new Response(JSON.stringify({ error: 'Slug sudah dipakai artikel lain' }), {
        status: 409,
      });
    }
    console.error('Gagal membuat artikel:', error);
    return new Response(JSON.stringify({ error: 'Gagal menyimpan artikel' }), { status: 500 });
  }
};
