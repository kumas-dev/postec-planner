import { z } from 'zod'

export const FindProductsSchema = z.object({
  name: z.string(),
})

export type FindProductsDto = z.infer<typeof FindProductsSchema>
export type FindProductsInput = z.input<typeof FindProductsSchema>
