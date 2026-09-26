const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^[0-9a-fA-F:]+$/;

export function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  if (IPV4_REGEX.test(ip)) return true;
  if (ip === '::1') return true;
  return ip.includes(':') && IPV6_REGEX.test(ip);
}

/**
 * Mengambil IP klien secara aman.
 * Mengutamakan header tepercaya dari infrastruktur Vercel (`x-vercel-forwarded-for` / `x-real-ip`).
 * Jika menggunakan `x-forwarded-for`, mengambil entri tepercaya dari proxy terdekat
 * dan memvalidasi sintaks IPv4/IPv6 agar tidak dapat di-spoof atau diinjeksi string berbahaya.
 */
export function getClientIp(request: Request): string | null {
  const vercelIp = request.headers.get('x-vercel-forwarded-for')?.trim();
  if (vercelIp && isValidIp(vercelIp)) return vercelIp;

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim());
    // Pada multi-proxy chaining, entri terakhir di-append oleh proxy tepercaya
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts[i];
      if (candidate && isValidIp(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}
