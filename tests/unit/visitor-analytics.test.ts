import { describe, expect, it } from 'vitest';
import { renderDailyBarChart } from '../../src/lib/render-bar-chart';
import { BOT_PATTERN, resolveDeviceType, computeDailyVisitorHash } from '../../src/lib/visitor-detection';

describe('renderDailyBarChart', () => {
  it('menampilkan pesan kosong ketika tidak ada data', () => {
    const svg = renderDailyBarChart([]);
    expect(svg).toContain('Belum ada data');
    expect(svg).not.toContain('<svg');
  });

  it('menghasilkan SVG valid dengan jumlah bar sesuai data', () => {
    const svg = renderDailyBarChart([
      { date: '2026-08-01', count: 5 },
      { date: '2026-08-02', count: 10 },
      { date: '2026-08-03', count: 2 },
    ]);
    expect(svg).toContain('<svg');
    expect((svg.match(/class="chart-bar"/g) ?? []).length).toBe(3);
  });

  it('bar dengan count tertinggi mendapat height terbesar', () => {
    const svg = renderDailyBarChart([
      { date: '2026-08-01', count: 1 },
      { date: '2026-08-02', count: 100 },
    ]);
    const heights = [...svg.matchAll(/height="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(heights[1]).toBeGreaterThan(heights[0]);
  });

  it('meng-escape karakter XML pada tanggal', () => {
    const svg = renderDailyBarChart([{ date: '2026-08-01&<test>', count: 1 }]);
    expect(svg).not.toContain('&<test>');
  });
});

describe('BOT_PATTERN', () => {
  const bots = [
    'Mozilla/5.0 (compatible; Googlebot/2.1)',
    'facebookexternalhit/1.1',
    'WhatsApp/2.23',
    'TelegramBot (like TwitterBot)',
    'AhrefsBot/7.0',
    'Mozilla/5.0 (compatible; SemrushBot/7~bl)',
    'Pingdom.com_bot_version_1.4',
  ];

  const humans = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  ];

  it.each(bots)('mengenali "%s" sebagai bot', (ua) => {
    expect(BOT_PATTERN.test(ua)).toBe(true);
  });

  it.each(humans)('tidak salah mengenali "%s" sebagai bot', (ua) => {
    expect(BOT_PATTERN.test(ua)).toBe(false);
  });
});

describe('resolveDeviceType', () => {
  it('mengenali iPhone sebagai mobile', () => {
    expect(resolveDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)')).toBe('mobile');
  });

  it('mengenali iPad sebagai tablet', () => {
    expect(resolveDeviceType('Mozilla/5.0 (iPad; CPU OS 17_0)')).toBe('tablet');
  });

  it('mengenali Android tanpa "mobile" sebagai default desktop jika tidak cocok pola', () => {
    expect(resolveDeviceType('Mozilla/5.0 (Windows NT 10.0)')).toBe('desktop');
  });

  it('mengenali Android phone sebagai mobile', () => {
    expect(resolveDeviceType('Mozilla/5.0 (Linux; Android 14; Mobile)')).toBe('mobile');
  });
});

describe('computeDailyVisitorHash', () => {
  const base = { ip: '203.0.113.10', userAgent: 'Mozilla/5.0 Test', secret: 'test-secret', date: '2026-08-08' };

  it('menghasilkan hash 16 karakter heksadesimal yang deterministik untuk input sama', () => {
    const a = computeDailyVisitorHash(base);
    const b = computeDailyVisitorHash({ ...base });
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(a).toBe(b);
  });

  it('menghasilkan hash berbeda untuk IP berbeda pada hari sama (dua pengunjung terhitung terpisah)', () => {
    const a = computeDailyVisitorHash(base);
    const b = computeDailyVisitorHash({ ...base, ip: '203.0.113.11' });
    expect(a).not.toBe(b);
  });

  it('menghasilkan hash berbeda untuk tanggal berbeda (rotasi harian, tidak ada pelacakan lintas hari)', () => {
    const day1 = computeDailyVisitorHash(base);
    const day2 = computeDailyVisitorHash({ ...base, date: '2026-08-09' });
    expect(day1).not.toBe(day2);
  });

  it('menghasilkan hash berbeda untuk secret berbeda (mengonfirmasi IP tidak bisa ditebak tanpa VISITOR_HASH_SECRET)', () => {
    const a = computeDailyVisitorHash(base);
    const b = computeDailyVisitorHash({ ...base, secret: 'secret-lain' });
    expect(a).not.toBe(b);
  });

  it('pengunjung sama, dua page view di hari sama, menghasilkan hash identik (unique bukan sekadar page view)', () => {
    const view1 = computeDailyVisitorHash(base);
    const view2 = computeDailyVisitorHash({ ...base });
    expect(view1).toBe(view2);
  });
});
