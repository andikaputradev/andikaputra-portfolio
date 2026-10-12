import { describe, expect, it } from 'vitest';
import {
  ProjectInputSchema,
  ProjectSettingsSchema,
  ArticleInputSchema,
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

  it('menolak field tidak dikenal via .strict()', () => {
    const result = ProfileInputSchema.safeParse({
      photoPublicId: 'portfolio/profile/photo/x',
      injectedField: 'malicious',
    });
    expect(result.success).toBe(false);
  });
});

describe('Strict schema validation across mutation models (OWASP ASVS V5.1)', () => {
  it('ProjectInputSchema menolak field tidak dikenal', () => {
    const result = ProjectInputSchema.safeParse({
      ...validProject,
      adminOverrideRole: 'root',
    });
    expect(result.success).toBe(false);
  });

  it('ProjectSettingsSchema menolak field tidak dikenal', () => {
    const result = ProjectSettingsSchema.safeParse({
      tag: 'SECURITY',
      published: true,
      extraUnauthorizedKey: 123,
    });
    expect(result.success).toBe(false);
  });

  it('ProjectSettingsSchema menerima displayOrder valid', () => {
    const result = ProjectSettingsSchema.safeParse({
      tag: 'SECURITY',
      displayOrder: 5,
      published: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayOrder).toBe(5);
    }
  });

  it('ArticleInputSchema menolak field tidak dikenal', () => {
    const result = ArticleInputSchema.safeParse({
      slug: 'security-audit-2026',
      title: 'Security Audit',
      category: 'SECURITY',
      summary: 'Summary of audit',
      bodyMarkdown: '# Content',
      isSecretInternalArticle: true,
    });
    expect(result.success).toBe(false);
  });

  it('CertificationInputSchema menolak field tidak dikenal', () => {
    const result = CertificationInputSchema.safeParse({
      name: 'OSCP',
      issuer: 'OffSec',
      issueDate: new Date(),
      fakeVerifiedBadge: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('ArticleInputSchema — Field and SEO Validations', () => {
  const validArticle = {
    slug: 'analisis-reentrancy',
    title: 'Analisis Reentrancy Smart Contract',
    category: 'SECURITY' as const,
    summary: 'Pembahasan mendalam kerentanan reentrancy pada Solidity.',
    bodyMarkdown: '# Analisis Reentrancy\n\nPenjelasan detail...',
    tags: ['web3', 'security', 'solidity'],
    readingTimeMinutes: 7,
    displayOrder: 2,
    published: true,
    metaTitle: 'Analisis Reentrancy Smart Contract | Keamanan Web3',
    metaDescription: 'Pelajari mekanisme eksploitasi reentrancy attack dan cara mitigasi pola checks-effects-interactions.',
    canonicalUrlOverride: 'https://example.com/original-article',
    ogImageOverride: 'https://example.com/custom-og.png',
  };

  it('menerima payload artikel lengkap yang valid', () => {
    const result = ArticleInputSchema.safeParse(validArticle);
    expect(result.success).toBe(true);
  });

  it('menerima tags sebagai string JSON dari form HTMX json-enc', () => {
    const result = ArticleInputSchema.safeParse({
      ...validArticle,
      tags: JSON.stringify(['solidity', 'audit']),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(['solidity', 'audit']);
    }
  });

  it('menerima published sebagai string "true", "false", atau "on"', () => {
    const resOn = ArticleInputSchema.safeParse({ ...validArticle, published: 'on' });
    expect(resOn.success).toBe(true);
    if (resOn.success) expect(resOn.data.published).toBe(true);

    const resFalse = ArticleInputSchema.safeParse({ ...validArticle, published: 'false' });
    expect(resFalse.success).toBe(true);
    if (resFalse.success) expect(resFalse.data.published).toBe(false);
  });

  it('menerima canonicalUrlOverride kosong (string literal "")', () => {
    const result = ArticleInputSchema.safeParse({
      ...validArticle,
      canonicalUrlOverride: '',
    });
    expect(result.success).toBe(true);
  });

  it('menolak canonicalUrlOverride dengan format URL tidak valid', () => {
    const result = ArticleInputSchema.safeParse({
      ...validArticle,
      canonicalUrlOverride: 'bukan-url-valid',
    });
    expect(result.success).toBe(false);
  });

  it('menolak metaTitle melebihi 60 karakter', () => {
    const result = ArticleInputSchema.safeParse({
      ...validArticle,
      metaTitle: 'x'.repeat(61),
    });
    expect(result.success).toBe(false);
  });

  it('menolak metaDescription melebihi 160 karakter', () => {
    const result = ArticleInputSchema.safeParse({
      ...validArticle,
      metaDescription: 'x'.repeat(161),
    });
    expect(result.success).toBe(false);
  });
});

