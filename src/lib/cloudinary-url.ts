export function cloudinaryImageUrl(publicId: string, transformation: string): string {
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

export function cloudinaryRawUrl(publicId: string): string {
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`;
}

export function resolveCoverImage(
  project: { coverImagePublicId: string | null; coverImagePath: string | null },
  transformation = 'f_auto,q_auto,w_800',
): string | null {
  if (project.coverImagePublicId) {
    return cloudinaryImageUrl(project.coverImagePublicId, transformation);
  }
  return project.coverImagePath;
}
