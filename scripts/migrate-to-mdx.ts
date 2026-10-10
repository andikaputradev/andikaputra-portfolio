import { config } from 'dotenv';
config();
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const { db } = await import('../src/db/index.js');
  const { articles } = await import('../src/db/schema.js');
  const allArticles = await db.select().from(articles);
  const dir = path.join(process.cwd(), 'src/content/articles');
  await fs.mkdir(dir, { recursive: true });

  for (const article of allArticles) {
    const filePath = path.join(dir, `${article.slug}.mdx`);
    const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
summary: "${article.summary.replace(/"/g, '\\"')}"
category: "${article.category}"
tags: ${JSON.stringify(article.tags)}
${article.coverImagePublicId ? `coverImagePublicId: "${article.coverImagePublicId}"` : ''}
${article.readingTimeMinutes ? `readingTimeMinutes: ${article.readingTimeMinutes}` : ''}
published: ${article.published}
publishedAt: "${article.publishedAt.toISOString()}"
---

${article.bodyMarkdown}
`;
    await fs.writeFile(filePath, frontmatter);
    console.log(`Migrated ${article.slug}`);
  }
}

main().catch(console.error);
