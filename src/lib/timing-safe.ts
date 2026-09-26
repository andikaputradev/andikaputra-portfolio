import crypto from 'node:crypto';

/**
 * Constant-time comparison untuk secret / token autentikasi.
 * Menggunakan HMAC-SHA256 untuk memetakan input berapa pun panjangnya
 * ke digest 32-byte konstan, sehingga panjang input tidak pernah bocor
 * melalui timing analysis sebelum timingSafeEqual dieksekusi.
 */
export function timingSafeSecretCompare(
  providedHeader: string | null | undefined,
  expectedSecret: string | undefined,
): boolean {
  if (!providedHeader || !expectedSecret) return false;
  const expectedHeader = `Bearer ${expectedSecret}`;

  // Menggunakan key acak atau statis internal per proses untuk HMAC
  const hmacKey = 'wap-auth-timing-guard';
  const providedHash = crypto.createHmac('sha256', hmacKey).update(providedHeader).digest();
  const expectedHash = crypto.createHmac('sha256', hmacKey).update(expectedHeader).digest();

  return crypto.timingSafeEqual(providedHash, expectedHash);
}

