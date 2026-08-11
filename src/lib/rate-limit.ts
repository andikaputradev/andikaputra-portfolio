import { sql, lt } from 'drizzle-orm';
import { db } from '../db';
import { rateLimitLog } from '../db/schema';
import {
  computeWindow,
  DEFAULT_RATE_LIMIT_OPTIONS,
  type RateLimitOptions,
  type RateLimitResult,
} from './rate-limit-window';

export type { RateLimitOptions, RateLimitResult };
export { computeWindow };

const CLEANUP_PROBABILITY = 0.02;
const CLEANUP_MAX_AGE_MS = 60 * 60 * 1000;

export async function checkRateLimit(
  bucket: string,
  options: RateLimitOptions = DEFAULT_RATE_LIMIT_OPTIONS,
): Promise<RateLimitResult> {
  const { windowStart, resetAt } = computeWindow(Date.now(), options.windowMs);

  const [row] = await db
    .insert(rateLimitLog)
    .values({ bucket, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimitLog.bucket, rateLimitLog.windowStart],
      set: { count: sql`${rateLimitLog.count} + 1` },
    })
    .returning({ count: rateLimitLog.count });

  const count = row?.count ?? 1;

  if (Math.random() < CLEANUP_PROBABILITY) {
    void cleanupOldEntries();
  }

  return {
    allowed: count <= options.max,
    remaining: Math.max(0, options.max - count),
    limit: options.max,
    resetAt,
  };
}

async function cleanupOldEntries(): Promise<void> {
  const cutoff = new Date(Date.now() - CLEANUP_MAX_AGE_MS);
  await db
    .delete(rateLimitLog)
    .where(lt(rateLimitLog.windowStart, cutoff))
    .catch(() => undefined);
}
