import { describe, expect, it, vi } from 'vitest';
import {
  verifyCloudinaryResource,
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_RAW_FORMATS,
  MAX_IMAGE_BYTES,
  MAX_RAW_BYTES,
  cloudinary,
} from '../../src/lib/cloudinary';

describe('verifyCloudinaryResource security checks (ASVS V12)', () => {
  it('hanya mengizinkan format gambar web aman (tidak termasuk SVG yang berisiko XSS)', () => {
    expect(ALLOWED_IMAGE_FORMATS.has('webp')).toBe(true);
    expect(ALLOWED_IMAGE_FORMATS.has('avif')).toBe(true);
    expect(ALLOWED_IMAGE_FORMATS.has('jpg')).toBe(true);
    expect(ALLOWED_IMAGE_FORMATS.has('png')).toBe(true);

    // SVG, HTML, EXE, JS, dsb. harus ditolak
    expect(ALLOWED_IMAGE_FORMATS.has('svg')).toBe(false);
    expect(ALLOWED_IMAGE_FORMATS.has('html')).toBe(false);
    expect(ALLOWED_IMAGE_FORMATS.has('exe')).toBe(false);
    expect(ALLOWED_IMAGE_FORMATS.has('sh')).toBe(false);
  });

  it('hanya mengizinkan format PDF untuk dokumen raw', () => {
    expect(ALLOWED_RAW_FORMATS.has('pdf')).toBe(true);
    expect(ALLOWED_RAW_FORMATS.has('exe')).toBe(false);
    expect(ALLOWED_RAW_FORMATS.has('zip')).toBe(false);
  });

  it('menerima gambar yang sesuai format dan di bawah batas ukuran', async () => {
    vi.spyOn(cloudinary.api, 'resource').mockResolvedValueOnce({
      public_id: 'portfolio/projects/cover-1',
      format: 'webp',
      bytes: 1024 * 500, // 500KB
    } as any);

    const valid = await verifyCloudinaryResource('portfolio/projects/cover-1', 'image');
    expect(valid).toBe(true);
  });

  it('menolak gambar dengan format berbahaya (mis. svg atau html)', async () => {
    vi.spyOn(cloudinary.api, 'resource').mockResolvedValueOnce({
      public_id: 'portfolio/projects/evil',
      format: 'svg',
      bytes: 1024,
    } as any);

    const valid = await verifyCloudinaryResource('portfolio/projects/evil', 'image');
    expect(valid).toBe(false);
  });

  it('menolak gambar melebihi batas ukuran (DoS prevention)', async () => {
    vi.spyOn(cloudinary.api, 'resource').mockResolvedValueOnce({
      public_id: 'portfolio/projects/huge',
      format: 'png',
      bytes: MAX_IMAGE_BYTES + 1,
    } as any);

    const valid = await verifyCloudinaryResource('portfolio/projects/huge', 'image');
    expect(valid).toBe(false);
  });

  it('menolak dokumen raw melebihi batas ukuran 15MB', async () => {
    vi.spyOn(cloudinary.api, 'resource').mockResolvedValueOnce({
      public_id: 'portfolio/profile/cv/huge-cv',
      format: 'pdf',
      bytes: MAX_RAW_BYTES + 100,
    } as any);

    const valid = await verifyCloudinaryResource('portfolio/profile/cv/huge-cv', 'raw');
    expect(valid).toBe(false);
  });

  it('mengembalikan false jika Cloudinary API melempar error (resource tidak ada)', async () => {
    vi.spyOn(cloudinary.api, 'resource').mockRejectedValueOnce(new Error('Not found'));

    const valid = await verifyCloudinaryResource('portfolio/not-found', 'image');
    expect(valid).toBe(false);
  });
});
