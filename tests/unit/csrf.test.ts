import { describe, expect, it } from 'vitest';
import { generateCsrfToken, verifyCsrfToken } from '../../src/lib/csrf';

describe('generateCsrfToken', () => {
  it('menghasilkan token hex sepanjang 48 karakter (24 bytes)', () => {
    const token = generateCsrfToken();
    expect(token).toMatch(/^[0-9a-f]{48}$/);
  });

  it('menghasilkan token berbeda pada setiap pemanggilan', () => {
    const a = generateCsrfToken();
    const b = generateCsrfToken();
    expect(a).not.toBe(b);
  });
});

describe('verifyCsrfToken', () => {
  it('menerima ketika cookie dan header identik', () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token, token)).toBe(true);
  });

  it('menolak ketika cookie dan header berbeda', () => {
    expect(verifyCsrfToken(generateCsrfToken(), generateCsrfToken())).toBe(false);
  });

  it('menolak ketika cookie tidak ada', () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(undefined, token)).toBe(false);
  });

  it('menolak ketika header tidak ada', () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token, undefined)).toBe(false);
  });

  it('menolak ketika keduanya kosong', () => {
    expect(verifyCsrfToken(null, null)).toBe(false);
  });

  it('menolak ketika panjang berbeda (menghindari crash timingSafeEqual)', () => {
    expect(verifyCsrfToken('abc', 'abcdef')).toBe(false);
  });
});
