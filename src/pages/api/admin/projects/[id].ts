import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { projects } from '../../../../db/schema';
import { ProjectContentPutSchema } from '../../../../lib/project-draft';
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

  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  if (!row) {
    return new Response(JSON.stringify({ error: 'Proyek tidak ditemukan' }), { status: 404 });
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

  const parsed = ProjectContentPutSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Payload tidak valid' }), { status: 422 });
  }

  const [existing] = await db.select().from(projects).where(eq(projects.id, id));
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Proyek tidak ditemukan' }), { status: 404 });
  }

  const { saveMode, data } = parsed.data;
  const contentFields = {
    title: data.title,
    summary: data.summary,
    bodyMarkdown: data.bodyMarkdown,
    liveUrl: data.liveUrl || null,
    repoUrl: data.repoUrl || null,
  };

  const isFirstPublish = !existing.published;
  const writeDirectlyToLive = saveMode === 'publish' || isFirstPublish;

  const [updated] = await db
    .update(projects)
    .set(
      writeDirectlyToLive
        ? {
            ...contentFields,
            draftData: null,
            published: saveMode === 'publish' ? true : existing.published,
            updatedAt: new Date(),
          }
        : {
            draftData: contentFields,
            updatedAt: new Date(),
          },
    )
    .where(eq(projects.id, id))
    .returning();

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'update',
    entityType: 'project',
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

  const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Proyek tidak ditemukan' }), { status: 404 });
  }

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'delete',
    entityType: 'project',
    entityId: String(id),
    ipAddress: getClientIp(request),
  });

  if (request.headers.get('HX-Request')) {
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'text/html', 'HX-Trigger': toastTrigger(`Proyek "${deleted.title}" dihapus`) },
    });
  }

  return new Response(null, { status: 204 });
};
