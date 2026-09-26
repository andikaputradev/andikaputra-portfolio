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

export function cloudinarySrcSet(
  publicId: string,
  widths: number[] = [400, 600, 800, 1200, 1600],
  baseTransform = 'f_auto,q_auto',
): string {
  const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return '';
  return widths
    .map((w) => `https://res.cloudinary.com/${cloudName}/image/upload/${baseTransform},w_${w}/${publicId} ${w}w`)
    .join(', ');
}

export function resolveCoverImageSrcSet(
  project: { coverImagePublicId: string | null; coverImagePath: string | null },
  widths: number[] = [400, 600, 800, 1200, 1600],
  baseTransform = 'f_auto,q_auto',
): string | undefined {
  if (project.coverImagePublicId) {
    return cloudinarySrcSet(project.coverImagePublicId, widths, baseTransform);
  }
  return undefined;
}

