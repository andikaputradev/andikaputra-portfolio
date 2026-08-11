import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import { z } from 'astro/zod';
import { db } from '../src/db';
import { projects } from '../src/db/schema';

const ProjectFrontmatterSchema = z.object({
  title: z.string(),
  tag: z.enum(['SECURITY', 'WEB2', 'WEB3']),
  flagship: z.boolean().default(false),
  summary: z.string().max(200),
  stack: z.array(z.string()).optional(),
  liveUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  coverImage: z.string(),
  order: z.number().int(),
  publishedAt: z.coerce.date(),
});

const CONTENT_DIR = join(process.cwd(), 'src/content/projects');

async function migrate() {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));

  let migrated = 0;
  let skipped = 0;

  for (const file of files) {
    const raw = readFileSync(join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const slug = basename(file, '.md');

    const parsed = ProjectFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`Frontmatter tidak valid di ${file}:`, z.treeifyError(parsed.error));
      process.exitCode = 1;
      continue;
    }

    const schemaType = slug === 'darkstar-tools' ? 'SoftwareApplication' : 'CreativeWork';

    const result = await db
      .insert(projects)
      .values({
        slug,
        title: parsed.data.title,
        tag: parsed.data.tag,
        schemaType,
        flagship: parsed.data.flagship,
        summary: parsed.data.summary,
        bodyMarkdown: content.trim(),
        stack: parsed.data.stack ?? [],
        liveUrl: parsed.data.liveUrl || null,
        repoUrl: parsed.data.repoUrl || null,
        coverImagePath: parsed.data.coverImage || null,
        displayOrder: parsed.data.order,
        published: true,
        publishedAt: parsed.data.publishedAt,
      })
      .onConflictDoNothing({ target: projects.slug })
      .returning({ id: projects.id });

    if (result.length > 0) {
      migrated += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`Migrated ${migrated} of ${files.length} projects.`);
  if (skipped > 0) {
    console.log(`${skipped} dilewati (slug sudah ada di database — idempotent re-run).`);
  }
}

migrate()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((error) => {
    console.error('Migrasi gagal:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
