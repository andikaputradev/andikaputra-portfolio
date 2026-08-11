import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tag: z.enum(['SECURITY', 'WEB2', 'WEB3']),
    flagship: z.boolean().default(false),
    summary: z.string().max(200),
    stack: z.array(z.string()).optional(),
    liveUrl: z.url().optional(),
    repoUrl: z.url().optional(),
    coverImage: z.string(),
    order: z.number().int(),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = { projects };
