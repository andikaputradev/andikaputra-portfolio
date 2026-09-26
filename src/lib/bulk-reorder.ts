import { sql, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { db } from '../db';
import type { ReorderInput } from './reorder-schema';

/**
 * Concurrency & Atomicity Strategy:
 *
 * Driver Neon HTTP (@neondatabase/serverless over HTTP) tidak mendukung transaksi
 * native multi-statement (BEGIN/COMMIT). Untuk menjaga integritas data tanpa
 * partial write atau race condition saat drag-and-drop reorder, pembaruan
 * displayOrder dieksekusi dalam SATU pernyataan SQL atomik tunggal menggunakan
 * ekspresi `CASE WHEN ... ELSE ... END`.
 *
 * Strategi Locking: Atomic Last-Write-Wins (LWW).
 * Di tingkat PostgreSQL (Read Committed), satu pernyataan UPDATE memegang row-level
 * lock secara eksklusif selama penulisan dan diserialkan secara atomik. Jika dua sesi
 * admin melakukan reorder bersamaan, pembaruan terakhir yang dieksekusi akan menang
 * secara utuh tanpa pernah meninggalkan urutan terpotong (partial write).
 */
export interface OrderableTable extends PgTable {
  id: PgColumn;
  displayOrder: PgColumn;
  updatedAt?: PgColumn;
}

export async function bulkUpdateDisplayOrder(table: OrderableTable, items: ReorderInput): Promise<void> {
  if (!items || items.length === 0) {
    return;
  }

  const idCol = sql.identifier(table.id.name);
  const orderCol = sql.identifier(table.displayOrder.name);
  const caseClauses: SQL[] = items.map((item) => sql`WHEN ${item.id} THEN ${item.displayOrder}`);
  const ids = items.map((item) => item.id);

  const hasUpdatedAt = 'updatedAt' in table && table.updatedAt !== undefined;
  const updateClauses: SQL[] = [
    sql`${orderCol} = CASE ${idCol} ${sql.join(caseClauses, sql` `)} ELSE ${orderCol} END`,
  ];

  if (hasUpdatedAt) {
    const updatedAtCol = sql.identifier((table.updatedAt as PgColumn).name);
    updateClauses.push(sql`${updatedAtCol} = NOW()`);
  }

  await db.execute(sql`
    UPDATE ${table}
    SET ${sql.join(updateClauses, sql`, `)}
    WHERE ${idCol} IN ${ids}
  `);
}
