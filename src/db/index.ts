import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || import.meta.env?.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('[DB Error]: DATABASE_URL tidak ditemukan. Pastikan file .env sudah diisi.');
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });