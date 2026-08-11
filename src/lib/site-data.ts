import { db } from '../db';
import { siteProfile } from '../db/schema';

export async function getSiteProfile() {
  const [profile] = await db.select().from(siteProfile).limit(1);
  return profile ?? null;
}
