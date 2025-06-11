import { Request, Response } from 'express'
import {
  findInventoryDetailsByWarehouseId,
  InventoryEntity,
  transferInventory,
} from '.'
import { extractEmployeeId } from '@/common/utils/extract-employee-id'
import { parseOrThrow } from '@/common/utils'
import {
  FindInventoriesSchema,
  TransferInventorySchema,
} from '@repo/shared-type'
import { createRouter } from '@/common/router'

async function findInventoriesAction(
  { query }: Request,
  res: Response<{ data: { inventories: InventoryEntity[] } }>,
) {
  const employeeId = extractEmployeeId(res)

  const { warehouseId, productId, serialNumber } = parseOrThrow(
    FindInventoriesSchema,
    query,
  )

  const inventories = await findInventoryDetailsByWarehouseId({
    warehouseId,
    ...(productId && { productId }),
    ...(serialNumber && { serialNumber }),
  })

  res.json({
    data: { inventories },
  })
}

async function transferInventoryAction(
  { body }: Request,
  res: Response<unknown>,
) {
  const employeeId = extractEmployeeId(res)

  const {
    sourceWarehouseId,
    destinationWarehouseId,
    productId,
    quantity,
    serialNumber,
  } = parseOrThrow(TransferInventorySchema, body)

  await transferInventory({
    sourceWarehouseId,
    destinationWarehouseId,
    productId,
    quantity,
    employeeId,
    serialNumber,
  })

  res.sendStatus(200)
}

export function router() {
  return createRouter()
    .get('/', findInventoriesAction)
    .post('/transfer', transferInventoryAction)
    .build()
}
