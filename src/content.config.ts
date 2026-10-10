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

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    category: z.enum(['SECURITY', 'WEB3', 'WEBDEV', 'GENERAL']).default('GENERAL'),
    tags: z.array(z.string()).default([]),
    coverImagePublicId: z.string().optional().nullable(),
    readingTimeMinutes: z.number().optional().nullable(),
    published: z.boolean().default(true),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    canonicalUrlOverride: z.string().optional().nullable(),
    ogImageOverride: z.string().optional().nullable(),
    publishedAt: z.coerce.date().default(() => new Date()),
  }),
});

export const collections = { projects, articles };
