import { InventoryHistoryEntity } from '@/inventory-history'
import { Generated, Selectable } from 'kysely'
import { localToUTC } from '../utils/date'

export type GoodsHistory = {
  SN: Generated<number>
  HISTORY_SN: string
  HISTORY_CODE: string
  HISTORY_EA: number
  HISTORY_DEPOT_OLD: string
  HISTORY_DEPOT_NEW: string
  INPUT_DATE: Date
  HISTORY_DATE: Date
  HISTORY_STAFF: string
  HISTORY_CONTENT: string
}

export function migrateInventoryHistory(
  inventoryHistory: Selectable<GoodsHistory>,
): InventoryHistoryEntity {
  const {
    SN,
    INPUT_DATE,
    HISTORY_CODE,
    HISTORY_DEPOT_NEW,
    HISTORY_DEPOT_OLD,
    HISTORY_EA,
    HISTORY_SN,
    HISTORY_STAFF,
  } = inventoryHistory

  return {
    id: `${SN}`,
    inventoryId: HISTORY_SN,
    productId: HISTORY_CODE,
    sourceWarehouseId: HISTORY_DEPOT_OLD,
    destinationWarehouseId: HISTORY_DEPOT_NEW,
    quantity: HISTORY_EA,
    employeeId: HISTORY_STAFF,
    registeredAt: localToUTC(INPUT_DATE),
  }
}
