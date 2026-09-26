import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../../../../../db';
import { articles, articleComments } from '../../../../../db/schema';
import { CommentInputSchema, escapeHtml } from '../../../../../lib/comment-schema';
import { checkRateLimit } from '../../../../../lib/rate-limit';
import { getClientIp } from '../../../../../lib/audit';

export const prerender = false;

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug artikel tidak valid' }), { status: 400 });
  }

  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)));

  if (!article) {
    return new Response(JSON.stringify({ error: 'Artikel tidak ditemukan' }), { status: 404 });
  }

  const rows = await db
    .select({
      id: articleComments.id,
      authorName: articleComments.authorName,
      rating: articleComments.rating,
      content: articleComments.content,
      createdAt: articleComments.createdAt,
    })
    .from(articleComments)
    .where(and(eq(articleComments.articleId, article.id), eq(articleComments.approved, true)))
    .orderBy(desc(articleComments.createdAt));

  const count = rows.length;
  const sumRating = rows.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = count > 0 ? Number((sumRating / count).toFixed(1)) : 0;

  return new Response(
    JSON.stringify({
      comments: rows,
      stats: {
        count,
        averageRating,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    },
  );
};

export const POST: APIRoute = async ({ params, request }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug artikel tidak valid' }), { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body JSON tidak valid' }), { status: 400 });
  }

  const parsed = CommentInputSchema.safeParse(body);
  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    return new Response(JSON.stringify({ error: 'validation', fields }), { status: 422 });
  }

  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return new Response(JSON.stringify({ error: 'Spam terdeteksi' }), { status: 400 });
  }

  const clientIp = getClientIp(request) ?? 'anonymous';
  const rateLimit = await checkRateLimit(`comment:${clientIp}`, {
    windowMs: 10 * 60 * 1000,
    max: 5,
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

  const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && parsed.data.turnstileToken) {
    try {
      const turnstileVerify = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: parsed.data.turnstileToken,
          }),
        },
      );
      const turnstileResult = (await turnstileVerify.json()) as TurnstileVerifyResponse;
      if (!turnstileResult.success) {
        return new Response(JSON.stringify({ error: 'turnstile_failed' }), { status: 403 });
      }
    } catch (err) {
      console.error('Turnstile verification error:', err);
    }
  }

  const [article] = await db
    .select({ id: articles.id, published: articles.published })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)));

  if (!article) {
    return new Response(JSON.stringify({ error: 'Artikel tidak ditemukan' }), { status: 404 });
  }

  const sanitizedAuthor = escapeHtml(parsed.data.authorName);
  const sanitizedContent = escapeHtml(parsed.data.content);

  const [created] = await db
    .insert(articleComments)
    .values({
      articleId: article.id,
      authorName: sanitizedAuthor,
      rating: parsed.data.rating,
      content: sanitizedContent,
      approved: true,
    })
    .returning({
      id: articleComments.id,
      authorName: articleComments.authorName,
      rating: articleComments.rating,
      content: articleComments.content,
      createdAt: articleComments.createdAt,
    });

  return new Response(JSON.stringify({ success: true, comment: created }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
