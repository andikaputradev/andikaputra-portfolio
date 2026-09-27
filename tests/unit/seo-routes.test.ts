import { describe, expect, it } from 'vitest';
import { GET as robotsGet } from '../../src/pages/robots.txt';
import { GET as sitemapXmlGet } from '../../src/pages/sitemap.xml';
import { GET as sitemapIndexXmlGet } from '../../src/pages/sitemap_index.xml';

describe('SEO Routes - robots.txt and sitemap redirects', () => {
  it('menghasilkan robots.txt yang memblokir crawler ke /admin dan /api serta mengatur bot AI', async () => {
    const mockContext = {} as Parameters<typeof robotsGet>[0];
    const response = await robotsGet(mockContext);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');

    const body = await response.text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /admin/');
    expect(body).toContain('Disallow: /api');
    expect(body).toContain('Disallow: /api/');
    expect(body).toContain('User-agent: ClaudeBot');
    expect(body).toContain('User-agent: PerplexityBot');
    expect(body).toContain('User-agent: Applebot-Extended');
    expect(body).toContain('User-agent: Bytespider');
    expect(body).toContain('Disallow: /');
    expect(body).toContain('Sitemap:');
    expect(body).toContain('/sitemap-index.xml');
  });

  it('mengembalikan redirect 301 dari /sitemap.xml ke /sitemap-index.xml', async () => {
    const mockRedirect = (url: string, status: number) =>
      new Response(null, { status, headers: { Location: url } });
    const response = await sitemapXmlGet({
      redirect: mockRedirect,
    } as unknown as Parameters<typeof sitemapXmlGet>[0]);

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('/sitemap-index.xml');
  });

  it('mengembalikan redirect 301 dari /sitemap_index.xml ke /sitemap-index.xml', async () => {
    const mockRedirect = (url: string, status: number) =>
      new Response(null, { status, headers: { Location: url } });
    const response = await sitemapIndexXmlGet({
      redirect: mockRedirect,
    } as unknown as Parameters<typeof sitemapIndexXmlGet>[0]);

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('/sitemap-index.xml');
  });
});
