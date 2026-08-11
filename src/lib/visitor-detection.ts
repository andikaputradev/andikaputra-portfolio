import { createHash } from 'node:crypto';

export const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|pingdom|uptimerobot|ahrefs|semrush/i;

export function resolveDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  if (/ipad|tablet/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|android/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

interface DailyVisitorHashInput {
  ip: string;
  userAgent: string;
  secret: string;
  /** Format YYYY-MM-DD; default hari ini (UTC). Parameter eksplisit hanya untuk pengujian. */
  date?: string;
}

/**
 * Hash berputar harian untuk menghitung pengunjung unik tanpa cookie dan
 * tanpa menyimpan IP. IP+UA hanya dipakai SESAAT sebagai input hash pada
 * request ini — hash SHA-256 satu arah, dipotong 16 karakter heksadesimal,
 * dan salt tanggal berganti tiap hari sehingga hash yang sama tidak pernah
 * cocok lintas hari (tidak ada pelacakan pengunjung antar sesi/hari).
 */
export function computeDailyVisitorHash({ ip, userAgent, secret, date }: DailyVisitorHashInput): string {
  const day = date ?? new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${secret}:${day}:${ip}:${userAgent}`).digest('hex').slice(0, 16);
}
