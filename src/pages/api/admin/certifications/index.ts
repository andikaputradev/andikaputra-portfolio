import { z } from 'astro/zod';
import type { APIRoute } from 'astro';
import { desc } from 'drizzle-orm';
import { db } from '../../../../db';
import { certifications } from '../../../../db/schema';
import { CertificationInputSchema } from '../../../../lib/admin-schemas';
import { isCsrfValid, csrfError } from '../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../lib/audit';
import { verifyCloudinaryResource } from '../../../../lib/cloudinary';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const rows = await db.select().from(certifications).orderBy(desc(certifications.displayOrder));
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

  const parsed = CertificationInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: 422 });
  }

  if (parsed.data.assetPublicId) {
    const valid = await verifyCloudinaryResource(parsed.data.assetPublicId, 'image');
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Aset sertifikat tidak ditemukan di akun Cloudinary' }),
        { status: 422 },
      );
    }
  }

  const { verificationUrl, ...rest } = parsed.data;

  const [created] = await db
    .insert(certifications)
    .values({ ...rest, verificationUrl: verificationUrl || null })
    .returning();

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'create',
    entityType: 'certification',
    entityId: String(created.id),
    ipAddress: getClientIp(request),
  });

  if (request.headers.get('HX-Request')) {
    return new Response(null, {
      status: 200,
      headers: { 'HX-Redirect': '/admin/certifications?flash=created' },
    });
  }

  return new Response(JSON.stringify(created), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
