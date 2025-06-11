import { InventoryDetail, inventoryRepository } from '.'
import { transferConsumableInventory } from '../common/services/transfer-consumable-inventory'
import { transferNonConsumableInventory } from '../common/services/transfer-non-consumable-inventory'
import { deduplicate } from '../common/utils'
import { inventoryHistoryRepository } from '../inventory-history'
import { partnerRepository } from '../partner'
import { productRepository } from '../product/product.repository'
import { warehouseRepository } from '../warehouse'

export async function findInventoryDetailsByWarehouseId(
  {
    warehouseId,
    productId,
    serialNumber,
  }: { warehouseId: string; productId?: string; serialNumber?: string },
  {
    findInventories = inventoryRepository.findInventories,
    findProductsByIds = productRepository.findProductsByIds,
    findWarehouses = warehouseRepository.findWarehouses,
    findPartnersByIds = partnerRepository.findPartnersByIds,
  } = {},
): Promise<InventoryDetail[]> {
  const inventories = await findInventories({
    warehouseId,
    productId,
    serialNumber,
  })

  const productIds = deduplicate(inventories.map((e) => e.productId))

  const products = await findProductsByIds(productIds)
  const [warehouse] = await findWarehouses([warehouseId])
  const [partner] = await findPartnersByIds([warehouseId])

  return inventories
    .map<InventoryDetail | null>((Inventory) => {
      const { productId, warehouseId: _, ...rest } = Inventory
      const product = products.find((product) => product.id === productId)

      if (!product) {
        return null
      }

      return {
        ...rest,
        product,
        warehouse: warehouse ?? partner,
      }
    })
    .filter((v) => !!v)
}

export async function transferInventory(
  {
    sourceWarehouseId,
    destinationWarehouseId,
    productId,
    quantity,
    employeeId,
    serialNumber,
  }: {
    sourceWarehouseId: string
    destinationWarehouseId: string
    productId: string
    quantity: number
    employeeId: string
    serialNumber?: string
  },
  {
    findProductOrNull = productRepository.findProductOrNull,
    transferInventory = inventoryRepository.transferInventory,
    findOrCreateConsumableInventory = inventoryRepository.findOrCreateConsumableInventory,
    insertInventoryHistory = inventoryHistoryRepository.insertInventoryHistory,
    findOrCreateNonConsumableInventory = inventoryRepository.findOrCreateNonConsumableInventory,
    relocateInventory = inventoryRepository.relocateInventory,
  } = {},
): Promise<void> {
  if (serialNumber) {
    await transferNonConsumableInventory(
      {
        sourceWarehouseId,
        destinationWarehouseId,
        productId,
        employeeId,
        serialNumber,
      },
      {
        findProductOrNull,
        insertInventoryHistory,
        findOrCreateNonConsumableInventory,
        relocateInventory,
      },
    )
  } else {
    await transferConsumableInventory(
      {
        sourceWarehouseId,
        destinationWarehouseId,
        productId,
        quantity,
        employeeId,
      },
      {
        findProductOrNull,
        transferInventory,
        findOrCreateConsumableInventory,
        insertInventoryHistory,
      },
    )
  }
}
