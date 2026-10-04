import { describe, expect, it } from 'vitest';
import { CommentInputSchema, escapeHtml } from '../../src/lib/comment-schema';

describe('CommentInputSchema', () => {
  const validComment = {
    authorName: 'Ahmad Faiz',
    rating: 5,
    content: 'Artikel sangat berbobot dan pembahasannya mendalam mengenai security.',
    honeypot: '',
  };

  it('menerima ulasan komentar yang valid', () => {
    const result = CommentInputSchema.safeParse(validComment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
      expect(result.data.authorName).toBe('Ahmad Faiz');
    }
  });

  it('menerima rating 1 sampai 5 bintang', () => {
    for (let r = 1; r <= 5; r++) {
      const result = CommentInputSchema.safeParse({ ...validComment, rating: r });
      expect(result.success).toBe(true);
    }
  });

  it('menolak rating di bawah 1 atau di atas 5 bintang', () => {
    expect(CommentInputSchema.safeParse({ ...validComment, rating: 0 }).success).toBe(false);
    expect(CommentInputSchema.safeParse({ ...validComment, rating: 6 }).success).toBe(false);
    expect(CommentInputSchema.safeParse({ ...validComment, rating: -1 }).success).toBe(false);
  });

  it('menolak rating desimal non-integer', () => {
    expect(CommentInputSchema.safeParse({ ...validComment, rating: 4.5 }).success).toBe(false);
  });

  it('menolak nama kurang dari 2 karakter atau lebih dari 50 karakter', () => {
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: 'A' }).success).toBe(false);
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: 'A'.repeat(51) }).success).toBe(false);
  });

  it('menolak karakter tag HTML berbahaya pada authorName', () => {
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: '<script>alert(1)</script>' }).success).toBe(false);
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: 'Faiz "Admin"' }).success).toBe(false);
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: 'Faiz & Putra' }).success).toBe(false);
  });

  it('mengizinkan tanda petik tunggal/apostrof dan tanda hubung pada authorName yang sah', () => {
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: "Faiz D'Angelo" }).success).toBe(true);
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: "Siti Nur'aini" }).success).toBe(true);
    expect(CommentInputSchema.safeParse({ ...validComment, authorName: 'Ahmad-Faiz' }).success).toBe(true);
  });

  it('menolak isi komentar kurang dari 3 karakter atau lebih dari 1000 karakter', () => {
    expect(CommentInputSchema.safeParse({ ...validComment, content: 'ok' }).success).toBe(false);
    expect(CommentInputSchema.safeParse({ ...validComment, content: 'x'.repeat(1001) }).success).toBe(false);
  });

  it('menolak jika honeypot terisi (indikasi spam bot)', () => {
    expect(CommentInputSchema.safeParse({ ...validComment, honeypot: 'http://spam.ru' }).success).toBe(false);
  });

  it('menolak field tidak dikenal via .strict() (pencegahan mass assignment)', () => {
    const result = CommentInputSchema.safeParse({
      ...validComment,
      approved: true,
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('escapeHtml sanitization', () => {
  it('mengonversi seluruh karakter HTML berbahaya ke entitas aman', () => {
    const malicious = '<script>alert("XSS & attacks \'here\'")</script>';
    const sanitized = escapeHtml(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS &amp; attacks &#39;here&#39;&quot;)&lt;/script&gt;');
  });

  it('membiarkan teks biasa tanpa karakter khusus tetap utuh', () => {
    const normal = 'Tulisan yang sangat bagus dan rapi.';
    expect(escapeHtml(normal)).toBe(normal);
  });
});
