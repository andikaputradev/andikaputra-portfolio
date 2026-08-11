import { describe, expect, it } from 'vitest';
import {
  ProjectInputSchema,
  CertificationInputSchema,
  ProfileInputSchema,
} from '../../src/lib/admin-schemas';

const validProject = {
  slug: 'akademi-crypto',
  title: 'Akademi Crypto',
  tag: 'WEB3' as const,
  schemaType: 'CreativeWork' as const,
  flagship: false,
  summary: 'Platform edukasi kripto.',
  bodyMarkdown: 'Konten lengkap proyek.',
  stack: ['Astro', 'TypeScript'],
  liveUrl: 'https://example.com',
  repoUrl: 'https://github.com/example/repo',
  displayOrder: 1,
  published: true,
};

describe('ProjectInputSchema', () => {
  it('accepts fully valid input', () => {
    expect(ProjectInputSchema.safeParse(validProject).success).toBe(true);
  });

  it('rejects slug dengan huruf kapital', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, slug: 'Akademi-Crypto' });
    expect(result.success).toBe(false);
  });

  it('rejects slug dengan spasi', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, slug: 'akademi crypto' });
    expect(result.success).toBe(false);
  });

  it('rejects tag di luar enum yang diizinkan', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, tag: 'WEB4' });
    expect(result.success).toBe(false);
  });

  it('rejects summary lebih dari 200 karakter', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, summary: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('menerima liveUrl kosong (string literal)', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, liveUrl: '' });
    expect(result.success).toBe(true);
  });

  it('rejects liveUrl yang bukan URL valid', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, liveUrl: 'bukan-url' });
    expect(result.success).toBe(false);
  });

  it('default flagship ke false jika tidak disertakan', () => {
    const { flagship: _omit, ...rest } = validProject;
    const result = ProjectInputSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.flagship).toBe(false);
  });

  it('rejects bodyMarkdown kosong', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, bodyMarkdown: '' });
    expect(result.success).toBe(false);
  });

  it('menerima published/flagship sebagai string "true"/"false" (bentuk kiriman htmx json-enc)', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, published: 'true', flagship: 'false' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.published).toBe(true);
      expect(result.data.flagship).toBe(false);
    }
  });

  it('menerima published sebagai string "on" (checkbox tidak dinormalisasi)', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, published: 'on' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.published).toBe(true);
  });

  it('rejects string boolean yang tidak dikenali', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, published: 'maybe' });
    expect(result.success).toBe(false);
  });

  it('menerima stack sebagai string JSON (bentuk kiriman htmx json-enc)', () => {
    const result = ProjectInputSchema.safeParse({
      ...validProject,
      stack: JSON.stringify(['Astro', 'TypeScript', 'GSAP']),
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.stack).toEqual(['Astro', 'TypeScript', 'GSAP']);
  });

  it('rejects stack berupa string tunggal bukan-JSON (gejala bug array-collapse sebelum diperbaiki)', () => {
    const result = ProjectInputSchema.safeParse({ ...validProject, stack: 'GSAP' });
    expect(result.success).toBe(false);
  });
});

const validCertification = {
  name: 'CISSP-ISSAP',
  issuer: 'ISC2',
  issueDate: new Date('2022-01-01'),
  displayOrder: 0,
  published: true,
};

describe('CertificationInputSchema', () => {
  it('accepts fully valid input', () => {
    expect(CertificationInputSchema.safeParse(validCertification).success).toBe(true);
  });

  it('menerima issueDate sebagai string ISO (coerced ke Date)', () => {
    const result = CertificationInputSchema.safeParse({
      ...validCertification,
      issueDate: '2022-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects tanpa issuer', () => {
    const { issuer: _omit, ...rest } = validCertification;
    const result = CertificationInputSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects verificationUrl yang bukan URL valid', () => {
    const result = CertificationInputSchema.safeParse({
      ...validCertification,
      verificationUrl: 'tidak-valid',
    });
    expect(result.success).toBe(false);
  });

  it('menerima published sebagai string "false" (bentuk kiriman htmx json-enc)', () => {
    const result = CertificationInputSchema.safeParse({ ...validCertification, published: 'false' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.published).toBe(false);
  });
});

describe('ProfileInputSchema', () => {
  it('menerima payload kosong (semua field opsional)', () => {
    expect(ProfileInputSchema.safeParse({}).success).toBe(true);
  });

  it('menerima photoPublicId saja', () => {
    const result = ProfileInputSchema.safeParse({ photoPublicId: 'portfolio/profile/photo/x' });
    expect(result.success).toBe(true);
  });
});
