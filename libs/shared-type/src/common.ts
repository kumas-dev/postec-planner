import { z } from 'zod'

export const IdSchema = z.object({
  id: z.string(),
})
export type IdDto = z.infer<typeof IdSchema>
export type IdInput = z.input<typeof IdSchema>
