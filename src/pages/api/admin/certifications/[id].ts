import { z } from 'astro/zod';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { certifications } from '../../../../db/schema';
import { CertificationInputSchema } from '../../../../lib/admin-schemas';
import { isCsrfValid, csrfError } from '../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../lib/audit';
import { verifyCloudinaryResource } from '../../../../lib/cloudinary';
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
  const [row] = await db.select().from(certifications).where(eq(certifications.id, id));
  if (!row) {
    return new Response(JSON.stringify({ error: 'Sertifikasi tidak ditemukan' }), {
      status: 404,
    });
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

  const parsed = CertificationInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: 422 });
  }

  const [existing] = await db.select().from(certifications).where(eq(certifications.id, id));
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Sertifikasi tidak ditemukan' }), { status: 404 });
  }

  if (parsed.data.assetPublicId && parsed.data.assetPublicId !== existing.assetPublicId) {
    const valid = await verifyCloudinaryResource(parsed.data.assetPublicId, 'image');
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Aset sertifikat tidak ditemukan di akun Cloudinary' }),
        { status: 422 },
      );
    }
  }

  const { verificationUrl, ...rest } = parsed.data;

  const [updated] = await db
    .update(certifications)
    .set({ ...rest, verificationUrl: verificationUrl || null, updatedAt: new Date() })
    .where(eq(certifications.id, id))
    .returning();

  if (!updated) {
    return new Response(JSON.stringify({ error: 'Sertifikasi tidak ditemukan' }), {
      status: 404,
    });
  }

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'update',
    entityType: 'certification',
    entityId: String(id),
    ipAddress: getClientIp(request),
  });

  if (request.headers.get('HX-Request')) {
    return new Response(null, {
      status: 200,
      headers: { 'HX-Redirect': '/admin/certifications?flash=updated' },
    });
  }

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

  const [deleted] = await db.delete(certifications).where(eq(certifications.id, id)).returning();
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Sertifikasi tidak ditemukan' }), {
      status: 404,
    });
  }

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'delete',
    entityType: 'certification',
    entityId: String(id),
    ipAddress: getClientIp(request),
  });

  if (request.headers.get('HX-Request')) {
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'text/html', 'HX-Trigger': toastTrigger(`Sertifikasi "${deleted.name}" dihapus`) },
    });
  }

  return new Response(null, { status: 204 });
};
