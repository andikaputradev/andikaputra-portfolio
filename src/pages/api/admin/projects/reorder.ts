import type { APIRoute } from 'astro';
import { projects } from '../../../../db/schema';
import { ReorderInputSchema } from '../../../../lib/reorder-schema';
import { isCsrfValid, csrfError } from '../../../../lib/require-csrf';
import { bulkUpdateDisplayOrder } from '../../../../lib/bulk-reorder';
import { recordAudit, getClientIp } from '../../../../lib/audit';

export const prerender = false;

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

  const parsed = ReorderInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Payload reorder tidak valid' }), { status: 422 });
  }

  await bulkUpdateDisplayOrder(projects, parsed.data);

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'update',
    entityType: 'project',
    entityId: parsed.data.map((item) => item.id).join(','),
    ipAddress: getClientIp(request),
  });

  return new Response(null, { status: 204 });
};
