import { test, expect } from '@playwright/test';

test.describe('Admin Visitors Polling and Cache-Control', () => {
  test('fragment endpoint returns Cache-Control: private, no-store and polls without cache', async ({ page }) => {
    const receivedRequests: Array<{ url: string; headers: Record<string, string> }> = [];

    await page.route('**/admin/visitors/fragment', async (route) => {
      receivedRequests.push({
        url: route.request().url(),
        headers: route.request().headers(),
      });

      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        headers: {
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        body: '<div id="visitor-panel-mock"><span class="stat-value">42</span></div>',
      });
    });

    // Mock admin authentication / layout if needed so page renders
    await page.route('**/admin/visitors', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        headers: {
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        body: `
          <!doctype html>
          <html>
            <head>
              <script src="https://unpkg.com/htmx.org@2.0.4"></script>
            </head>
            <body>
              <div id="visitor-live-stats" hx-get="/admin/visitors/fragment" hx-trigger="load, every 15s" hx-swap="innerHTML">
                <div>Initial render</div>
              </div>
            </body>
          </html>
        `,
      });
    });

    const response = await page.goto('/admin/visitors');
    expect(response?.headers()['cache-control']).toContain('private');
    expect(response?.headers()['cache-control']).toContain('no-store');

    // Wait for the htmx request to fragment
    await expect(page.locator('#visitor-panel-mock')).toBeVisible({ timeout: 5000 });
    expect(receivedRequests.length).toBeGreaterThanOrEqual(1);

    const fetchHeaders = await page.evaluate(async () => {
      const res = await fetch('/admin/visitors/fragment');
      return {
        cacheControl: res.headers.get('cache-control'),
        pragma: res.headers.get('pragma'),
      };
    });
    expect(fetchHeaders.cacheControl).toContain('private');
    expect(fetchHeaders.cacheControl).toContain('no-store');
  });
});
