import type { APIRoute } from 'astro';
import { cloudinary } from '../../../lib/cloudinary';
import { db } from '../../../db';
import { projects, certifications, siteProfile, auditLog } from '../../../db/schema';

export const prerender = false;

const BACKUP_FOLDER = 'portfolio/db-backups';
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const GET: APIRoute = async ({ request }) => {
  const cronSecret = import.meta.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const [projectRows, certificationRows, profileRows, auditRows] = await Promise.all([
    db.select().from(projects),
    db.select().from(certifications),
    db.select().from(siteProfile),
    db.select().from(auditLog),
  ]);

  // Sengaja TIDAK menyertakan tabel Better Auth (user/session/account/verification/
  // twoFactor) maupun page_views/rate_limit_log: kredensial & secret 2FA tidak layak
  // disimpan di penyimpanan offsite pihak ketiga (jika folder ini bocor, second-factor
  // jadi tidak berarti), sementara analytics/rate-limit tidak bernilai untuk disaster
  // recovery konten. Untuk memulihkan identitas admin pasca kehilangan database, buat
  // ulang lewat `npm run seed:admin` — bukan restore dari backup ini.
  const snapshot = {
    generatedAt: new Date().toISOString(),
    tables: {
      projects: projectRows,
      certifications: certificationRows,
      siteProfile: profileRows,
      auditLog: auditRows,
    },
  };

  const dateStamp = new Date().toISOString().slice(0, 10);
  const payload = JSON.stringify(snapshot);

  try {
    await cloudinary.uploader.upload(
      `data:application/json;base64,${Buffer.from(payload).toString('base64')}`,
      {
        resource_type: 'raw',
        folder: BACKUP_FOLDER,
        public_id: `backup-${dateStamp}`,
        overwrite: true,
      },
    );
  } catch (error) {
    console.error('cron/backup: upload Cloudinary gagal —', error);
    return new Response(JSON.stringify({ error: 'upload_failed' }), { status: 502 });
  }

  const deletedCount = await cleanupOldBackups();

  return new Response(
    JSON.stringify({
      ok: true,
      backupId: `backup-${dateStamp}`,
      rowCounts: {
        projects: projectRows.length,
        certifications: certificationRows.length,
        siteProfile: profileRows.length,
        auditLog: auditRows.length,
      },
      deletedOldBackups: deletedCount,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

async function cleanupOldBackups(): Promise<number> {
  try {
    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: `${BACKUP_FOLDER}/`,
      max_results: 200,
    });

    const cutoff = Date.now() - RETENTION_MS;
    const stale: string[] = resources
      .filter((resource: { created_at: string }) => new Date(resource.created_at).getTime() < cutoff)
      .map((resource: { public_id: string }) => resource.public_id);

    if (stale.length > 0) {
      await cloudinary.api.delete_resources(stale, { resource_type: 'raw' });
    }
    return stale.length;
  } catch (error) {
    console.error('cron/backup: cleanup backup lama gagal —', error);
    return 0;
  }
}
