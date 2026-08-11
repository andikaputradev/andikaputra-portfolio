import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { ContactSchema } from '../../lib/contact-schema';

export const prerender = false;

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

interface ResendErrorBody {
  message?: string;
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    return new Response(JSON.stringify({ error: 'validation', fields }), { status: 422 });
  }

  const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!turnstileSecret) {
    console.error('contact.ts: TURNSTILE_SECRET_KEY tidak terkonfigurasi di environment');
    return new Response(JSON.stringify({ error: 'turnstile_unavailable' }), { status: 503 });
  }

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
    console.error('contact.ts: verifikasi Turnstile gagal —', turnstileResult['error-codes']);
    return new Response(JSON.stringify({ error: 'turnstile_failed' }), { status: 403 });
  }

  const resendApiKey = import.meta.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('contact.ts: RESEND_API_KEY tidak terkonfigurasi di environment');
    return new Response(JSON.stringify({ error: 'email_unavailable' }), { status: 503 });
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'wahyuandikaputra.co.id@gmail.com',
      reply_to: parsed.data.email,
      subject: `Portfolio contact — ${parsed.data.name}`,
      text: parsed.data.message,
    }),
  });

  if (!emailResponse.ok) {
    const errorBody = (await emailResponse.json().catch(() => ({}))) as ResendErrorBody;
    console.error('Resend API error:', emailResponse.status, errorBody.message);
    return new Response(JSON.stringify({ error: 'email_failed' }), { status: 502 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
