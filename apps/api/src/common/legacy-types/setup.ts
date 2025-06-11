import { WarehouseEntity } from '@/warehouse'

export type Setup = {
  ROW_NUMBER: number
  SET_DESC: string
  SET_CODE: number
}

export function migrateWarehouse(warehouse: Setup): WarehouseEntity {
  const { ROW_NUMBER, SET_DESC } = warehouse

  return {
    id: `${(ROW_NUMBER - 1).toString().padStart(2, '0')}`,
    name: SET_DESC,
  }
}
