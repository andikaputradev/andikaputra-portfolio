import type { Article } from '../db/schema';

/**
 * Menghitung artikel terkait berdasarkan overlap tag dengan bobot tertinggi,
 * disusul kesamaan kategori, displayOrder, dan publishedAt sebagai penentu sekunder.
 */
export function getRelatedArticles(
  currentArticle: Pick<Article, 'id' | 'slug' | 'tags' | 'category' | 'displayOrder' | 'publishedAt'>,
  allArticles: Article[],
  limit = 3,
): Article[] {
  const currentTags = new Set(
    (currentArticle.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
  );

  const candidates = allArticles.filter(
    (a) => a.id !== currentArticle.id && a.published,
  );

  const scored = candidates.map((article) => {
    const articleTags = (article.tags ?? []).map((t) => t.trim().toLowerCase());
    let tagOverlap = 0;
    for (const tag of articleTags) {
      if (currentTags.has(tag)) {
        tagOverlap++;
      }
    }
    const sameCategory = article.category === currentArticle.category ? 1 : 0;
    // Overlap tag memiliki bobot utama (10x), kesamaan kategori bobot sekunder (2x)
    const score = tagOverlap * 10 + sameCategory * 2;
    return { article, score, tagOverlap };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.article.displayOrder !== a.article.displayOrder) {
      return b.article.displayOrder - a.article.displayOrder;
    }
    return new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime();
  });

  return scored.slice(0, limit).map((s) => s.article);
}
