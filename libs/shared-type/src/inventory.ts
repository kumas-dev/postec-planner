import { z } from 'zod'

export const FindInventoriesSchema = z.object({
  warehouseId: z.string(),
  productId: z.string().nullish(),
  serialNumber: z.string().nullish(),
})

export type FindInventoriesDto = z.infer<typeof FindInventoriesSchema>
export type FindInventoriesInput = z.input<typeof FindInventoriesSchema>

export const TransferInventorySchema = z.object({
  sourceWarehouseId: z.string(),
  destinationWarehouseId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  serialNumber: z.string().optional().catch(undefined),
})

export type TransferInventoryDto = z.infer<typeof TransferInventorySchema>
export type TransferInventoryInput = z.input<typeof TransferInventorySchema>
