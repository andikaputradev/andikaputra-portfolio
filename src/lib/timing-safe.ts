import crypto from 'node:crypto';

/**
 * Constant-time comparison untuk secret / token autentikasi.
 * Mencegah serangan timing analysis dengan membandingkan byte buffer
 * secara konsisten terlepas dari kecocokan sebagian (partial match).
 */
export function timingSafeSecretCompare(
  providedHeader: string | null | undefined,
  expectedSecret: string | undefined,
): boolean {
  if (!providedHeader || !expectedSecret) return false;
  const expectedHeader = `Bearer ${expectedSecret}`;
  const providedBuffer = Buffer.from(providedHeader);
  const expectedBuffer = Buffer.from(expectedHeader);

  if (providedBuffer.length !== expectedBuffer.length) {
    crypto.timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}
