import { inventoryRepository } from '../../inventory'
import {
  InventoryHistory,
  inventoryHistoryRepository,
} from '../../inventory-history'
import { productRepository } from '../../product'
import { BadRequestError } from '../types'
import { uuidv4 } from '../utils'

export async function transferConsumableInventory(
  {
    sourceWarehouseId,
    destinationWarehouseId,
    productId,
    quantity,
    employeeId,
  }: {
    sourceWarehouseId: string
    destinationWarehouseId: string
    productId: string
    quantity: number
    employeeId: string
  },
  {
    findProductOrNull,
    transferInventory,
    findOrCreateConsumableInventory,
    insertInventoryHistory,
  }: {
    findProductOrNull: typeof productRepository.findProductOrNull
    transferInventory: typeof inventoryRepository.transferInventory
    findOrCreateConsumableInventory: typeof inventoryRepository.findOrCreateConsumableInventory
    insertInventoryHistory: typeof inventoryHistoryRepository.insertInventoryHistory
  },
): Promise<void> {
  const product = await findProductOrNull(productId)

  if (!product) {
    throw new BadRequestError({ message: '등록되지 않은 제품입니다.' })
  }

  if (!product.isConsumable) {
    throw new BadRequestError({ message: '잘못된 제품 타입입니다.' })
  }

  const [sourceInventory] = await Promise.all([
    findOrCreateConsumableInventory({
      productId,
      warehouseId: sourceWarehouseId,
    }),
    findOrCreateConsumableInventory({
      productId,
      warehouseId: destinationWarehouseId,
    }),
  ])

  if (quantity > sourceInventory.quantity) {
    throw new BadRequestError({ message: '출고 가능한 수량을 초과했습니다.' })
  }

  await transferInventory({
    productId,
    quantity,
    destinationWarehouseId,
    sourceWarehouseId,
  })

  const inventoryHistory: InventoryHistory = {
    id: uuidv4(),
    inventoryId: '0',
    productId,
    quantity,
    sourceWarehouseId,
    destinationWarehouseId,
    employeeId,
    registeredAt: new Date(),
  }

  await insertInventoryHistory(inventoryHistory)
}
