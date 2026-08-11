import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';
import { generateCsrfToken, CSRF_COOKIE_NAME } from './lib/csrf';
import { checkRateLimit } from './lib/rate-limit';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/api/auth/sign-up')) {
    return new Response(JSON.stringify({ error: 'Sign-up publik dinonaktifkan' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
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

  return next();
});
