export type InventoryHistoryEntity = {
  id: string
  inventoryId: string
  productId: string
  quantity: number
  sourceWarehouseId: string
  destinationWarehouseId: string
  registeredAt: Date
  employeeId: string
}
