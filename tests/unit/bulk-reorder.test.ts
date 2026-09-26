import { describe, expect, it, vi } from 'vitest';
import { bulkUpdateDisplayOrder, type OrderableTable } from '../../src/lib/bulk-reorder';
import { db } from '../../src/db';

vi.mock('../../src/db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('bulkUpdateDisplayOrder', () => {
  const mockTable = {
    id: { name: 'id' },
    displayOrder: { name: 'display_order' },
    updatedAt: { name: 'updated_at' },
  } as unknown as OrderableTable;

  it('early returns cleanly without executing SQL when items is empty', async () => {
    const executeSpy = vi.spyOn(db, 'execute');
    executeSpy.mockClear();

    await bulkUpdateDisplayOrder(mockTable, []);

    expect(executeSpy).not.toHaveBeenCalled();
  });

  it('executes a single atomic UPDATE with CASE WHEN for non-empty items', async () => {
    const executeSpy = vi.spyOn(db, 'execute');
    executeSpy.mockClear();

    const items = [
      { id: 1, displayOrder: 10 },
      { id: 2, displayOrder: 20 },
    ];

    await bulkUpdateDisplayOrder(mockTable, items);

    expect(executeSpy).toHaveBeenCalledTimes(1);
  });
});
