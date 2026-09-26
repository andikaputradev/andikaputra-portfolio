import type { APIRoute } from 'astro';
import { cloudinary } from '../../../lib/cloudinary';

export const prerender = false;

const ALLOWED_FOLDERS = new Set([
  'portfolio/profile/photo',
  'portfolio/profile/cv',
  'portfolio/certifications',
  'portfolio/projects',
  'portfolio/projects/body',
  'portfolio/articles',
]);

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const folder = url.searchParams.get('folder');
  const rawParam = url.searchParams.get('resource_type');

  if (!folder || !ALLOWED_FOLDERS.has(folder)) {
    return new Response(JSON.stringify({ error: 'Folder upload tidak diizinkan' }), {
      status: 400,
    });
  }

  const expectedResourceType = folder === 'portfolio/profile/cv' ? 'raw' : 'image';
  if (rawParam && rawParam !== expectedResourceType) {
    return new Response(
      JSON.stringify({ error: `Folder ${folder} hanya menerima resource type ${expectedResourceType}` }),
      { status: 400 },
    );
  }
  const resourceType = expectedResourceType;


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
