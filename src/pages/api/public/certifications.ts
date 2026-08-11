import type { APIRoute } from 'astro';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../../db';
import { certifications } from '../../../db/schema';

export const prerender = false;

export const GET: APIRoute = async () => {
  const rows = await db
    .select({
      id: certifications.id,
      name: certifications.name,
      issuer: certifications.issuer,
      issueDate: certifications.issueDate,
      expiryDate: certifications.expiryDate,
      credentialId: certifications.credentialId,
      verificationUrl: certifications.verificationUrl,
      assetPublicId: certifications.assetPublicId,
      assetFormat: certifications.assetFormat,
      displayOrder: certifications.displayOrder,
    })
    .from(certifications)
    .where(eq(certifications.published, true))
    .orderBy(desc(certifications.displayOrder));

  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
