import { z } from 'astro/zod';

export const ReorderInputSchema = z
  .array(
    z.object({
      id: z.number().int().positive(),
      displayOrder: z.number().int(),
    }),
  )
  .min(1)
  .max(200);

export type ReorderInput = z.infer<typeof ReorderInputSchema>;
