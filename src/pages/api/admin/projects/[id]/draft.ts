import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../db';
import { projects } from '../../../../../db/schema';
import { isCsrfValid, csrfError } from '../../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../../lib/audit';

export const prerender = false;

export const DELETE: APIRoute = async (context) => {
  const { params, request, locals } = context;
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!isCsrfValid(context)) {
    return csrfError();
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response(JSON.stringify({ error: 'ID tidak valid' }), { status: 400 });
  }

  const [updated] = await db
    .update(projects)
    .set({ draftData: null, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  if (!updated) {
    return new Response(JSON.stringify({ error: 'Proyek tidak ditemukan' }), { status: 404 });
  }

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
