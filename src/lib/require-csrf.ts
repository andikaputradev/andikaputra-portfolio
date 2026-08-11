import type { APIContext } from 'astro';
import { verifyCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf';

export function csrfError(): Response {
  return new Response(JSON.stringify({ error: 'CSRF token tidak valid' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function isCsrfValid(context: Pick<APIContext, 'request' | 'cookies'>): boolean {
  const cookieToken = context.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = context.request.headers.get(CSRF_HEADER_NAME);
  return verifyCsrfToken(cookieToken, headerToken);
}
