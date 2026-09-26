import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const site = (import.meta.env.SITE ?? 'https://wahyuandikaputra.my.id').replace(/\/$/, '');
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${site}/sitemap-index.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
