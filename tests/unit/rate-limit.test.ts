import { describe, expect, it } from 'vitest';
import { computeWindow } from '../../src/lib/rate-limit-window';

describe('computeWindow', () => {
  it('membulatkan windowStart ke bawah ke kelipatan windowMs terdekat', () => {
    const now = new Date('2026-08-09T10:00:37.123Z').getTime();
    const { windowStart } = computeWindow(now, 60_000);
    expect(windowStart.toISOString()).toBe('2026-08-09T10:00:00.000Z');
  });

  it('resetAt persis windowMs setelah windowStart', () => {
    const now = new Date('2026-08-09T10:00:37.123Z').getTime();
    const { windowStart, resetAt } = computeWindow(now, 60_000);
    expect(resetAt.getTime() - windowStart.getTime()).toBe(60_000);
  });

  it('dua timestamp dalam window yang sama menghasilkan windowStart identik', () => {
    const a = computeWindow(new Date('2026-08-09T10:00:00.000Z').getTime(), 60_000);
    const b = computeWindow(new Date('2026-08-09T10:00:59.999Z').getTime(), 60_000);
    expect(a.windowStart.getTime()).toBe(b.windowStart.getTime());
  });

  it('timestamp di window berikutnya menghasilkan windowStart berbeda', () => {
    const a = computeWindow(new Date('2026-08-09T10:00:59.999Z').getTime(), 60_000);
    const b = computeWindow(new Date('2026-08-09T10:01:00.000Z').getTime(), 60_000);
    expect(a.windowStart.getTime()).not.toBe(b.windowStart.getTime());
  });
});
