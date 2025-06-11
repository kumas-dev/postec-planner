import { z } from 'zod'

export const FindPartnersSchema = z.object({
  name: z.string(),
})

export type FindPartnersDto = z.infer<typeof FindPartnersSchema>
export type FindPartnersInput = z.input<typeof FindPartnersSchema>
