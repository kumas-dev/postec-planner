export type InventoryEntity = {
  id: string
  productId: string
  serialNumber?: string
  quantity: number
  warehouseId: string
  registeredAt: Date
}
