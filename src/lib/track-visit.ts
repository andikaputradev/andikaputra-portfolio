import { waitUntil, geolocation, ipAddress } from '@vercel/functions';
import { db } from '../db';
import { pageViews } from '../db/schema';
import { BOT_PATTERN, resolveDeviceType, computeDailyVisitorHash } from './visitor-detection';
import { getClientIp } from './client-ip';

export function isPrefetch(request: Request): boolean {
  const purpose =
    request.headers.get('purpose') ??
    request.headers.get('sec-purpose') ??
    request.headers.get('x-purpose') ??
    request.headers.get('x-moz');

  if (purpose && /prefetch|prerender|preview/i.test(purpose)) {
    return true;
  }

  if (request.headers.get('x-astro-prefetch') === 'true') {
    return true;
  }

  return false;
}

export async function recordVisit(request: Request, path: string): Promise<boolean> {
  if (isPrefetch(request)) return false;

  const userAgent = request.headers.get('user-agent') ?? '';
  if (!userAgent || BOT_PATTERN.test(userAgent)) return false;

  let country: string | undefined;
  try {
    country = geolocation(request).country;
  } catch {
    country = undefined;
  }

  const deviceType = resolveDeviceType(userAgent);
  const referrer = request.headers.get('referer');

  const secret = import.meta.env?.VISITOR_HASH_SECRET ?? process.env.VISITOR_HASH_SECRET;
  const ip = getClientIp(request) ?? ipAddress(request);
  const visitorHash = secret && ip ? computeDailyVisitorHash({ ip, userAgent, secret }) : null;

  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '');

  try {
    await db
      .insert(pageViews)
      .values({ path: normalizedPath, referrer: referrer ?? null, country: country ?? null, deviceType, visitorHash });
    return true;
  } catch (error: unknown) {
    console.error('trackVisit gagal (non-blocking):', error instanceof Error ? error.message : error);
    return false;
  }
}

export function trackVisit(request: Request, path: string): void {
  waitUntil(
    recordVisit(request, path).then(() => undefined),
  );
}

