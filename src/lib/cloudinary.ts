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

export async function verifyCloudinaryResource(
  publicId: string,
  expectedResourceType: 'image' | 'raw',
): Promise<boolean> {
  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: expectedResourceType,
    });

    if (resource.public_id !== publicId) {
      return false;
    }

    const format = (resource.format ?? '').toLowerCase();
    const bytes = typeof resource.bytes === 'number' ? resource.bytes : 0;

    if (expectedResourceType === 'image') {
      if (!ALLOWED_IMAGE_FORMATS.has(format)) {
        return false;
      }
      if (bytes > MAX_IMAGE_BYTES) {
        return false;
      }
    } else if (expectedResourceType === 'raw') {
      if (!ALLOWED_RAW_FORMATS.has(format)) {
        return false;
      }
      if (bytes > MAX_RAW_BYTES) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

