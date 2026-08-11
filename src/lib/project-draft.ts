import { z } from 'astro/zod';
import type { Project } from '../db/schema';

export const ProjectContentSchema = z.object({
  title: z.string().min(1).max(150),
  summary: z.string().min(1).max(200),
  bodyMarkdown: z.string().min(1),
  liveUrl: z.union([z.url(), z.literal('')]).optional(),
  repoUrl: z.union([z.url(), z.literal('')]).optional(),
});

export const ProjectContentPutSchema = z.object({
  saveMode: z.enum(['draft', 'publish']),
  data: ProjectContentSchema,
});

export function resolveProjectView(project: Project): Project {
  if (!project.draftData) return project;
  return { ...project, ...project.draftData };
}
