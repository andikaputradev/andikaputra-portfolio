import { z } from 'astro/zod';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { siteProfile } from '../../../../db/schema';
import { ProfileInputSchema } from '../../../../lib/admin-schemas';
import { isCsrfValid, csrfError } from '../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../lib/audit';
import { verifyAndResolveCloudinaryResource } from '../../../../lib/cloudinary';

export const prerender = false;

async function getOrCreateProfileRow() {
  const [existing] = await db.select().from(siteProfile).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(siteProfile).values({}).returning();
  return created;
}

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const row = await getOrCreateProfileRow();
  return new Response(JSON.stringify(row), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async (context) => {
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

  const parsed = ProfileInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: z.treeifyError(parsed.error) }), { status: 422 });
  }

  if (parsed.data.photoPublicId) {
    const photoResult = await verifyAndResolveCloudinaryResource(
      parsed.data.photoPublicId,
      'image',
      { defaultFolder: 'portfolio/profile/photo' },
    );
    if (!photoResult.valid || !photoResult.resolvedPublicId) {
      return new Response(
        JSON.stringify({ error: 'Foto profil tidak ditemukan di akun Cloudinary' }),
        { status: 422 },
      );
    }
    parsed.data.photoPublicId = photoResult.resolvedPublicId;
  }

  if (parsed.data.cvPublicId) {
    const cvResult = await verifyAndResolveCloudinaryResource(
      parsed.data.cvPublicId,
      'raw',
      { defaultFolder: 'portfolio/profile/cv' },
    );
    if (!cvResult.valid || !cvResult.resolvedPublicId) {
      return new Response(JSON.stringify({ error: 'CV tidak ditemukan di akun Cloudinary' }), {
        status: 422,
      });
    }
    parsed.data.cvPublicId = cvResult.resolvedPublicId;
  }

  const current = await getOrCreateProfileRow();

  const cvChanged =
    parsed.data.cvPublicId !== undefined && parsed.data.cvPublicId !== current.cvPublicId;

  const [updated] = await db
    .update(siteProfile)
    .set({
      ...parsed.data,
      cvUpdatedAt: cvChanged ? new Date() : current.cvUpdatedAt,
      updatedAt: new Date(),
    })
    .where(eq(siteProfile.id, current.id))
    .returning();

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'update',
    entityType: 'profile',
    entityId: String(current.id),
    ipAddress: getClientIp(request),
  });

  if (request.headers.get('HX-Request')) {
    return new Response(null, { status: 200, headers: { 'HX-Redirect': '/admin/profile' } });
  }

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
