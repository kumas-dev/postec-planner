import { InventoryEntity } from '@/inventory'
import { localToUTC } from '../utils/date'
import { Generated, Selectable } from 'kysely'

export type GoodsStock = {
  SN: Generated<string>
  GOODS_CODE: string
  GOODS_USE: number
  GOODS_EA: number
  SERIAL_NO: string
  GOODS_DEPOT: string
  INPUT_DATE: Date
}
export function migrateInventory(
  data: Selectable<GoodsStock>,
): InventoryEntity {
  const { SN, GOODS_CODE, SERIAL_NO, GOODS_EA, GOODS_DEPOT, INPUT_DATE } = data

  return {
    id: `${SN}`,
    productId: GOODS_CODE,
    quantity: GOODS_EA,
    ...(SERIAL_NO && { serialNumber: SERIAL_NO }),
    warehouseId: GOODS_DEPOT,
    registeredAt: localToUTC(INPUT_DATE),
  }
}
