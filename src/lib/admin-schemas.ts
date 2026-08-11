import { z } from 'astro/zod';

const TRUTHY_STRINGS = new Set(['true', 'on', '1', 'yes']);
const FALSY_STRINGS = new Set(['false', 'off', '0', 'no', '']);

/**
 * htmx (hx-ext="json-enc") mem-proxy parameter form lewat FormData sebelum
 * di-serialize sebagai JSON — setiap value, termasuk boolean yang sudah
 * dikonversi di sisi klien, dipaksa menjadi string oleh FormData.append().
 * Skema ini menerima boolean asli (test/consumer non-form) MAUPUN string
 * hasil pipeline tersebut, tanpa melonggarkan validasi untuk input lain.
 */
const zBooleanLike = z.preprocess((value) => {
  if (typeof value === 'boolean' || value === undefined) return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUTHY_STRINGS.has(normalized)) return true;
    if (FALSY_STRINGS.has(normalized)) return false;
  }
  return value;
}, z.boolean());

/**
 * Field array (mis. `stack`) yang di-assign sebagai Array lewat proxy
 * parameter htmx berubah menjadi entri FormData berganda dengan key sama —
 * Object.fromEntries() di dalam pipeline json-enc menyisakan HANYA entri
 * TERAKHIR. Klien wajib mengirim array ini sebagai string JSON (lihat
 * ProjectForm.astro/ProjectSettingsForm.astro); skema ini mem-parse-nya,
 * tetap menerima array asli untuk consumer non-form.
 */
const zJsonArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }, z.array(itemSchema));

export const ProjectInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  title: z.string().min(1).max(150),
  tag: z.enum(['SECURITY', 'WEB2', 'WEB3']),
  schemaType: z.enum(['CreativeWork', 'SoftwareApplication']).default('CreativeWork'),
  flagship: zBooleanLike.default(false),
  summary: z.string().min(1).max(200),
  bodyMarkdown: z.string().min(1),
  stack: zJsonArray(z.string().min(1)).default([]),
  liveUrl: z.union([z.url(), z.literal('')]).optional(),
  repoUrl: z.union([z.url(), z.literal('')]).optional(),
  coverImagePublicId: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
  published: zBooleanLike.default(true),
});

export type ProjectInput = z.infer<typeof ProjectInputSchema>;

export const ProjectSettingsSchema = ProjectInputSchema.pick({
  tag: true,
  schemaType: true,
  flagship: true,
  stack: true,
  coverImagePublicId: true,
  published: true,
});

export type ProjectSettingsInput = z.infer<typeof ProjectSettingsSchema>;

export const CertificationInputSchema = z.object({
  name: z.string().min(1).max(150),
  issuer: z.string().min(1).max(150),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  credentialId: z.string().max(150).optional(),
  verificationUrl: z.union([z.url(), z.literal('')]).optional(),
  assetPublicId: z.string().optional(),
  assetFormat: z.enum(['jpg', 'jpeg', 'png', 'pdf']).optional(),
  displayOrder: z.coerce.number().int().default(0),
  published: zBooleanLike.default(true),
});

export type CertificationInput = z.infer<typeof CertificationInputSchema>;

export const ProfileInputSchema = z.object({
  photoPublicId: z.string().optional(),
  cvPublicId: z.string().optional(),
});

export type ProfileInput = z.infer<typeof ProfileInputSchema>;

export const CloudinaryResourceVerifySchema = z.object({
  publicId: z.string().min(1),
  expectedResourceType: z.enum(['image', 'raw']),
});
