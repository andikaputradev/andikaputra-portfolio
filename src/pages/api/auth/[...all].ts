import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth';

export const prerender = false;

export const ALL: APIRoute = async (ctx) => {
  try {
    ctx.request.headers.set('x-forwarded-for', ctx.clientAddress);
  } catch {
    /* clientAddress tidak tersedia di konteks ini; rate limit tetap berjalan tanpa IP granular */
  }
  return auth.handler(ctx.request);
};
