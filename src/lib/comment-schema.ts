import { z } from 'astro/zod';

export const CommentInputSchema = z
  .object({
    authorName: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter')
      .max(50, 'Nama maksimal 50 karakter')
      .regex(/^[^<>&"']+$/, 'Nama tidak boleh mengandung karakter HTML khusus'),
    rating: z.coerce
      .number()
      .int('Rating harus berupa bilangan bulat')
      .min(1, 'Rating minimal 1 bintang')
      .max(5, 'Rating maksimal 5 bintang'),
    content: z
      .string()
      .trim()
      .min(3, 'Komentar minimal 3 karakter')
      .max(1000, 'Komentar maksimal 1000 karakter'),
    honeypot: z.string().max(0, 'Spam terdeteksi').optional().default(''),
    turnstileToken: z.string().optional(),
  })
  .strict();

export type CommentInput = z.infer<typeof CommentInputSchema>;

/**
 * Escape karakter HTML untuk mencegah Stored XSS sebelum disimpan atau dirender.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
