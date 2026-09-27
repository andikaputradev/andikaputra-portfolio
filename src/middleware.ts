import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';
import { generateCsrfToken, CSRF_COOKIE_NAME } from './lib/csrf';
import { checkRateLimit } from './lib/rate-limit';
import { getClientIp } from './lib/audit';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const normalizedPath = pathname.toLowerCase();
  if (normalizedPath.startsWith('/api/auth/sign-up') || normalizedPath.startsWith('/api/auth/register')) {
    return new Response(JSON.stringify({ error: 'Sign-up publik dinonaktifkan' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting di level middleware untuk seluruh endpoint publik yang menulis data (OWASP ASVS Level 2)
  const isPublicWrite =
    context.request.method === 'POST' &&
    (normalizedPath === '/api/contact' || normalizedPath.startsWith('/api/public/articles/'));

  if (isPublicWrite) {
    let clientIp: string | null = null;
    try {
      clientIp = getClientIp(context.request) ?? context.clientAddress ?? 'anonymous';
    } catch {
      clientIp = 'anonymous';
    }
    const rateLimit = await checkRateLimit(`public-write:${clientIp}`, {
      windowMs: 10 * 60 * 1000,
      max: 10,
    });
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': '0',
        },
      });
    }
  }

  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');

  if (!isAdminApi && !isAdminPage) {
    return next();
  }


  const session = await auth.api.getSession({ headers: context.request.headers });

  if (pathname === '/admin/login') {
    if (session) {
      return context.redirect('/admin');
    }
    return next();
  }

  if (!session) {
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login');
  }

  context.locals.admin = session.user;
  context.locals.session = session.session;

  if (isAdminApi) {
    const rateLimit = await checkRateLimit(`admin-crud:${session.user.id}`);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': '0',
        },
      });
    }
  }

  if (!context.cookies.has(CSRF_COOKIE_NAME)) {
    context.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
  }

  const response = await next();
  if (isAdminApi || isAdminPage) {
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  return response;
});
