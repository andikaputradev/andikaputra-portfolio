import { db } from '../db';
import { auditLog } from '../db/schema';

interface RecordAuditParams {
  actorEmail: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'project' | 'certification' | 'profile';
  entityId?: string | null;
  ipAddress?: string | null;
}

export async function recordAudit(params: RecordAuditParams): Promise<void> {
  await db.insert(auditLog).values({
    actorEmail: params.actorEmail,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    ipAddress: params.ipAddress ?? null,
  });
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return request.headers.get('x-real-ip');
}
