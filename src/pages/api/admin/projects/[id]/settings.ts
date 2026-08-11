import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../db';
import { projects } from '../../../../../db/schema';
import { ProjectSettingsSchema } from '../../../../../lib/admin-schemas';
import { isCsrfValid, csrfError } from '../../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../../lib/audit';
import { verifyCloudinaryResource } from '../../../../../lib/cloudinary';

export const prerender = false;

export const PATCH: APIRoute = async (context) => {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body JSON tidak valid' }), { status: 400 });
  }

  const parsed = ProjectSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Payload tidak valid' }), { status: 422 });
  }

  const [existing] = await db.select().from(projects).where(eq(projects.id, id));
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Proyek tidak ditemukan' }), { status: 404 });
  }

  if (parsed.data.coverImagePublicId && parsed.data.coverImagePublicId !== existing.coverImagePublicId) {
    const valid = await verifyCloudinaryResource(parsed.data.coverImagePublicId, 'image');
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Cover image tidak ditemukan di akun Cloudinary' }),
        { status: 422 },
      );
    }
  }

  const [updated] = await db
    .update(projects)
    .set({ ...parsed.data, updatedAt: new Date() })
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

  if (request.headers.get('HX-Request')) {
    return new Response(null, { status: 200, headers: { 'HX-Redirect': `/admin/projects/${id}/edit?flash=settings-saved` } });
  }

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
