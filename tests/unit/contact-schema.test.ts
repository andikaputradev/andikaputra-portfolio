import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { ContactSchema } from '../../src/lib/contact-schema';

const validInput = {
  name: 'Wahyu Andika Putra',
  email: 'wahyu@example.com',
  message: 'This is a legitimate inquiry about a security engagement.',
  honeypot: '',
  turnstileToken: 'valid-token-abc123',
};

describe('ContactSchema', () => {
  it('accepts fully valid input', () => {
    const result = ContactSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const result = ContactSchema.safeParse({ ...validInput, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects when the honeypot field is filled', () => {
    const result = ContactSchema.safeParse({ ...validInput, honeypot: 'bot-filled-this' });
    expect(result.success).toBe(false);
  });

  it('rejects a message shorter than 10 characters', () => {
    const result = ContactSchema.safeParse({ ...validInput, message: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects a message longer than 2000 characters', () => {
    const result = ContactSchema.safeParse({ ...validInput, message: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = ContactSchema.safeParse({ ...validInput, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 100 characters', () => {
    const result = ContactSchema.safeParse({ ...validInput, name: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects an empty turnstileToken', () => {
    const result = ContactSchema.safeParse({ ...validInput, turnstileToken: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a payload missing required fields entirely', () => {
    const result = ContactSchema.safeParse({ name: 'Wahyu' });
    expect(result.success).toBe(false);
  });

  it('z.flattenError().fieldErrors mengidentifikasi email sebagai satu-satunya field bermasalah', () => {
    const result = ContactSchema.safeParse({ ...validInput, email: 'fggff@mm.c' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(fieldErrors.email?.length).toBeGreaterThan(0);
      expect(fieldErrors.name).toBeUndefined();
      expect(fieldErrors.message).toBeUndefined();
    }
  });

  it('z.flattenError().fieldErrors mengidentifikasi turnstileToken tanpa menyentuh field lain', () => {
    const result = ContactSchema.safeParse({ ...validInput, turnstileToken: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(fieldErrors.turnstileToken?.length).toBeGreaterThan(0);
      expect(fieldErrors.email).toBeUndefined();
    }
  });
});
