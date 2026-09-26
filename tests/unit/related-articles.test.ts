import { describe, expect, it } from 'vitest';
import { getRelatedArticles } from '../../src/lib/related-articles';
import type { Article } from '../../src/db/schema';

describe('related-articles — getRelatedArticles', () => {
  const currentArticle: Pick<
    Article,
    'id' | 'slug' | 'tags' | 'category' | 'displayOrder' | 'publishedAt'
  > = {
    id: 10,
    slug: 'artikel-acuan',
    tags: ['web3', 'smart contract', 'security', 'audit'],
    category: 'WEB3',
    displayOrder: 1,
    publishedAt: new Date('2026-01-01'),
  };

  const pool: Article[] = [
    {
      id: 10,
      slug: 'artikel-acuan',
      title: 'Artikel Acuan',
      category: 'WEB3',
      summary: '',
      bodyMarkdown: '',
      coverImagePublicId: null,
      tags: ['web3', 'smart contract', 'security', 'audit'],
      readingTimeMinutes: 5,
      published: true,
      displayOrder: 1,
      metaTitle: null,
      metaDescription: null,
      canonicalUrlOverride: null,
      ogImageOverride: null,
      publishedAt: new Date('2026-01-01'),
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 11,
      slug: 'artikel-overlap-tinggi',
      title: 'Artikel Overlap Tinggi (3 tag sama)',
      category: 'SECURITY',
      summary: '',
      bodyMarkdown: '',
      coverImagePublicId: null,
      tags: ['web3', 'smart contract', 'security', 'solidity'],
      readingTimeMinutes: 5,
      published: true,
      displayOrder: 2,
      metaTitle: null,
      metaDescription: null,
      canonicalUrlOverride: null,
      ogImageOverride: null,
      publishedAt: new Date('2026-01-02'),
      createdAt: new Date('2026-01-02'),
      updatedAt: new Date('2026-01-02'),
    },
    {
      id: 12,
      slug: 'artikel-overlap-sedang',
      title: 'Artikel Overlap Sedang (1 tag sama)',
      category: 'WEBDEV',
      summary: '',
      bodyMarkdown: '',
      coverImagePublicId: null,
      tags: ['security', 'owasp', 'pentest'],
      readingTimeMinutes: 5,
      published: true,
      displayOrder: 3,
      metaTitle: null,
      metaDescription: null,
      canonicalUrlOverride: null,
      ogImageOverride: null,
      publishedAt: new Date('2026-01-03'),
      createdAt: new Date('2026-01-03'),
      updatedAt: new Date('2026-01-03'),
    },
    {
      id: 13,
      slug: 'artikel-kategori-sama-tanpa-overlap-tag',
      title: 'Artikel Kategori Sama (0 tag sama)',
      category: 'WEB3',
      summary: '',
      bodyMarkdown: '',
      coverImagePublicId: null,
      tags: ['defi', 'tokenomics'],
      readingTimeMinutes: 5,
      published: true,
      displayOrder: 4,
      metaTitle: null,
      metaDescription: null,
      canonicalUrlOverride: null,
      ogImageOverride: null,
      publishedAt: new Date('2026-01-04'),
      createdAt: new Date('2026-01-04'),
      updatedAt: new Date('2026-01-04'),
    },
    {
      id: 14,
      slug: 'artikel-draft-harus-diabaikan',
      title: 'Artikel Draft',
      category: 'WEB3',
      summary: '',
      bodyMarkdown: '',
      coverImagePublicId: null,
      tags: ['web3', 'smart contract', 'security', 'audit'],
      readingTimeMinutes: 5,
      published: false,
      displayOrder: 5,
      metaTitle: null,
      metaDescription: null,
      canonicalUrlOverride: null,
      ogImageOverride: null,
      publishedAt: new Date('2026-01-05'),
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    },
  ];

  it('memprioritaskan artikel dengan overlap tag tertinggi di atas sekadar artikel terbaru', () => {
    const related = getRelatedArticles(currentArticle, pool, 3);

    expect(related).toHaveLength(3);
    // Tidak boleh menyertakan dirinya sendiri
    expect(related.some((a) => a.id === currentArticle.id)).toBe(false);
    // Tidak boleh menyertakan artikel unpublished (draft)
    expect(related.some((a) => !a.published)).toBe(false);

    // Artikel dengan overlap 3 tag ('artikel-overlap-tinggi') harus peringkat pertama
    expect(related[0].slug).toBe('artikel-overlap-tinggi');
    // Artikel dengan overlap 1 tag ('artikel-overlap-sedang') harus di depan artikel 0 tag
    expect(related[1].slug).toBe('artikel-overlap-sedang');
    // Artikel kategori sama (bobot sekunder) ada di urutan ketiga
    expect(related[2].slug).toBe('artikel-kategori-sama-tanpa-overlap-tag');
  });

  it('menghormati batas limit parameter', () => {
    const related = getRelatedArticles(currentArticle, pool, 1);
    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe('artikel-overlap-tinggi');
  });
});
