export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}

export const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = { windowMs: 60_000, max: 60 };

export function computeWindow(now: number, windowMs: number): { windowStart: Date; resetAt: Date } {
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const resetAt = new Date(windowStart.getTime() + windowMs);
  return { windowStart, resetAt };
}
