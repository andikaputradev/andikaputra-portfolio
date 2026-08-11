import { z } from 'astro/zod';

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  message: z.string().min(10).max(2000),
  honeypot: z.string().max(0),
  turnstileToken: z.string().min(1),
});

export type ContactInput = z.infer<typeof ContactSchema>;
