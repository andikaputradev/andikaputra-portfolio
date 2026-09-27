import { describe, expect, it, vi, beforeEach } from 'vitest';
import { recordVisit, isPrefetch } from '../../src/lib/track-visit';
import { pageViews } from '../../src/db/schema';

// Mock database to capture and assert exact inserts
const mockInsertValues = vi.fn().mockResolvedValue([{ id: 1 }]);
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });

vi.mock('../../src/db', () => ({
  db: {
    insert: (table: unknown) => mockInsert(table),
  },
}));

describe('isPrefetch', () => {
  it('returns true for Purpose: prefetch', () => {
    const req = new Request('http://localhost:4321/artikel', {
      headers: { purpose: 'prefetch' },
    });
    expect(isPrefetch(req)).toBe(true);
  });

  it('returns true for Sec-Purpose: prefetch', () => {
    const req = new Request('http://localhost:4321/artikel', {
      headers: { 'sec-purpose': 'prefetch' },
    });
    expect(isPrefetch(req)).toBe(true);
  });

  it('returns true for Sec-Purpose: prerender', () => {
    const req = new Request('http://localhost:4321/artikel', {
      headers: { 'sec-purpose': 'prerender' },
    });
    expect(isPrefetch(req)).toBe(true);
  });

  it('returns true for X-Purpose: preview', () => {
    const req = new Request('http://localhost:4321/artikel', {
      headers: { 'x-purpose': 'preview' },
    });
    expect(isPrefetch(req)).toBe(true);
  });

  it('returns true for X-Astro-Prefetch: true', () => {
    const req = new Request('http://localhost:4321/artikel', {
      headers: { 'x-astro-prefetch': 'true' },
    });
    expect(isPrefetch(req)).toBe(true);
  });

  it('returns false for standard navigation requests', () => {
    const req = new Request('http://localhost:4321/artikel', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        accept: 'text/html,application/xhtml+xml',
      },
    });
    expect(isPrefetch(req)).toBe(false);
  });
});

describe('recordVisit (page_views logging)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VISITOR_HASH_SECRET = 'unit-test-hash-secret';
  });

  it('simulates 1 user visit and asserts exactly 1 page_views row is recorded', async () => {
    const req = new Request('http://localhost:4321/artikel', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        'x-forwarded-for': '203.0.113.50',
        referer: 'https://google.com',
      },
    });

    const recorded = await recordVisit(req, '/artikel');

    expect(recorded).toBe(true);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith(pageViews);
    expect(mockInsertValues).toHaveBeenCalledTimes(1);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/artikel',
        deviceType: 'desktop',
        referrer: 'https://google.com',
        visitorHash: expect.any(String),
      }),
    );
  });

  it('filters out bot visits and records 0 rows', async () => {
    const botReq = new Request('http://localhost:4321/artikel', {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'x-forwarded-for': '66.249.66.1',
      },
    });

    const recorded = await recordVisit(botReq, '/artikel');

    expect(recorded).toBe(false);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it('filters out prefetch requests and records 0 rows to prevent duplicate counts', async () => {
    const prefetchReq = new Request('http://localhost:4321/artikel', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        'sec-purpose': 'prefetch',
        'x-forwarded-for': '203.0.113.50',
      },
    });

    const recorded = await recordVisit(prefetchReq, '/artikel');

    expect(recorded).toBe(false);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it('normalizes trailing slashes so /artikel/ and /artikel record the same path', async () => {
    const req = new Request('http://localhost:4321/artikel/', {
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'x-forwarded-for': '203.0.113.50',
      },
    });

    const recorded = await recordVisit(req, '/artikel/');

    expect(recorded).toBe(true);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/artikel',
        deviceType: 'mobile',
      }),
    );
  });

  it('preserves visitor deduplication key across multiple page views in the same session without cookies', async () => {
    const ip = '198.51.100.22';
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

    const req1 = new Request('http://localhost:4321/', {
      headers: { 'user-agent': userAgent, 'x-forwarded-for': ip },
    });
    const req2 = new Request('http://localhost:4321/jasa', {
      headers: { 'user-agent': userAgent, 'x-forwarded-for': ip },
    });

    await recordVisit(req1, '/');
    await recordVisit(req2, '/jasa');

    expect(mockInsertValues).toHaveBeenCalledTimes(2);

    const firstCallArgs = mockInsertValues.mock.calls[0][0];
    const secondCallArgs = mockInsertValues.mock.calls[1][0];

    expect(firstCallArgs.visitorHash).toBeTruthy();
    expect(firstCallArgs.visitorHash).toBe(secondCallArgs.visitorHash);
    expect(firstCallArgs.path).toBe('/');
    expect(secondCallArgs.path).toBe('/jasa');
  });
});
