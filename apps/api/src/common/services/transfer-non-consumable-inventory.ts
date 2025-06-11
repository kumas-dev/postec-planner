import { inventoryRepository } from '../../inventory'
import {
  InventoryHistory,
  inventoryHistoryRepository,
} from '../../inventory-history'
import { productRepository } from '../../product'
import { BadRequestError } from '../types'
import { uuidv4 } from '../utils'

export async function transferNonConsumableInventory(
  {
    sourceWarehouseId,
    destinationWarehouseId,
    productId,
    employeeId,
    serialNumber,
  }: {
    sourceWarehouseId: string
    destinationWarehouseId: string
    productId: string
    employeeId: string
    serialNumber: string
  },
  {
    findProductOrNull,
    insertInventoryHistory,
    findOrCreateNonConsumableInventory,
    relocateInventory,
  }: {
    findProductOrNull: typeof productRepository.findProductOrNull
    insertInventoryHistory: typeof inventoryHistoryRepository.insertInventoryHistory
    findOrCreateNonConsumableInventory: typeof inventoryRepository.findOrCreateNonConsumableInventory
    relocateInventory: typeof inventoryRepository.relocateInventory
  },
): Promise<void> {
  const product = await findProductOrNull(productId)

  if (!product) {
    throw new BadRequestError({ message: '등록되지 않은 제품입니다.' })
  }

  if (product.isConsumable) {
    throw new BadRequestError({ message: '잘못된 제품 타입입니다.' })
  }

  const inventory = await findOrCreateNonConsumableInventory({
    serialNumber,
    productId,
    warehouseId: sourceWarehouseId,
  })

  if (inventory.warehouseId !== sourceWarehouseId) {
    throw new BadRequestError({
      message: '출고 하려는 창고에 해당 제품이 없습니다.',
    })
  }

  if (inventory.productId !== product.id) {
    throw new BadRequestError({
      message: '상품 코드가 잘못 되었습니다.',
    })
  }

  await relocateInventory({
    id: inventory.id,
    destinationWarehouseId,
  })

  const inventoryHistory: InventoryHistory = {
    id: uuidv4(),
    inventoryId: inventory.id,
    productId: product.id,
    quantity: 1,
    sourceWarehouseId,
    destinationWarehouseId,
    employeeId,
    registeredAt: new Date(),
  }

  await await insertInventoryHistory(inventoryHistory)
}
