import { describe, expect, it } from 'vitest';
import { resolveProjectView } from '../../src/lib/project-draft';
import { ReorderInputSchema } from '../../src/lib/reorder-schema';
import type { Project } from '../../src/db/schema';

const baseProject: Project = {
  id: 1,
  slug: 'contoh-proyek',
  title: 'Judul Live',
  tag: 'WEB2',
  schemaType: 'CreativeWork',
  flagship: false,
  summary: 'Ringkasan live.',
  bodyMarkdown: 'Isi live.',
  stack: ['Astro'],
  liveUrl: null,
  repoUrl: null,
  coverImagePath: null,
  coverImagePublicId: null,
  displayOrder: 1,
  published: true,
  draftData: null,
  publishedAt: new Date('2026-01-01'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('resolveProjectView', () => {
  it('mengembalikan data live apa adanya ketika tidak ada draft', () => {
    const result = resolveProjectView(baseProject);
    expect(result.title).toBe('Judul Live');
    expect(result.bodyMarkdown).toBe('Isi live.');
  });

  it('menimpa field konten dengan draft ketika draft ada', () => {
    const withDraft: Project = {
      ...baseProject,
      draftData: {
        title: 'Judul Draft',
        summary: 'Ringkasan draft.',
        bodyMarkdown: 'Isi draft.',
        liveUrl: 'https://draft.example.com',
        repoUrl: null,
      },
    };
    const result = resolveProjectView(withDraft);
    expect(result.title).toBe('Judul Draft');
    expect(result.summary).toBe('Ringkasan draft.');
    expect(result.bodyMarkdown).toBe('Isi draft.');
    expect(result.liveUrl).toBe('https://draft.example.com');
  });

  it('tidak mengubah field struktural (tag, published, slug) meski ada draft', () => {
    const withDraft: Project = {
      ...baseProject,
      published: true,
      tag: 'SECURITY',
      draftData: {
        title: 'Judul Draft',
        summary: 'Ringkasan draft.',
        bodyMarkdown: 'Isi draft.',
      },
    };
    const result = resolveProjectView(withDraft);
    expect(result.tag).toBe('SECURITY');
    expect(result.published).toBe(true);
    expect(result.slug).toBe('contoh-proyek');
  });
});

describe('ReorderInputSchema', () => {
  it('menerima array valid', () => {
    const result = ReorderInputSchema.safeParse([
      { id: 1, displayOrder: 3 },
      { id: 2, displayOrder: 2 },
    ]);
    expect(result.success).toBe(true);
  });

  it('menolak array kosong', () => {
    expect(ReorderInputSchema.safeParse([]).success).toBe(false);
  });

  it('menolak id non-integer', () => {
    const result = ReorderInputSchema.safeParse([{ id: 1.5, displayOrder: 1 }]);
    expect(result.success).toBe(false);
  });

  it('menolak id negatif', () => {
    const result = ReorderInputSchema.safeParse([{ id: -1, displayOrder: 1 }]);
    expect(result.success).toBe(false);
  });

  it('menolak payload yang bukan array', () => {
    expect(ReorderInputSchema.safeParse({ id: 1, displayOrder: 1 }).success).toBe(false);
  });
});
