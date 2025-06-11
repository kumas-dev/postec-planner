import { defaultKyselyContext } from '@/common/postec-task-client'
import { migrateInventoryHistory } from '@/common/legacy-types'
import { InventoryHistoryEntity } from '.'

async function insertInventoryHistory(
  value: InventoryHistoryEntity,
  { db } = defaultKyselyContext,
): Promise<InventoryHistoryEntity | null> {
  const {
    inventoryId,
    productId,
    quantity,
    sourceWarehouseId,
    destinationWarehouseId,
    employeeId,
    registeredAt,
  } = value

  const row = await db
    .insertInto('Goods_History')
    .values({
      HISTORY_SN: inventoryId,
      HISTORY_CODE: productId,
      HISTORY_EA: quantity,
      HISTORY_DEPOT_OLD: sourceWarehouseId,
      HISTORY_DEPOT_NEW: destinationWarehouseId,
      INPUT_DATE: registeredAt,
      HISTORY_DATE: registeredAt,
      HISTORY_STAFF: employeeId,
      HISTORY_CONTENT: '',
    })
    .returningAll()
    .executeTakeFirst()

  return row ? migrateInventoryHistory(row) : null
}

export const inventoryHistoryRepository = {
  insertInventoryHistory,
}
