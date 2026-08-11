import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const site = import.meta.env.SITE ?? 'https://wahyuandikaputra.dev';
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap-index.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
