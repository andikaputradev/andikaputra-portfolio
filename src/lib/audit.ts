import { db } from '../db';
import { auditLog } from '../db/schema';

interface RecordAuditParams {
  actorEmail: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'project' | 'certification' | 'profile' | 'article' | 'comment';
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

export { getClientIp, isValidIp } from './client-ip';


