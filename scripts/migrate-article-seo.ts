import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment');
}

const sql = neon(databaseUrl);

async function main() {
  console.log('Applying migration for article SEO overrides...');

  try {
    await sql`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "canonical_url_override" text`;
    console.log('✓ canonical_url_override column added/verified');
  } catch (err) {
    console.log('Notice on canonical_url_override:', (err as Error).message);
  }

  try {
    await sql`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "og_image_override" text`;
    console.log('✓ og_image_override column added/verified');
  } catch (err) {
    console.log('Notice on og_image_override:', (err as Error).message);
  }

  const cols = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'articles'
  `;
  console.log('Updated articles columns:', cols.map((c: { column_name: string }) => c.column_name));
  console.log('Migration completed successfully!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
