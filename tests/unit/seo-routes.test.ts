import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('../../src/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([
          { slug: 'darkstar-tools', updatedAt: new Date('2026-03-01T00:00:00Z') },
        ]),
      })),
    })),
  },
}));

import { GET as sitemapXmlGet } from '../../src/pages/sitemap.xml';
import { GET as sitemapIndexXmlGet } from '../../src/pages/sitemap_index.xml';
import { GET as sitemapHyphenIndexXmlGet } from '../../src/pages/sitemap-index.xml';

describe('SEO Routes - robots.txt and sitemap endpoints', () => {
  it('menghasilkan public/robots.txt yang mengizinkan search engine, memblokir /admin dan /api, dan merujuk sitemap.xml', () => {
    const robotsPath = join(process.cwd(), 'public/robots.txt');
    const body = readFileSync(robotsPath, 'utf-8');

    expect(body).toContain('User-agent: *');
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /admin/');
    expect(body).toContain('Disallow: /api');
    expect(body).toContain('Disallow: /api/');
    expect(body).toContain('User-agent: Googlebot');
    expect(body).toContain('User-agent: ClaudeBot');
    expect(body).toContain('User-agent: PerplexityBot');
    expect(body).toContain('User-agent: Applebot-Extended');
    expect(body).toContain('User-agent: Bytespider');
    expect(body).toContain('Disallow: /');
    expect(body).toContain('Sitemap: https://wahyuandikaputra.my.id/sitemap.xml');
    expect(body).not.toContain('/sitemap-index.xml');
  });

  it('mengembalikan HTTP 200 OK langsung dari /sitemap.xml dengan content-type application/xml tanpa redirect', async () => {
    const mockContext = {
      site: new URL('https://wahyuandikaputra.my.id/'),
    } as Parameters<typeof sitemapXmlGet>[0];

    const response = await sitemapXmlGet(mockContext);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/xml');
    expect(response.headers.get('Cache-Control')).toContain('public');
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');

    const body = await response.text();
    expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(body).toContain('<urlset');
    expect(body).toContain('<loc>https://wahyuandikaputra.my.id/</loc>');
    expect(body).toContain('<loc>https://wahyuandikaputra.my.id/work/darkstar-tools/</loc>');
  });

  it('mengembalikan redirect 301 dari /sitemap_index.xml ke /sitemap.xml', async () => {
    const mockRedirect = (url: string, status: number) =>
      new Response(null, { status, headers: { Location: url } });
    const response = await sitemapIndexXmlGet({
      redirect: mockRedirect,
    } as unknown as Parameters<typeof sitemapIndexXmlGet>[0]);

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('/sitemap.xml');
  });

  it('mengembalikan redirect 301 dari /sitemap-index.xml ke /sitemap.xml', async () => {
    const mockRedirect = (url: string, status: number) =>
      new Response(null, { status, headers: { Location: url } });
    const response = await sitemapHyphenIndexXmlGet({
      redirect: mockRedirect,
    } as unknown as Parameters<typeof sitemapHyphenIndexXmlGet>[0]);

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('/sitemap.xml');
  });
});
