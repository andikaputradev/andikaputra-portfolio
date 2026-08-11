import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function verifyCloudinaryResource(
  publicId: string,
  expectedResourceType: 'image' | 'raw',
): Promise<boolean> {
  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: expectedResourceType,
    });
    return resource.public_id === publicId;
  } catch {
    return false;
  }
}
