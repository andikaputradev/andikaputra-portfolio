import { sql, gte, desc } from 'drizzle-orm';
import { db } from '../db';
import { pageViews } from '../db/schema';

export interface DailyCount {
  date: string;
  count: number;
}

export interface PathCount {
  path: string;
  count: number;
}

export interface DeviceCount {
  deviceType: string;
  count: number;
}

export interface VisitorSummary {
  daily: DailyCount[];
  topPages: PathCount[];
  byDevice: DeviceCount[];
  totalViews: number;
  totalUniqueVisitors: number;
}

export async function getVisitorSummary(days = 30): Promise<VisitorSummary> {
  const since = new Date(Date.now() - days * 86_400_000);

  const daily = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${pageViews.visitedAt}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(pageViews)
    .where(gte(pageViews.visitedAt, since))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  const topPages = await db
    .select({
      path: pageViews.path,
      count: sql<number>`count(*)::int`,
    })
    .from(pageViews)
    .where(gte(pageViews.visitedAt, since))
    .groupBy(pageViews.path)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const byDevice = await db
    .select({
      deviceType: pageViews.deviceType,
      count: sql<number>`count(*)::int`,
    })
    .from(pageViews)
    .where(gte(pageViews.visitedAt, since))
    .groupBy(pageViews.deviceType);

  // COUNT(DISTINCT ...) mengabaikan NULL secara otomatis, sehingga baris
  // page_views lama (sebelum visitor_hash ada) tidak memengaruhi angka ini —
  // hanya tidak ikut dihitung, bukan menyebabkan galat.
  const [{ uniqueVisitors }] = await db
    .select({ uniqueVisitors: sql<number>`count(distinct ${pageViews.visitorHash})::int` })
    .from(pageViews)
    .where(gte(pageViews.visitedAt, since));

  return {
    daily,
    topPages,
    byDevice,
    totalViews: daily.reduce((sum, d) => sum + d.count, 0),
    totalUniqueVisitors: uniqueVisitors,
  };
}
