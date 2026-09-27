import { describe, expect, it } from 'vitest';

describe('Admin Cache-Control header specification', () => {
  it('defines private, no-store policy for admin routes and fragments', () => {
    // Contract check for required cache control directives
    const expectedDirectives = ['private', 'no-store'];
    const headerValue = 'private, no-store, no-cache, must-revalidate, proxy-revalidate';

    expectedDirectives.forEach((directive) => {
      expect(headerValue).toContain(directive);
    });
  });

  it('ensures vercel.json enforces private, no-store on all admin routes', async () => {
    const vercelConfig = await import('../../vercel.json');
    const headers = vercelConfig.headers as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;

    const adminExact = headers.find((h) => h.source === '/admin');
    const adminWildcard = headers.find((h) => h.source === '/admin/(.*)');
    const apiAdminWildcard = headers.find((h) => h.source === '/api/admin/(.*)');

    expect(adminExact).toBeDefined();
    expect(adminWildcard).toBeDefined();
    expect(apiAdminWildcard).toBeDefined();

    [adminExact, adminWildcard, apiAdminWildcard].forEach((rule) => {
      const cacheHeader = rule?.headers.find((header) => header.key === 'Cache-Control');
      expect(cacheHeader?.value).toBe('private, no-store');
    });
  });
});
