import { waitUntil, geolocation, ipAddress } from '@vercel/functions';
import { db } from '../db';
import { pageViews } from '../db/schema';
import { BOT_PATTERN, resolveDeviceType, computeDailyVisitorHash } from './visitor-detection';

export function trackVisit(request: Request, path: string): void {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (BOT_PATTERN.test(userAgent)) return;

  let country: string | undefined;
  try {
    country = geolocation(request).country;
  } catch {
    country = undefined;
  }

  const deviceType = resolveDeviceType(userAgent);
  const referrer = request.headers.get('referer');

  const secret = import.meta.env.VISITOR_HASH_SECRET;
  const ip = ipAddress(request);
  const visitorHash = secret && ip ? computeDailyVisitorHash({ ip, userAgent, secret }) : null;

  waitUntil(
    db
      .insert(pageViews)
      .values({ path, referrer: referrer ?? null, country: country ?? null, deviceType, visitorHash })
      .then(() => undefined)
      .catch((error: unknown) => {
        console.error('trackVisit gagal (non-blocking):', error instanceof Error ? error.message : error);
      }),
  );
}
