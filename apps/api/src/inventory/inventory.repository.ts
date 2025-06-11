import { migrateInventory } from '@/common/legacy-types'
import {
  defaultKyselyContext,
  withTransaction,
} from '@/common/postec-task-client'
import { InventoryEntity } from '.'

async function findInventories(
  {
    warehouseId,
    productId,
    serialNumber,
  }: {
    warehouseId: string
    productId?: string
    serialNumber?: string
  },
  { db } = defaultKyselyContext,
): Promise<InventoryEntity[]> {
  let query = db
    .selectFrom('Goods_Stock')
    .where('GOODS_DEPOT', '=', warehouseId)
    .where('GOODS_USE', '=', 1)
    .where('GOODS_EA', '>', 0)

  if (productId) {
    query = query.where('GOODS_CODE', '=', productId)
  }

  if (serialNumber) {
    query = query.where('SERIAL_NO', '=', serialNumber)
  }

  const rows = await query.selectAll().execute()

  return rows.map(migrateInventory)
}

async function findNonConsumableInventory(
  {
    serialNumber,
  }: {
    serialNumber: string
  },
  { db } = defaultKyselyContext,
): Promise<InventoryEntity | null> {
  const row = await db
    .selectFrom('Goods_Stock')
    .where('GOODS_USE', '=', 1)
    .where('SERIAL_NO', '=', serialNumber)
    .selectAll()
    .executeTakeFirst()

  return row ? migrateInventory(row) : null
}

async function createNonConsumableInventory(
  {
    productId,
    serialNumber,
    warehouseId,
  }: {
    productId: string
    serialNumber: string
    warehouseId: string
  },
  { db } = defaultKyselyContext,
): Promise<InventoryEntity | null> {
  const row = await db
    .insertInto('Goods_Stock')
    .values({
      GOODS_CODE: productId,
      GOODS_USE: 1,
      GOODS_EA: 1,
      SERIAL_NO: serialNumber,
      GOODS_DEPOT: warehouseId,
      INPUT_DATE: new Date(),
    })
    .returningAll()
    .executeTakeFirst()

  return row ? migrateInventory(row) : null
}

async function findConsumableInventory(
  {
    productId,
    warehouseId,
  }: {
    productId: string
    warehouseId: string
  },
  { db } = defaultKyselyContext,
): Promise<InventoryEntity | null> {
  const row = await db
    .selectFrom('Goods_Stock')
    .where('GOODS_USE', '=', 1)
    .where('GOODS_CODE', '=', productId)
    .where('GOODS_DEPOT', '=', warehouseId)
    .selectAll()
    .executeTakeFirst()

  return row ? migrateInventory(row) : null
}

async function createConsumableInventory(
  {
    productId,
    warehouseId,
  }: {
    productId: string
    warehouseId: string
  },
  { db } = defaultKyselyContext,
): Promise<InventoryEntity | null> {
  const row = await db
    .insertInto('Goods_Stock')
    .values({
      GOODS_CODE: productId,
      GOODS_USE: 1,
      GOODS_EA: 0,
      SERIAL_NO: '',
      GOODS_DEPOT: warehouseId,
      INPUT_DATE: new Date(),
    })
    .returningAll()
    .executeTakeFirst()

  return row ? migrateInventory(row) : null
}

async function transferInventory({
  quantity,
  productId,
  sourceWarehouseId,
  destinationWarehouseId,
}: {
  quantity: number
  productId: string
  sourceWarehouseId: string
  destinationWarehouseId: string
}): Promise<void> {
  await withTransaction(async (tx) => {
    await tx
      .updateTable('Goods_Stock')
      .set((eb) => ({
        GOODS_EA: eb('GOODS_EA', '-', quantity),
      }))
      .where('GOODS_USE', '=', 1)
      .where('GOODS_CODE', '=', productId)
      .where('GOODS_DEPOT', '=', sourceWarehouseId)
      .returningAll()
      .executeTakeFirst()

    await tx
      .updateTable('Goods_Stock')
      .set((eb) => ({
        GOODS_EA: eb('GOODS_EA', '+', quantity),
      }))
      .where('GOODS_USE', '=', 1)
      .where('GOODS_CODE', '=', productId)
      .where('GOODS_DEPOT', '=', destinationWarehouseId)
      .returningAll()
      .executeTakeFirst()
  })
}

async function relocateInventory(
  {
    id,
    destinationWarehouseId,
  }: {
    id: string
    destinationWarehouseId: string
  },
  { db } = defaultKyselyContext,
): Promise<InventoryEntity | null> {
  const row = await db
    .updateTable('Goods_Stock')
    .set({
      GOODS_DEPOT: destinationWarehouseId,
    })
    .where('SN', '=', id)
    .returningAll()
    .executeTakeFirst()

  return row ? migrateInventory(row) : null
}

export const inventoryRepository = {
  findInventories,
  findNonConsumableInventory,
  createNonConsumableInventory,
  findConsumableInventory,
  createConsumableInventory,
  transferInventory,
  relocateInventory,
}
