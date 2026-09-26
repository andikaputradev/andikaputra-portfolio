import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment');
}

const sql = neon(databaseUrl);

async function main() {
  console.log('Applying migration for article_comments...');

  try {
    await sql`ALTER TYPE "public"."audit_entity_type" ADD VALUE IF NOT EXISTS 'comment'`;
    console.log('✓ audit_entity_type updated with comment');
  } catch (err) {
    console.log('Notice: audit_entity_type add value:', (err as Error).message);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS "article_comments" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "article_id" integer NOT NULL,
      "author_name" text NOT NULL,
      "rating" integer NOT NULL,
      "content" text NOT NULL,
      "approved" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  console.log('✓ article_comments table verified/created');

  try {
    await sql`
      ALTER TABLE "article_comments"
      ADD CONSTRAINT "article_comments_article_id_articles_id_fk"
      FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action
    `;
    console.log('✓ foreign key added');
  } catch (err) {
    console.log('Notice: foreign key:', (err as Error).message);
  }

  try {
    await sql`
      CREATE INDEX IF NOT EXISTS "article_comments_article_id_approved_idx"
      ON "article_comments" USING btree ("article_id", "approved", "created_at" DESC NULLS LAST)
    `;
    console.log('✓ index created');
  } catch (err) {
    console.log('Notice: index:', (err as Error).message);
  }

  console.log('Migration completed successfully!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
