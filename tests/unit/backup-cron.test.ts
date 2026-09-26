import { describe, expect, it } from 'vitest';
import { timingSafeSecretCompare } from '../../src/lib/timing-safe';

describe('timingSafeSecretCompare', () => {
  const secret = 'super-secure-cron-secret-12345';

  it('returns true when Authorization header exactly matches Bearer <secret>', () => {
    expect(timingSafeSecretCompare(`Bearer ${secret}`, secret)).toBe(true);
  });

  it('returns false when secret does not match', () => {
    expect(timingSafeSecretCompare('Bearer wrong-secret', secret)).toBe(false);
  });

  it('returns false when header prefix is missing or incorrect', () => {
    expect(timingSafeSecretCompare(secret, secret)).toBe(false);
    expect(timingSafeSecretCompare(`Basic ${secret}`, secret)).toBe(false);
    expect(timingSafeSecretCompare(`bearer ${secret}`, secret)).toBe(false);
  });

  it('returns false when header is null or undefined or empty', () => {
    expect(timingSafeSecretCompare(null, secret)).toBe(false);
    expect(timingSafeSecretCompare('', secret)).toBe(false);
    expect(timingSafeSecretCompare(`Bearer ${secret}`, '')).toBe(false);
  });

  it('returns false for headers of different lengths without throwing error', () => {
    expect(timingSafeSecretCompare('Bearer s', secret)).toBe(false);
    expect(timingSafeSecretCompare(`Bearer ${secret}extralongstring`, secret)).toBe(false);
  });
});
