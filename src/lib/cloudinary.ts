import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export const ALLOWED_IMAGE_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);
export const ALLOWED_RAW_FORMATS = new Set(['pdf']);
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_RAW_BYTES = 15 * 1024 * 1024; // 15MB

export interface VerifyCloudinaryResourceOptions {
  defaultFolder?: string;
}

export interface VerifyCloudinaryResourceResult {
  valid: boolean;
  resolvedPublicId?: string;
}

export async function verifyAndResolveCloudinaryResource(
  publicId: string,
  expectedResourceType: 'image' | 'raw',
  options?: VerifyCloudinaryResourceOptions,
): Promise<VerifyCloudinaryResourceResult> {
  const trimmedId = publicId.trim();
  if (!trimmedId) {
    return { valid: false };
  }

  // Generate candidate public IDs to test
  const candidates: string[] = [trimmedId];

  if (options?.defaultFolder && !trimmedId.includes('/')) {
    const folder = options.defaultFolder.replace(/^\/+|\/+$/g, '');
    candidates.push(`${folder}/${trimmedId}`);
  }

  if (expectedResourceType === 'raw') {
    const withExt: string[] = [];
    for (const cand of candidates) {
      if (!cand.toLowerCase().endsWith('.pdf')) {
        withExt.push(`${cand}.pdf`);
      }
    }
    candidates.push(...withExt);
  }

  const uniqueCandidates = [...new Set(candidates)];

  for (const candidate of uniqueCandidates) {
    try {
      const resource = await cloudinary.api.resource(candidate, {
        resource_type: expectedResourceType,
      });

      if (resource.public_id !== candidate) {
        continue;
      }

      // Cloudinary Admin API raw resources typically do not include a 'format' property.
      // We extract the format from resource.format, or fallback to file extension in public_id or display_name.
      let format = (resource.format ?? '').toLowerCase();
      if (!format && typeof resource.public_id === 'string' && resource.public_id.includes('.')) {
        format = resource.public_id.split('.').pop()?.toLowerCase() ?? '';
      }
      if (
        !format &&
        typeof (resource as { display_name?: string }).display_name === 'string' &&
        (resource as { display_name?: string }).display_name!.includes('.')
      ) {
        format = (resource as { display_name?: string }).display_name!.split('.').pop()?.toLowerCase() ?? '';
      }

      const bytes = typeof resource.bytes === 'number' ? resource.bytes : 0;

      if (expectedResourceType === 'image') {
        if (!ALLOWED_IMAGE_FORMATS.has(format)) {
          return { valid: false };
        }
        if (bytes > MAX_IMAGE_BYTES) {
          return { valid: false };
        }
      } else if (expectedResourceType === 'raw') {
        if (!ALLOWED_RAW_FORMATS.has(format)) {
          return { valid: false };
        }
        if (bytes > MAX_RAW_BYTES) {
          return { valid: false };
        }
      }

      return { valid: true, resolvedPublicId: candidate };
    } catch {
      continue;
    }
  }

  return { valid: false };
}

export async function verifyCloudinaryResource(
  publicId: string,
  expectedResourceType: 'image' | 'raw',
  options?: VerifyCloudinaryResourceOptions,
): Promise<boolean> {
  const result = await verifyAndResolveCloudinaryResource(publicId, expectedResourceType, options);
  return result.valid;
}

