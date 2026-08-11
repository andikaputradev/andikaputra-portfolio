import { randomBytes, timingSafeEqual } from 'node:crypto';

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(): string {
  return randomBytes(24).toString('hex');
}

export function verifyCsrfToken(cookieToken?: string | null, headerToken?: string | null): boolean {
  if (!cookieToken || !headerToken) return false;
  const cookieBuf = Buffer.from(cookieToken);
  const headerBuf = Buffer.from(headerToken);
  if (cookieBuf.length !== headerBuf.length) return false;
  return timingSafeEqual(cookieBuf, headerBuf);
}
