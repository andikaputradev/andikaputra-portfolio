import { sql, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { db } from '../db';
import type { ReorderInput } from './reorder-schema';

interface OrderableTable extends PgTable {
  id: PgColumn;
  displayOrder: PgColumn;
}

export async function bulkUpdateDisplayOrder(table: OrderableTable, items: ReorderInput): Promise<void> {
  const idCol = sql.identifier(table.id.name);
  const orderCol = sql.identifier(table.displayOrder.name);
  const caseClauses: SQL[] = items.map((item) => sql`WHEN ${item.id} THEN ${item.displayOrder}`);
  const ids = items.map((item) => item.id);

  await db.execute(sql`
    UPDATE ${table}
    SET ${orderCol} = CASE ${idCol}
      ${sql.join(caseClauses, sql` `)}
      ELSE ${orderCol}
    END
    WHERE ${idCol} IN ${ids}
  `);
}
