import { describe, expect, it } from 'vitest';
import { getClientIp } from '../../src/lib/client-ip';


describe('getClientIp security (spoofing & injection prevention)', () => {
  it('mengutamakan x-vercel-forwarded-for dari infrastruktur Vercel', () => {
    const req = new Request('https://example.com', {
      headers: {
        'x-vercel-forwarded-for': '203.0.113.195',
        'x-forwarded-for': '1.1.1.1, 8.8.8.8',
        'x-real-ip': '10.0.0.1',
      },
    });
    expect(getClientIp(req)).toBe('203.0.113.195');
  });

  it('mengutamakan x-real-ip jika x-vercel-forwarded-for tidak ada', () => {
    const req = new Request('https://example.com', {
      headers: {
        'x-real-ip': '198.51.100.42',
        'x-forwarded-for': '1.2.3.4, 198.51.100.42',
      },
    });
    expect(getClientIp(req)).toBe('198.51.100.42');
  });

  it('mengambil IP tepercaya terakhir pada x-forwarded-for berantai (mencegah spoofing)', () => {
    const req = new Request('https://example.com', {
      headers: {
        // Klien mencoba spoof IP 10.0.0.1 di depan, proxy menambahkan 203.0.113.5
        'x-forwarded-for': '10.0.0.1, 203.0.113.5',
      },
    });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('menolak header IP yang berisi string injeksi XSS atau SQLi', () => {
    const reqXss = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '<script>alert(1)</script>',
      },
    });
    expect(getClientIp(reqXss)).toBeNull();

    const reqSqli = new Request('https://example.com', {
      headers: {
        'x-real-ip': "127.0.0.1' OR '1'='1",
      },
    });
    expect(getClientIp(reqSqli)).toBeNull();
  });

  it('menerima format IPv6 valid', () => {
    const req = new Request('https://example.com', {
      headers: {
        'x-real-ip': '2001:db8:85a3::8a2e:370:7334',
      },
    });
    expect(getClientIp(req)).toBe('2001:db8:85a3::8a2e:370:7334');
  });
});
