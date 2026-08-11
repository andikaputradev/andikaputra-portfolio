import type { APIRoute } from 'astro';
import { cloudinary } from '../../../lib/cloudinary';

export const prerender = false;

const ALLOWED_FOLDERS = new Set([
  'portfolio/profile/photo',
  'portfolio/profile/cv',
  'portfolio/certifications',
  'portfolio/projects',
]);

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const folder = url.searchParams.get('folder') ?? 'portfolio/misc';
  const resourceType = url.searchParams.get('resource_type') === 'raw' ? 'raw' : 'image';

  if (!ALLOWED_FOLDERS.has(folder) && !folder.startsWith('portfolio/projects/')) {
    return new Response(JSON.stringify({ error: 'Folder upload tidak diizinkan' }), {
      status: 400,
    });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { timestamp, folder };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    import.meta.env.CLOUDINARY_API_SECRET,
  );

  return new Response(
    JSON.stringify({
      timestamp,
      signature,
      folder,
      resourceType,
      apiKey: import.meta.env.CLOUDINARY_API_KEY,
      cloudName: import.meta.env.CLOUDINARY_CLOUD_NAME,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
