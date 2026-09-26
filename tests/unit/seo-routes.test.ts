import { describe, expect, it } from 'vitest';
import { GET as robotsGet } from '../../src/pages/robots.txt';

describe('SEO Routes — robots.txt', () => {
  it('menghasilkan robots.txt yang memblokir akses crawler ke /admin dan /api serta memuat tautan sitemap', async () => {
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
    expect(body).toContain('Sitemap:');
    expect(body).toContain('/sitemap-index.xml');
  });
});
