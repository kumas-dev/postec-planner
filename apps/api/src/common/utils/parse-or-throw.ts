import { ZodType, z } from 'zod'
import { BadRequestError } from '../types'

export function parseOrThrow<T extends ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new BadRequestError({
      message: 'Invalid request',
      error: result.error,
    })
  }

  return result.data
}
