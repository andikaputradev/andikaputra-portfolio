import type { APIRoute } from 'astro';
import { renderOgPng } from '../../lib/og-image';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const png = await renderOgPng(
    {
      eyebrow: 'SOFTWARE ENGINEER — SECURITY SPECIALIST — WEB3',
      title: 'Wahyu Andika Putra',
      subtitle:
        'Software engineer and cybersecurity specialist working across Web2 product engineering and Web3 protocol security.',
    },
    context.url,
  );

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
