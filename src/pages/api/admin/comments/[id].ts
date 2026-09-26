import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { articleComments } from '../../../../db/schema';
import { isCsrfValid, csrfError } from '../../../../lib/require-csrf';
import { recordAudit, getClientIp } from '../../../../lib/audit';
import { toastTrigger } from '../../../../lib/hx-trigger';

export const prerender = false;

function parseId(idParam: string | undefined): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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

  const [deleted] = await db.delete(articleComments).where(eq(articleComments.id, id)).returning();
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Komentar tidak ditemukan' }), { status: 404 });
  }

  await recordAudit({
    actorEmail: locals.admin.email,
    action: 'delete',
    entityType: 'comment',
    entityId: String(id),
    ipAddress: getClientIp(request),
  });

  if (request.headers.get('HX-Request')) {
    return new Response('', {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'HX-Trigger': toastTrigger(`Komentar #${id} dihapus`),
      },
    });
  }

  return new Response(null, { status: 204 });
};
